import { PublicLayout } from "@/components/site/PublicLayout";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/kick/callback")({
  validateSearch: (search: Record<string, unknown>) => ({
    code: typeof search.code === "string" ? search.code : undefined,
    state: typeof search.state === "string" ? search.state : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Kick Connection — ware" },
      { name: "description", content: "Kick authorization callback for Ware." },
    ],
  }),
  component: KickCallback,
});

function KickCallback() {
  const search = Route.useSearch();
  const success = Boolean(search.code) && !search.error;

  return (
    <PublicLayout>
      <div className="pub-status">
        <section className="w-full max-w-lg  border border-white/10 bg-white/[0.035] p-8 ">
          <div className="grid h-12 w-12 place-items-center  border border-white/10 bg-white/[0.05] text-xl">
            K
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">
            {success ? "Kick authorization received" : "Kick authorization"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/65">
            {search.error
              ? "Kick returned an authorization error. You can close this page and try connecting again."
              : success
                ? "Ware received the Kick authorization callback. You can close this page and return to Discord."
                : "This endpoint is reserved for Ware's Kick integration."}
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex  border border-white/10 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
          >
            Return to Ware
          </Link>
        </section>
      </div>
    </PublicLayout>
  );
}
