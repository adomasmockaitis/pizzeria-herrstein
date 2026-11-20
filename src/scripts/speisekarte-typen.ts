// TypeScript-Typen und Formatierungshelfer für src/content/speisekarte.json

export interface LegendeEintrag {
  kuerzel: string;
  text: string;
}

export interface SpeisekarteLegende {
  zusatzstoffe: LegendeEintrag[];
  allergene: LegendeEintrag[];
  unsicher: boolean;
}

export interface SpeisekarteGroessen {
  klein: string;
  gross: string;
}

export interface Gericht {
  name: string;
  zusatz: string | null;
  beschreibung: string | null;
  preis: number | null;
  preisKlein: number | null;
  preisGross: number | null;
  kennzeichnung: string[];
  vegetarisch: boolean;
  unsicher: string[];
}

export interface SpeisekarteAbschnitt {
  titel: string | null;
  hinweis: string | null;
  gerichte: Gericht[];
}

export interface SpeisekarteKategorie {
  id: string;
  name: string;
  hinweis: string | null;
  groessen?: SpeisekarteGroessen;
  abschnitte: SpeisekarteAbschnitt[];
}

export interface SpeisekarteDaten {
  stand: string;
  quelle: string;
  hinweis: string;
  legende: SpeisekarteLegende;
  kategorien: SpeisekarteKategorie[];
}

const preisFormatierer = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

const standFormatierer = new Intl.DateTimeFormat('de-DE', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** Formatiert einen Preis im deutschen Format ("12,00 €") oder als "–" bei null. */
export function formatierePreis(preis: number | null | undefined): string {
  if (preis === null || preis === undefined || Number.isNaN(preis)) {
    return '–';
  }
  return preisFormatierer.format(preis);
}

/** Formatiert einen Stand wie "2024-01" oder "2024-01-15" zu "Januar 2024". */
export function formatiereStand(stand: string): string {
  const bereinigt = stand.trim();
  if (!bereinigt) return '';
  const isoTreffer = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(bereinigt);
  if (isoTreffer) {
    const jahr = Number(isoTreffer[1]);
    const monat = Number(isoTreffer[2]);
    const tag = isoTreffer[3] ? Number(isoTreffer[3]) : 1;
    if (monat >= 1 && monat <= 12) {
      return standFormatierer.format(new Date(Date.UTC(jahr, monat - 1, tag)));
    }
  }
  return bereinigt;
}
