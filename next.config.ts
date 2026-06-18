import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: import.meta.dirname,
  },
  // ── Proxy de Ingesta para PostHog (WML 1.0 - Nodo Europa) ──────────────────
  async rewrites() {
    return [
      {
        // 1. Recursos estáticos y scripts de grabación (Evita el 404 de posthog-recorder)
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        // 2. Endpoints de captura de eventos, herencias y config
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
      {
        // 3. Endpoint de decisiones (Feature Flags)
        source: "/ingest/decide",
        destination: "https://eu.i.posthog.com/decide",
      },
    ];
  },
};

export default nextConfig;