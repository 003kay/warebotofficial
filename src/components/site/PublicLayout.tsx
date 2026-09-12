import { Link } from "@tanstack/react-router";
import { useState, useRef, type ReactNode } from "react";
import { INVITE_URL } from "@/lib/links";
const links = [
  ["Commands", "/commands"],
  ["Documentation", "/documentation"],
  ["Embed builder", "/embeds"],
  ["FAQ", "/faq"],
];
export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <header className="pub-header">
      <div className="pub-header-inner">
        <Link to="/" className="pub-brand" aria-label="Ware home">
          <img src="/ware-logo.svg?v=4" alt="" />
          <span>ware</span>
        </Link>
        <nav className="pub-desktop-nav" aria-label="Main navigation">
          {links.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <a href="/auth/discord/login" className="pub-account">
          Dashboard
        </a>
        <button
          ref={trigger}
          className="pub-menu-button"
          type="button"
          aria-expanded={open}
          aria-controls="public-menu"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <nav
          id="public-menu"
          className="pub-mobile-nav"
          aria-label="Mobile navigation"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              trigger.current?.focus();
            }
          }}
        >
          {links.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
          <a href="https://discord.gg/warebot" target="_blank" rel="noreferrer">
            Support server
          </a>
        </nav>
      )}
    </header>
  );
}
export function PublicFooter() {
  return (
    <footer className="pub-footer">
      <div className="pub-footer-top">
        <a href="/" className="pub-brand">
          <img src="/ware-logo.svg?v=4" alt="" />
          <span>ware</span>
        </a>
        <p>For the server you call home.</p>
        <a className="pub-text-link" href={INVITE_URL} target="_blank" rel="noreferrer">
          Add to Discord ↗
        </a>
      </div>
      <div className="pub-footer-bottom">
        <span>© {new Date().getFullYear()} Ware · @003kay</span>
        <nav aria-label="Footer">
          <a href="https://discord.gg/warebot" target="_blank" rel="noreferrer">
            Support
          </a>
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
          <a href="/refunds">Refunds</a>
        </nav>
      </div>
    </footer>
  );
}
export function PublicLayout({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`ware-public ${className}`}>
      <a className="pub-skip" href="#public-content">
        Skip to content
      </a>
      <PublicHeader />
      <main id="public-content">{children}</main>
      <PublicFooter />
    </div>
  );
}
export function PublicTitle({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="pub-page-title">
      <p className="pub-label">{label}</p>
      <h1>{title}</h1>
      {children && <p className="pub-intro">{children}</p>}
    </header>
  );
}
