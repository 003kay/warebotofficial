import avatarAsset from "@/assets/ware-avatar.jpg.asset.json";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 px-6 py-10 md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <img
            src={avatarAsset.url}
            alt="ware"
            className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10"
          />
          <span className="font-display text-xl">ware</span>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground">Commands</a>
          <a href="#" className="hover:text-foreground">Status</a>
          <a href="#" className="hover:text-foreground">Docs</a>
          <a href="#" className="hover:text-foreground">FAQ</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Privacy</a>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          © {new Date().getFullYear()} ware
        </p>
      </div>
    </footer>
  );
}
