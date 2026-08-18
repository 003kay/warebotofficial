import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/dashboard.functions";

const WARE_LOGO = "/favicon.svg";

const links = [
  { label: "Commands", to: "/docs/$slug" as const, params: { slug: "commands" } },
  { label: "Docs", to: "/docs" as const, params: undefined },
];

export function Navbar() {
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => getCurrentUser(),
    staleTime: 60_000,
  });

  return (
    <header className="relative z-20 flex items-center justify-between px-6 py-5 md:px-10">
      <Link to="/" className="group flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,.04)] transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/[0.06]">
          <img
            src={WARE_LOGO}
            alt="ware"
            className="h-7 w-7 object-contain"
          />
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-2xl font-bold leading-none tracking-tight">ware</span>
          <span className="hidden rounded-full border border-white/10 bg-white/[0.025] px-2.5 py-1 font-mono text-[10px] text-muted-foreground sm:inline-flex">
            made by @003kay
          </span>
        </div>
      </Link>

      <nav className="pill-surface hidden items-center gap-1 rounded-full px-2 py-1.5 text-sm md:flex">
        {links.map((l) => (
          <Link
            key={l.label}
            to={l.to}
            params={l.params as never}
            className="rounded-full px-4 py-2 text-muted-foreground transition-all duration-200 hover:bg-white/5 hover:text-foreground"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <Link
        to="/dashboard"
        className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-2 py-1.5 pr-4 text-sm font-medium shadow-[inset_0_1px_0_rgba(255,255,255,.03)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.065]"
      >
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <div className="grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-black/20">
            <img src={WARE_LOGO} alt="" className="h-5 w-5 object-contain" />
          </div>
        )}
        <span className="hidden sm:inline">Dashboard</span>
      </Link>
    </header>
  );
}
