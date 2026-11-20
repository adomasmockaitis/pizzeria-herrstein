// Zentrale Konfiguration der Website

/** Steuert den Demo-Modus (noindex-Meta, robots.txt Disallow, Demo-Hinweisbalken) */
export const DEMO_MODE = true;

/** Öffentliche Basis-URL der Website (Quelle: astro.config.mjs / Umgebungsvariable SITE) */
export const SITE_URL = import.meta.env.SITE ?? '';

/** Basis-Pfad der Website (Quelle: astro.config.mjs / Umgebungsvariable BASE) */
export const BASE_PATH = import.meta.env.BASE_URL;

/** Text für den Demo-Hinweisbalken im Entwurfsmodus */
export const DEMO_HINWEIS_TEXT = 'Entwurf – Preise und Angaben ohne Gewähr';
