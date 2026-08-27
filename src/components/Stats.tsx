const stats = [
  { value: "14,534+", label: "users" },
  { value: "243", label: "communities" },
  { value: "822", label: "commands" },
  { value: "99.99%", label: "uptime" },
];

export function Stats() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 pb-28 md:px-10">
      <div className="stats-panel relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.025]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-96 -translate-x-1/2 bg-white/[0.035] blur-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={stat.label} className={`relative px-5 py-8 text-center md:py-10 ${index % 2 === 0 ? "border-r border-white/[0.07]" : ""} ${index < 2 ? "border-b border-white/[0.07] md:border-b-0" : ""} ${index > 0 ? "md:border-l md:border-white/[0.07]" : ""} md:border-r-0`}>
              <div className="text-3xl font-bold tracking-[-0.04em] md:text-4xl">{stat.value}</div>
              <div className="mt-2 text-[10px] uppercase tracking-[0.17em] text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
