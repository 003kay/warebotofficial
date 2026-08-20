import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Starfield } from "@/components/Starfield";

export const Route = createFileRoute("/authorized")({
  head: () => ({
    meta: [
      { title: "Authorized — ware" },
      { name: "description", content: "Your account has been connected to Ware." },
    ],
  }),
  component: AuthorizedPage,
});

function AuthorizedPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <Starfield />
      <Navbar />
      <main className="relative z-10 mx-auto flex min-h-[72vh] max-w-5xl items-center justify-center px-5 py-16 md:px-8">
        <section className="w-full max-w-2xl rounded-[32px] border border-white/[0.09] bg-[linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018))] p-8 text-center shadow-[0_40px_120px_-60px_rgba(255,255,255,.18)] md:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
            <CheckCircle2 className="h-8 w-8 text-emerald-300" />
          </div>
          <p className="mt-7 text-[10px] uppercase tracking-[0.24em] text-white/30">authorization complete</p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.045em] md:text-6xl">You’re connected.</h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/50">
            Your Last.fm account is now linked to Ware. You can return to Discord and use your Last.fm commands immediately.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/commands"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              View commands <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-3 text-sm font-medium text-white/65 transition hover:border-white/20 hover:text-white"
            >
              Back to Ware
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
