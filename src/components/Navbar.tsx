import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/dashboard.functions";

const WARE_LOGO = "/6ef1b8a8-6882-4b66-a59f-22f2bf408ca8.png";

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
      <Link to="/" className="flex items-center gap-2.5">
        <img
          src={WARE_LOGO}
          alt="ware"
          className="h-9 w-9 rounded-lg object-cover ring-1 ring-white/10"
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

      <Link
        to="/dashboard"
        className="flex items-center gap-2 rounded-full bg-white/5 px-2 py-1.5 pr-4 text-sm font-medium ring-1 ring-white/10 transition-colors hover:bg-white/10"
      >
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt="" className="h-7 w-7 rounded-full" />
        ) : (
          <div className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-[10px] font-semibold">
            W
          </div>
        )}
        <span className="hidden sm:inline">Dashboard</span>
      </Link>
    </header>
  );
}
