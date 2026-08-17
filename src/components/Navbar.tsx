import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import avatarAsset from "@/assets/ware-avatar.jpg.asset.json";
import { getCurrentUser } from "@/lib/dashboard.functions";

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
            params={l.params as never}
            className="rounded-full px-4 py-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      {user ? (
        <Link
          to="/dashboard"
          className="flex items-center gap-2 rounded-full bg-white/5 px-2 py-1.5 pr-4 text-sm font-medium ring-1 ring-white/10 transition-colors hover:bg-white/10"
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="h-7 w-7 rounded-full" />
          ) : (
            <div className="h-7 w-7 rounded-full bg-white/10" />
          )}
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
      ) : (
        <div className="flex flex-col items-center gap-0.5">
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="cursor-not-allowed rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-muted-foreground"
          >
            Dashboard
          </button>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Coming soon
          </span>
        </div>
      )}
    </header>
  );
}
