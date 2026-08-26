import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";

const SIGNATURE_TOLERANCE_SECONDS = 5 * 60;

function parseStripeSignature(header: string) {
  const values = new Map<string, string[]>();
  for (const part of header.split(",")) {
    const [key, value] = part.trim().split("=", 2);
    if (!key || !value) continue;
    const list = values.get(key) || [];
    list.push(value);
    values.set(key, list);
  }
  return values;
}

function safeEqualHex(leftHex: string, rightHex: string) {
  try {
    const left = Buffer.from(leftHex, "hex");
    const right = Buffer.from(rightHex, "hex");
    return left.length === right.length && timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

function verifyStripeSignature(rawBody: string, signatureHeader: string, secret: string) {
  const parsed = parseStripeSignature(signatureHeader);
  const timestampText = parsed.get("t")?.[0] || "";
  const signatures = parsed.get("v1") || [];
  if (!/^\d+$/.test(timestampText) || signatures.length === 0) return false;

  const timestamp = Number(timestampText);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(timestamp) || Math.abs(now - timestamp) > SIGNATURE_TOLERANCE_SECONDS) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${timestampText}.${rawBody}`, "utf8")
    .digest("hex");

  return signatures.some((signature) => safeEqualHex(signature, expected));
}

function stringOrNull(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function inferPlan(object: any) {
  const metadata = object?.metadata || {};
  const explicit = stringOrNull(metadata.plan) || stringOrNull(metadata.tier);
  if (explicit) return explicit;

  const mode = stringOrNull(object?.mode);
  if (mode === "subscription") return "monthly";
  if (mode === "payment") return "lifetime";
  return null;
}

async function persistEvent(event: any) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const object = event?.data?.object || {};
  const metadata = object?.metadata || {};

  const eventId = stringOrNull(event?.id);
  if (!eventId) throw new Error("Stripe event is missing an id");

  const customerId = stringOrNull(object?.customer);
  const subscriptionId = stringOrNull(object?.subscription);
  const paymentIntentId = stringOrNull(object?.payment_intent);
  const discordUserId = stringOrNull(metadata.discord_user_id) || stringOrNull(metadata.discord_id);
  const guildId = stringOrNull(metadata.guild_id);
  const plan = inferPlan(object);

  const { error: eventError } = await (supabaseAdmin as any)
    .from("stripe_webhook_events")
    .upsert(
      {
        stripe_event_id: eventId,
        event_type: String(event?.type || "unknown"),
        customer_id: customerId,
        subscription_id: subscriptionId,
        payment_intent_id: paymentIntentId,
        discord_user_id: discordUserId,
        guild_id: guildId,
        plan,
        livemode: Boolean(event?.livemode),
        payload: event,
        processed_at: new Date().toISOString(),
      },
      { onConflict: "stripe_event_id" },
    );

  if (eventError) throw new Error(eventError.message || "Could not save Stripe webhook event");

  // Entitlement updates are intentionally metadata-driven. Checkout creation should
  // include discord_user_id, guild_id and plan in Session metadata so the webhook
  // can activate the correct Ware account without trusting client-side state.
  if (!discordUserId) return;

  if (event?.type === "checkout.session.completed") {
    const status = object?.payment_status === "paid" || object?.status === "complete" ? "active" : "pending";
    const { error } = await (supabaseAdmin as any)
      .from("stripe_entitlements")
      .upsert(
        {
          discord_user_id: discordUserId,
          guild_id: guildId,
          plan: plan || "unknown",
          status,
          customer_id: customerId,
          subscription_id: subscriptionId,
          checkout_session_id: stringOrNull(object?.id),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "discord_user_id,guild_id" },
      );
    if (error) throw new Error(error.message || "Could not update Stripe entitlement");
    return;
  }

  if (event?.type === "invoice.paid") {
    await (supabaseAdmin as any)
      .from("stripe_entitlements")
      .update({ status: "active", updated_at: new Date().toISOString() })
      .eq("discord_user_id", discordUserId)
      .eq("subscription_id", subscriptionId);
    return;
  }

  if (event?.type === "invoice.payment_failed") {
    await (supabaseAdmin as any)
      .from("stripe_entitlements")
      .update({ status: "past_due", updated_at: new Date().toISOString() })
      .eq("discord_user_id", discordUserId)
      .eq("subscription_id", subscriptionId);
    return;
  }

  if (event?.type === "customer.subscription.deleted") {
    const targetSubscription = stringOrNull(object?.id) || subscriptionId;
    await (supabaseAdmin as any)
      .from("stripe_entitlements")
      .update({ status: "canceled", updated_at: new Date().toISOString() })
      .eq("discord_user_id", discordUserId)
      .eq("subscription_id", targetSubscription);
  }
}

export const Route = createFileRoute("/api/public/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
        if (!webhookSecret) {
          console.error("Stripe webhook rejected: STRIPE_WEBHOOK_SECRET is not configured");
          return Response.json({ error: "Stripe webhook is not configured" }, { status: 503 });
        }

        const signature = request.headers.get("stripe-signature") || "";
        if (!signature) {
          return Response.json({ error: "Missing Stripe-Signature header" }, { status: 400 });
        }

        const rawBody = await request.text();
        if (!verifyStripeSignature(rawBody, signature, webhookSecret)) {
          return Response.json({ error: "Invalid Stripe signature" }, { status: 400 });
        }

        let event: any;
        try {
          event = JSON.parse(rawBody);
        } catch {
          return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
        }

        const supported = new Set([
          "checkout.session.completed",
          "invoice.paid",
          "invoice.payment_failed",
          "customer.subscription.deleted",
        ]);

        if (!supported.has(String(event?.type || ""))) {
          return Response.json({ received: true, ignored: true });
        }

        try {
          await persistEvent(event);
        } catch (error) {
          console.error("Stripe webhook processing failed", error);
          return Response.json({ error: "Webhook processing failed" }, { status: 500 });
        }

        return Response.json({ received: true });
      },

      GET: async () =>
        Response.json({
          ok: true,
          service: "ware-stripe-webhook",
          events: [
            "checkout.session.completed",
            "invoice.paid",
            "invoice.payment_failed",
            "customer.subscription.deleted",
          ],
        }),
    },
  },
});
