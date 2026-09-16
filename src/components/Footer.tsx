import { ArrowUp } from "lucide-react";
import { Link } from "@tanstack/react-router";

const WARE_AVATAR = "/stained-logo.png?v=1";
const DISCORD_URL = "https://discord.gg/warebot";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.06] bg-[#0a0a0a] px-6 pb-10 pt-20 md:px-10 md:pt-24">
      <div className="mx-auto max-w-5xl text-center">
        <img src={WARE_AVATAR} alt="stained" className="mx-auto h-16 w-16 rounded-2xl object-contain p-1.5 ring-1 ring-white/10" />
        <p className="mt-6 text-sm leading-6 text-white/45">Copyright © {new Date().getFullYear()} stained.<br />All rights reserved.</p>

        <div className="mt-14 grid gap-12 sm:grid-cols-2">
          <div>
            <h3 className="text-2xl font-semibold">Bot</h3>
            <div className="mt-6 flex flex-col gap-4 text-lg text-white/45">
              <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="transition-colors hover:text-white">Invite</a>
              <Link to="/documentation" className="transition-colors hover:text-white">Documentation</Link>
              <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="transition-colors hover:text-white">Support Server</a>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-semibold">Legal</h3>
            <div className="mt-6 flex flex-col gap-4 text-lg text-white/45">
              <Link to="/terms" className="transition-colors hover:text-white">Terms of Service</Link>
              <Link to="/privacy" className="transition-colors hover:text-white">Privacy Policy</Link>
              <Link to="/refunds" className="transition-colors hover:text-white">Refund Policy</Link>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="mx-auto mt-16 grid h-16 w-16 place-items-center rounded-full border border-white/[0.08] bg-white/[0.045] text-white/65 transition-all hover:-translate-y-1 hover:bg-white/[0.08] hover:text-white"
          aria-label="Back to top"
        >
          <ArrowUp className="h-7 w-7" />
        </button>
      </div>
    </footer>
  );
}

