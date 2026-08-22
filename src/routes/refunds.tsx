import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Starfield } from "@/components/Starfield";

const UPDATED = "August 22, 2026";
const CONTACT_EMAIL = "convlkay@gmail.com";

export const Route = createFileRoute("/refunds")({
  head: () => ({
    meta: [
      { title: "Refund Policy — ware" },
      { name: "description", content: "Refund and cancellation policy for Ware premium subscriptions, purchases, and related digital services." },
      { property: "og:title", content: "Refund Policy — ware" },
    ],
  }),
  component: RefundPolicyPage,
});

function RefundPolicyPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Starfield />
      <Navbar />
      <main className="relative z-10 mx-auto max-w-3xl px-6 py-16 md:px-10">
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Last updated:</span> {UPDATED}
        </div>
        <p className="text-sm text-muted-foreground"><Link to="/" className="hover:text-foreground">← Home</Link></p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">Refund Policy</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          This Refund Policy explains how refunds, cancellations, billing disputes, subscription transfers, and other payment-related matters are handled for Ware, including premium access, subscriptions, one-time purchases, and related digital services.
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section><h2 className="text-lg font-semibold text-foreground">1. General policy</h2><p className="mt-2">Because Ware provides digital services and access that may become available immediately after payment or activation, purchases are generally final once the purchased service, subscription, premium access, benefit, or other digital entitlement has been delivered or activated. Except where a refund is required by applicable law or expressly approved under this Policy, payments are non-refundable and non-creditable.</p></section>

          <section><h2 className="text-lg font-semibold text-foreground">2. When a refund may be considered</h2><p className="mt-2">We may consider a refund when a customer was charged more than once for the same transaction due to a verified billing error, when payment was successfully collected but the purchased service was never delivered and we are unable to provide it within a reasonable period, or when applicable consumer law requires a refund. Approval is not automatic and may require reasonable information needed to verify the transaction and circumstances.</p></section>

          <section><h2 className="text-lg font-semibold text-foreground">3. Non-refundable circumstances</h2><p className="mt-2">To the maximum extent permitted by applicable law, refunds generally will not be provided because a customer changed their mind, stopped using Ware, removed Ware from a server, no longer owns or manages a Discord server, purchased the wrong plan or purchased for the wrong server, failed to use available premium features, expected an unadvertised feature, disagrees with a feature change, or no longer needs the service. Refunds also are generally unavailable for unused time remaining in a billing period, partial use, voluntary cancellation after activation, server deletion, loss of server access, Discord account restrictions, or circumstances caused by the customer's own configuration, permissions, account, server, device, network, or third-party services.</p></section>

          <section><h2 className="text-lg font-semibold text-foreground">4. One-time purchases</h2><p className="mt-2">One-time purchases are generally final after the applicable digital service or entitlement is delivered or activated. A one-time purchase does not create a right to a refund merely because the purchaser later stops using Ware or changes the server on which they intended to use the purchase. If Ware expressly permits a transfer, that transfer is governed by the transfer rules in effect at the time and does not itself create a refund right.</p></section>

          <section><h2 className="text-lg font-semibold text-foreground">5. Monthly and recurring subscriptions</h2><p className="mt-2">Recurring subscriptions remain active for the paid billing period unless otherwise stated. Cancellation prevents future renewal where the applicable payment method and subscription system support cancellation, but cancellation does not ordinarily refund the current or previous billing period. Customers are responsible for cancelling before the next renewal if they do not want another charge. Failure to use the service during a paid billing period does not make that billing period refundable.</p></section>

          <section><h2 className="text-lg font-semibold text-foreground">6. Renewals</h2><p className="mt-2">Where recurring billing is enabled, the subscription may renew according to the billing arrangement presented when the subscription was purchased. Customers are responsible for reviewing their subscription status and cancelling before renewal when they no longer want the service. A completed renewal is treated as payment for a new billing period and is generally non-refundable except where required by law or where we determine that a verified billing error occurred.</p></section>

          <section><h2 className="text-lg font-semibold text-foreground">7. Transfers</h2><p className="mt-2">If Ware permits a premium subscription or entitlement to be transferred between eligible Discord servers, a transfer is a service accommodation rather than a cancellation or refund. Transfer eligibility, frequency, limitations, and availability may change. We may refuse a transfer where ownership or authorization cannot reasonably be verified, where the transfer appears abusive or fraudulent, or where technical or platform restrictions prevent the transfer.</p></section>

          <section><h2 className="text-lg font-semibold text-foreground">8. Discord and third-party services</h2><p className="mt-2">Ware depends in part on Discord and may interact with external APIs, payment processors, hosting providers, and other third-party services. To the maximum extent permitted by law, interruptions, outages, API changes, account actions, platform restrictions, payment processor delays, or other circumstances controlled by third parties do not automatically entitle a customer to a refund. Where a third-party issue prevents delivery of a paid Ware service for an extended period, we may determine an appropriate remedy based on the circumstances.</p></section>

          <section><h2 className="text-lg font-semibold text-foreground">9. Service interruptions and feature changes</h2><p className="mt-2">Temporary downtime, maintenance, bugs, latency, command failures, degraded performance, or interruptions do not ordinarily qualify for a refund. Ware may add, modify, replace, limit, or discontinue features as the service develops. A particular command, integration, design, response format, API integration, or feature changing or becoming unavailable does not by itself create a refund entitlement unless applicable law provides otherwise.</p></section>

          <section><h2 className="text-lg font-semibold text-foreground">10. Server configuration and permissions</h2><p className="mt-2">Customers and server administrators are responsible for configuring Discord permissions, roles, channels, integrations, and Ware settings appropriately. A feature failing because Ware lacks required permissions, because a server is incorrectly configured, because another bot or integration interferes with Ware, or because the customer has restricted or removed Ware does not ordinarily qualify for a refund.</p></section>

          <section><h2 className="text-lg font-semibold text-foreground">11. Suspensions, blacklists, and violations</h2><p className="mt-2">A refund is not guaranteed when access is restricted, suspended, blacklisted, or terminated because of suspected fraud, abuse, chargeback activity, security risks, violations of Ware's Terms of Service, violations of Discord policies, unlawful conduct, attempts to exploit the service, or other prohibited activity. Nothing in this section limits any refund or other remedy that cannot legally be excluded.</p></section>

          <section><h2 className="text-lg font-semibold text-foreground">12. Unauthorized purchases</h2><p className="mt-2">If you believe a payment method was used without authorization, contact us promptly at <a className="text-foreground underline underline-offset-4 hover:text-white" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We may request transaction details reasonably necessary to investigate. Customers should also secure the affected payment and Discord accounts. Reports of unauthorized use will be reviewed based on the available information and applicable payment-provider requirements.</p></section>

          <section><h2 className="text-lg font-semibold text-foreground">13. Chargebacks and payment disputes</h2><p className="mt-2">If there is a billing problem, we encourage customers to contact us before initiating a chargeback so we have an opportunity to review the transaction. Filing a chargeback does not guarantee that the dispute will be decided in the customer's favor. We may provide the payment processor with relevant transaction, delivery, account, subscription, and communication records when responding to a dispute. Fraudulent or abusive disputes may result in suspension of associated Ware services where permitted by law.</p></section>

          <section><h2 className="text-lg font-semibold text-foreground">14. Refund request information</h2><p className="mt-2">A refund request should include enough information for us to locate and review the transaction, such as the purchaser's Discord username or user ID, the relevant server ID when applicable, approximate payment date, amount paid, payment method, transaction or receipt identifier when available, and a clear explanation of the issue. Do not send passwords, complete card numbers, private keys, seed phrases, or other unnecessary sensitive credentials.</p></section>

          <section><h2 className="text-lg font-semibold text-foreground">15. Refund method and processing</h2><p className="mt-2">If a refund is approved, we will generally attempt to return funds through the original payment method when reasonably available. Processing times are controlled in part by banks, card networks, cryptocurrency networks, payment processors, and other third parties, so Ware cannot guarantee when an approved refund will appear. Network fees, processor fees, exchange-rate differences, or other non-recoverable third-party costs may affect the amount that can be returned where permitted by law.</p></section>

          <section><h2 className="text-lg font-semibold text-foreground">16. Cryptocurrency payments</h2><p className="mt-2">Cryptocurrency transactions may be irreversible and can involve network fees and price volatility. Sending cryptocurrency to an incorrect address, using an unsupported asset or network, or sending an incorrect amount may make recovery impossible. Ware is not responsible for losses resulting from customer-entered wallet information or blockchain transactions outside our reasonable control. If a cryptocurrency refund is approved, the manner and amount of repayment will be determined consistent with applicable law and the circumstances of the original transaction.</p></section>

          <section><h2 className="text-lg font-semibold text-foreground">17. Promotional pricing, discounts, and credits</h2><p className="mt-2">Discounts, promotional pricing, coupons, complimentary access, account credits, and similar benefits have no cash value unless expressly stated otherwise and are generally not redeemable for cash. If a paid transaction is refunded, any promotional benefit associated with that transaction may be cancelled. Promotional offers may have separate eligibility rules and expiration dates.</p></section>

          <section><h2 className="text-lg font-semibold text-foreground">18. Exceptions required by law</h2><p className="mt-2">Nothing in this Refund Policy excludes, restricts, or waives rights or remedies that cannot legally be excluded under applicable consumer-protection law. If the law applicable to a particular transaction gives you a mandatory cancellation, refund, or other consumer right, that right controls to the extent it conflicts with this Policy.</p></section>

          <section><h2 className="text-lg font-semibold text-foreground">19. Abuse of the refund process</h2><p className="mt-2">We may deny requests that are fraudulent, materially misleading, duplicative, abusive, or unsupported by the transaction records, except where a refund is legally required. Repeated attempts to obtain benefits without payment, manipulate refund procedures, or misuse payment disputes may result in restrictions on future purchases or access to Ware, subject to applicable law.</p></section>

          <section><h2 className="text-lg font-semibold text-foreground">20. Changes to this Policy</h2><p className="mt-2">We may update this Refund Policy as Ware, its payment methods, pricing, or applicable requirements change. The “Last updated” date at the top identifies the current version. Changes apply prospectively as permitted by applicable law and do not eliminate mandatory rights that applied to a transaction when it was made.</p></section>

          <section><h2 className="text-lg font-semibold text-foreground">21. Contact</h2><p className="mt-2">For refund requests, billing questions, cancellation issues, or payment-related concerns, contact Ware at <a className="text-foreground underline underline-offset-4 hover:text-white" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Please provide sufficient transaction information for us to identify the purchase and review your request.</p></section>

          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-xs leading-6 text-muted-foreground">
            This Policy is intended to describe Ware's refund practices and is not intended to remove any non-waivable rights available under applicable law.
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
