import { useMemo } from "react";

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function Starfield({ count = 105 }: { count?: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        top: seededRandom(i * 7 + 1) * 100,
        left: seededRandom(i * 7 + 2) * 100,
        size: seededRandom(i * 7 + 3) * 1.5 + 0.35,
        delay: seededRandom(i * 7 + 4) * 7,
        duration: 3 + seededRandom(i * 7 + 5) * 6,
        opacity: 0.18 + seededRandom(i * 7 + 6) * 0.55,
      })),
    [count],
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-[-18rem] h-[44rem] w-[44rem] -translate-x-1/2 rounded-full border border-white/[0.035]" />
      <div className="absolute left-1/2 top-[-13rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full border border-white/[0.025]" />

      <div className="site-grid absolute inset-0 opacity-40" />

      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}

      <div className="absolute left-[12%] top-[17%] h-px w-24 rotate-[-18deg] bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shooting-star" />
      <div className="absolute right-[9%] top-[38%] h-px w-16 rotate-[22deg] bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shooting-star-delayed" />
    </div>
  );
}
