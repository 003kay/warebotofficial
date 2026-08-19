import { Link } from "@tanstack/react-router";
import { ExternalLink, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const WARE_LOGO = "/favicon.svg";
const DISCORD_URL = "https://discord.gg/wept";

const itemClass =
  "group flex min-h-20 items-center justify-between rounded-2xl border border-white/[0.035] bg-white/[0.025] px-6 text-xl font-medium text-white/82 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.09] hover:bg-white/[0.055] hover:text-white sm:min-h-24 sm:px-8 sm:text-2xl";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  return (
    <>
      <header className="relative z-40 flex items-center justify-between px-6 py-6 md:px-10 md:py-7">
        <Link
          to="/"
          aria-label="Ware home"
          className="group grid h-14 w-14 place-items-center rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.035] md:h-16 md:w-16"
        >
          <img
            src={WARE_LOGO}
            alt="ware"
            className="h-11 w-11 object-contain opacity-80 transition-all duration-300 group-hover:scale-105 group-hover:opacity-100 md:h-12 md:w-12"
          />
        </Link>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
          className="group grid h-14 w-14 place-items-center rounded-2xl border border-white/[0.06] bg-white/[0.018] text-white/65 shadow-[inset_0_1px_0_rgba(255,255,255,.025)] backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-white/[0.045] hover:text-white md:h-16 md:w-16"
        >
          <Menu className="h-8 w-8 stroke-[1.8] transition-transform duration-200 group-hover:scale-105 md:h-9 md:w-9" />
        </button>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-[100] overflow-y-auto bg-black/72 px-4 pb-8 pt-20 backdrop-blur-[7px] sm:px-6 sm:pt-24"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setMenuOpen(false);
          }}
        >
          <div className="mx-auto w-full max-w-3xl animate-[menu-in_.24s_cubic-bezier(.2,.8,.2,1)] rounded-[2rem] border border-white/[0.08] bg-[#0d0d0e]/96 p-5 shadow-[0_35px_120px_-40px_rgba(0,0,0,.95),inset_0_1px_0_rgba(255,255,255,.035)] sm:p-8">
            <div className="mb-7 flex items-center justify-between gap-4 sm:mb-9">
              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                Menu
              </h2>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="grid h-12 w-12 place-items-center rounded-xl text-white/60 transition-all duration-200 hover:rotate-3 hover:bg-white/[0.04] hover:text-white"
              >
                <X className="h-8 w-8 stroke-[1.8]" />
              </button>
            </div>

            <nav className="grid gap-3 sm:gap-4">
              <Link
                to="/docs/$slug"
                params={{ slug: "commands" }}
                onClick={() => setMenuOpen(false)}
                className={itemClass}
              >
                <span>Commands</span>
              </Link>

              <Link
                to="/docs/$slug"
                params={{ slug: "status" }}
                onClick={() => setMenuOpen(false)}
                className={itemClass}
              >
                <span>Status</span>
              </Link>

              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => setMenuOpen(false)}
                className={itemClass}
              >
                <span>Discord</span>
                <ExternalLink className="h-6 w-6 text-white/35 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/70" />
              </a>

              <Link
                to="/docs"
                onClick={() => setMenuOpen(false)}
                className={itemClass}
              >
                <span>Documentation</span>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
