import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, XCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Starfield } from "@/components/Starfield";

export const Route = createFileRoute("/reddit/callback")({
  component: RedditCallbackPage,
  head: () => ({
    meta: [
      { title: "Reddit Authorization — Ware" },
      { name: "description", content: "Reddit authorization callback for Ware." },
    ],
  }),
});

function RedditCallbackPage() {
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const error = params.get("error");
  const code = params.get("code");
  const success = Boolean(code) && !error;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <Starfield />
      <Navbar />
      <main className="relative z-10 mx-auto flex min-h-[78vh] max-w-4xl items-center px-5 py-16 md:px-8">
        <section className="w-full rounded-[34px] border border-white/[0.09] bg-[#0a0a0c]/90 p-8 text-center shadow-[0_50px_160px_-70px_rgba(0,0,0,.95)] backdrop-blur-xl md:p-14">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] border border-white/10 bg-white/[0.04]">
            {success ? <CheckCircle2 className="h-9 w-9 text-emerald-400" /> : <XCircle className="h-9 w-9 text-red-400" />}
          </div>
          <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/35">Reddit × Ware</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.055em] md:text-6xl">
            {success ? "Reddit authorized." : "Authorization failed."}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/45 md:text-base">
            {success
              ? "Reddit returned an authorization code successfully. You can return to Ware now."
              : `Reddit did not authorize the connection${error ? ` (${error})` : ""}. Try connecting again.`}
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/" className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:bg-white/90">
              Return to Ware
            </Link>
            <Link to="/commands" className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] px-6 py-3.5 text-sm font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/[0.055] hover:text-white">
              View commands
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
