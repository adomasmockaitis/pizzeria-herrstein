import type { APIRoute } from 'astro';
import { DEMO_MODE } from '../config';

export const GET: APIRoute = () => {
  const body = DEMO_MODE
    ? 'User-agent: *\nDisallow: /\n'
    : 'User-agent: *\nAllow: /\n';

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
