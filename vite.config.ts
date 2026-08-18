// @lovable.dev/vite-tanstack-config already includes TanStack Start,
// React, Tailwind, path aliases, Nitro, and the Lovable preview integrations.
// Do not add a second TanStack/React/Nitro plugin manually.

import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Lovable's build environment uses its normal/default target.
// Vercel sets the VERCEL environment variable during builds, so explicitly
// switch Nitro to the Vercel preset there. This makes TanStack Start server
// routes (including /api/public/auth/discord/*) deploy as Vercel Functions.
const isVercel = Boolean(process.env.VERCEL);

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },

  nitro: isVercel
    ? {
        preset: "vercel",
      }
    : true,
});
