import { Link } from "@tanstack/react-router";
import avatarAsset from "@/assets/ware-avatar.jpg.asset.json";
import { INVITE_URL, SUPPORT_URL } from "@/lib/links";

const links: { label: string; to: string }[] = [
  { label: "Commands", to: "/docs/commands" },
  { label: "Docs", to: "/docs" },
  { label: "FAQ", to: "/docs/faq" },
];

export function Navbar() {
  return (
    <header className="relative z-20 flex items-center justify-between px-6 py-5 md:px-10">
      <Link to="/" className="flex items-center gap-2">
        <img
          src={avatarAsset.url}
          alt="ware"
          className="h-9 w-9 rounded-full object-cover ring-1 ring-white/10"
        />
        <span className="text-2xl font-bold leading-none tracking-tight">ware</span>
      </Link>

      <nav className="pill-surface hidden items-center gap-1 rounded-full px-2 py-1.5 text-sm md:flex">
        {links.map((l) => (
          <Link
            key={l.label}
            to={l.to}
            className="rounded-full px-4 py-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <a
        href={INVITE_URL}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 rounded-full bg-discord px-4 py-2 text-sm font-medium text-discord-foreground transition-transform hover:scale-[1.02]"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3c-.18.316-.386.744-.53 1.084a18.27 18.27 0 0 0-5.056 0A12.51 12.51 0 0 0 10.44 3a19.74 19.74 0 0 0-3.762 1.369C3.02 9.043 2.017 13.58 2.5 18.058A19.9 19.9 0 0 0 8.52 21c.487-.66.921-1.362 1.294-2.099a12.94 12.94 0 0 1-2.038-.98c.171-.126.338-.257.5-.392a14.19 14.19 0 0 0 12.448 0c.163.135.33.266.5.392a12.94 12.94 0 0 1-2.041.982c.373.735.807 1.437 1.295 2.097A19.9 19.9 0 0 0 26.54 18.06c.56-5.19-.918-9.687-3.98-13.69ZM10.02 15.33c-1.183 0-2.157-1.085-2.157-2.42 0-1.336.955-2.42 2.157-2.42 1.203 0 2.176 1.084 2.157 2.42 0 1.335-.954 2.42-2.157 2.42Zm7.974 0c-1.183 0-2.157-1.085-2.157-2.42 0-1.336.955-2.42 2.157-2.42s2.176 1.084 2.157 2.42c0 1.335-.954 2.42-2.157 2.42Z" transform="translate(-1.5 0)" />
        </svg>
        <span className="hidden sm:inline">Dashboard</span>
      </a>
    </header>
  );
}
