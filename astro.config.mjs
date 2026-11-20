// @ts-check
import { defineConfig } from 'astro/config';

const site = process.env.SITE || 'https://adomasmockaitis.github.io';
const base = process.env.BASE || '/pizzeria-herrstein';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
});
