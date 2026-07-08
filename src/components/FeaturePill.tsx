import type { ReactNode } from "react";

export function FeaturePill({
  icon,
  label,
  className,
}: {
  icon: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`pill-surface inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-xs text-foreground/90 ${className ?? ""}`}
    >
      <span className="grid h-5 w-5 place-items-center rounded-md bg-white/5 text-foreground/80">
        {icon}
      </span>
      {label}
    </div>
  );
}
