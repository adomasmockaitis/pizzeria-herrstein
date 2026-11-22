// @ts-check
import { defineConfig } from 'astro/config';

const site = process.env.SITE || 'https://pizzeria-herrstein.adomas-mockaitis.de';
const base = process.env.BASE || '/';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
});
