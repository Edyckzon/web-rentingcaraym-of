import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

export default function config(phase: string): NextConfig {
  const local = phase === PHASE_DEVELOPMENT_SERVER && process.env.MARKETING_LOCAL === '1';
  return {
    devIndicators: false, trailingSlash: true, images: { unoptimized: true },
    ...(local ? {
      env: { NEXT_PUBLIC_MARKETING_LOCAL: '1' },

      async rewrites() { return [{ source: '/marketing-api/:path*', destination: 'http://127.0.0.1:4319/marketing-api/:path*' }]; },
    } : { output: 'export' }),
  };
}
