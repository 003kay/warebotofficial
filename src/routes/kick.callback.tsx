import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/kick/callback")({
  validateSearch: (search: Record<string, unknown>) => ({
    code: typeof search.code === "string" ? search.code : undefined,
    state: typeof search.state === "string" ? search.state : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Kick Connection — stained" },
      { name: "description", content: "Kick authorization callback for Stained." },
    ],
  }),
  component: KickCallback,
});

function KickCallback() {
  const search = Route.useSearch();
  const success = Boolean(search.code) && !search.error;

  return (
    <main className="grid min-h-screen place-items-center bg-[#070808] px-6 text-white">
      <section className="w-full max-w-lg rounded-[28px] border border-white/10 bg-white/[0.035] p-8 text-center shadow-2xl">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-xl">K</div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">
          {success ? "Kick authorization received" : "Kick authorization"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/45">
          {search.error
            ? "Kick returned an authorization error. You can close this page and try connecting again."
            : success
              ? "Stained received the Kick authorization callback. You can close this page and return to Discord."
              : "This endpoint is reserved for Stained's Kick integration."}
        </p>
        <Link to="/" className="mt-6 inline-flex rounded-xl border border-white/10 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90">
          Return to Stained
        </Link>
      </section>
    </main>
  );
}

