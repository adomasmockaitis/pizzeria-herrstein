// Cross-Document View Transitions zwischen Startseite und Speisekarte:
// iOS-Push (vor / zurück) sowie nahtloser Karten-Morph aus "Frisch aus unserer Küche".

interface ViewTransitionLike {
  types: Set<string>;
  finished: Promise<void>;
}

interface NavigationEntryLike {
  url?: string;
}

interface NavigationActivationLike {
  navigationType?: string;
  entry?: NavigationEntryLike;
  from?: NavigationEntryLike;
}

interface PageSwapEventLike extends Event {
  viewTransition?: ViewTransitionLike | null;
  activation?: NavigationActivationLike | null;
}

interface PageRevealEventLike extends Event {
  viewTransition?: ViewTransitionLike | null;
}

interface UebergangSpeicher {
  typ: 'vor' | 'zurueck' | 'morph' | 'morph-zurueck';
  katId?: string;
  ts: number;
}

const SPEICHER_SCHLUESSEL = 'pizzeria-vt';
const MORPH_NAME = 'kategorie-morph';

const normalisierePfad = (pfad: string): string => {
  const bereinigt = pfad.replace(/\/+$/, '');
  return bereinigt || '/';
};

const BASIS_PFAD = normalisierePfad(import.meta.env.BASE_URL || '/');
const SPEISEKARTE_PFAD = `${BASIS_PFAD === '/' ? '' : BASIS_PFAD}/speisekarte`;

const istSpeisekarteUrl = (urlStr?: string): boolean => {
  if (!urlStr) return false;
  try {
    const url = new URL(urlStr, window.location.href);
    return normalisierePfad(url.pathname) === SPEISEKARTE_PFAD;
  } catch {
    return false;
  }
};

const istStartseiteUrl = (urlStr?: string): boolean => {
  if (!urlStr) return false;
  try {
    const url = new URL(urlStr, window.location.href);
    return normalisierePfad(url.pathname) === BASIS_PFAD;
  } catch {
    return false;
  }
};

const leseSpeicher = (): UebergangSpeicher | null => {
  try {
    const roh = sessionStorage.getItem(SPEICHER_SCHLUESSEL);
    if (!roh) return null;
    const daten = JSON.parse(roh) as UebergangSpeicher;
    if (Date.now() - daten.ts > 4000) return null;
    return daten;
  } catch {
    return null;
  }
};

const schreibeSpeicher = (daten: UebergangSpeicher) => {
  try {
    sessionStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(daten));
  } catch {
    // sessionStorage kann im privaten Modus blockiert sein
  }
};

const loescheSpeicher = () => {
  try {
    sessionStorage.removeItem(SPEICHER_SCHLUESSEL);
  } catch {
    // ignorieren
  }
};

const entferneAlleMorphNamen = () => {
  document.querySelectorAll<HTMLElement>('[data-vt-morph]').forEach((el) => {
    el.style.viewTransitionName = '';
    el.removeAttribute('data-vt-morph');
  });
};

const setzeMorphName = (el: HTMLElement | null) => {
  entferneAlleMorphNamen();
  if (!el) return;
  el.style.viewTransitionName = MORPH_NAME;
  el.setAttribute('data-vt-morph', '1');
};

const HERKUNFT_SCHLUESSEL = 'pizzeria-vt-herkunft';

const leseHerkunft = (): string | null => {
  try {
    return sessionStorage.getItem(HERKUNFT_SCHLUESSEL);
  } catch {
    return null;
  }
};

/** Ist das Element (Kategorie-Block) gerade spürbar im sichtbaren Bereich? */
const istImBild = (el: Element): boolean => {
  const r = el.getBoundingClientRect();
  const h = window.innerHeight || document.documentElement.clientHeight;
  return r.bottom > h * 0.15 && r.top < h * 0.85;
};

// „‹ Zurück“ auf Unterseiten: wenn wir von der Startseite kamen, echt in der Historie zurück –
// so stellt der Browser die alte Scrollposition (und den Kartenstapel) wieder her.
document.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const link = target?.closest<HTMLAnchorElement>('a[data-zurueck]');
  if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  let vonStartseite = false;
  try {
    const ref = document.referrer ? new URL(document.referrer) : null;
    vonStartseite = !!ref && ref.origin === window.location.origin && istStartseiteUrl(ref.href);
  } catch {
    vonStartseite = false;
  }
  if (!vonStartseite || window.history.length <= 1) return;
  event.preventDefault();
  event.stopImmediatePropagation();

  // Direkt zum letzten Startseiten-Eintrag im Verlauf springen – egal wie viele
  // Einträge (z. B. Anker) dazwischen liegen. Navigation API (Chrome/Edge), sonst zurückzählen.
  const nav = (window as Window & {
    navigation?: {
      currentEntry?: { index: number };
      entries?: () => { index: number; url: string | null; key: string }[];
      traverseTo?: (key: string) => unknown;
    };
  }).navigation;
  const aktuell = nav?.currentEntry?.index;
  const eintraege = nav?.entries?.();
  if (nav?.traverseTo && eintraege && typeof aktuell === 'number') {
    for (let i = aktuell - 1; i >= 0; i--) {
      const eintrag = eintraege.find((e) => e.index === i);
      if (eintrag?.url && istStartseiteUrl(eintrag.url)) {
        nav.traverseTo(eintrag.key);
        return;
      }
      if (eintrag?.url && !istSpeisekarteUrl(eintrag.url)) break;
    }
  }
  // Fallback (Safari/Firefox): Anzahl gleicher-Seite-Einträge seit Ankunft zurückgehen
  let schritte = 1;
  try {
    const ankunft = parseInt(sessionStorage.getItem('pizzeria-ankunft-laenge') || '', 10);
    if (!isNaN(ankunft) && window.history.length >= ankunft) {
      schritte = Math.max(1, window.history.length - ankunft + 1);
    }
  } catch {
    // ignorieren
  }
  window.history.go(-schritte);
}, true);

// Klick-Handler für Kategorie-Karten ("Frisch aus unserer Küche") und Speisekarte-Buttons
document.addEventListener('click', (event) => {
  if (event.defaultPrevented) return;
  const target = event.target instanceof Element ? event.target : null;
  const link = target?.closest<HTMLAnchorElement>('a[href]');
  if (!link) return;
  if (link.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  let zielUrl: URL;
  try {
    zielUrl = new URL(link.href, window.location.href);
  } catch {
    return;
  }

  if (zielUrl.origin !== window.location.origin) return;

  const genussKarte = link.closest<HTMLElement>('[data-genuss-karte] .genuss__karte');
  const katId = zielUrl.hash.replace(/^#/, '');

  if (genussKarte && istSpeisekarteUrl(zielUrl.href) && katId) {
    setzeMorphName(genussKarte);
    schreibeSpeicher({ typ: 'morph', katId, ts: Date.now() });
    return;
  }

  entferneAlleMorphNamen();

  if (istSpeisekarteUrl(zielUrl.href) && istStartseiteUrl(window.location.href)) {
    schreibeSpeicher({ typ: 'vor', ts: Date.now() });
  } else if (istStartseiteUrl(zielUrl.href) && istSpeisekarteUrl(window.location.href)) {
    schreibeSpeicher({ typ: 'zurueck', ts: Date.now() });
  }
});

// Scrollposition der Startseite merken, damit „Zurück“ genau dorthin führt
const merkeStartPosition = () => {
  if (!istStartseiteUrl(window.location.href)) return;
  try {
    sessionStorage.setItem('pizzeria-start-y', String(Math.round(window.scrollY)));
  } catch {
    // ignorieren
  }
};
window.addEventListener('pagehide', merkeStartPosition);

// Ausgehende Seite: Richtung und ggf. Morph-Typ setzen
window.addEventListener('pageswap', (rohEvent) => {
  merkeStartPosition();
  const event = rohEvent as PageSwapEventLike;
  const vt = event.viewTransition;
  if (!vt) {
    entferneAlleMorphNamen();
    return;
  }

  const zielUrl = event.activation?.entry?.url;
  const aktuellSpeisekarte = istSpeisekarteUrl(window.location.href);
  const aktuellStartseite = istStartseiteUrl(window.location.href);
  const zielSpeisekarte = istSpeisekarteUrl(zielUrl);
  const zielStartseite = istStartseiteUrl(zielUrl);
  const gespeichert = leseSpeicher();

  if (aktuellStartseite && zielSpeisekarte) {
    const aktiverMorphEl = document.querySelector<HTMLElement>('[data-vt-morph]');
    if (aktiverMorphEl && gespeichert?.typ === 'morph' && gespeichert.katId) {
      vt.types.add('morph');
    } else {
      entferneAlleMorphNamen();
      vt.types.add('vor');
      schreibeSpeicher({ typ: 'vor', ts: Date.now() });
    }
  } else if (aktuellSpeisekarte && zielStartseite) {
    entferneAlleMorphNamen();
    // Rück-Morph: Kamen wir über eine Karte (Herkunft gespeichert) und ist deren Abschnitt
    // noch im Bild, schrumpft er zurück in die Karte. Sonst normales Zurückschieben.
    const herkunft = leseHerkunft();
    const block = herkunft
      ? document.querySelector<HTMLElement>(
          `[data-kategorie-sektion="${CSS.escape(herkunft)}"] [data-kategorie-block]`,
        )
      : null;
    if (herkunft && block && istImBild(block)) {
      setzeMorphName(block);
      vt.types.add('morph');
      schreibeSpeicher({ typ: 'morph-zurueck', katId: herkunft, ts: Date.now() });
    } else {
      vt.types.add('zurueck');
      schreibeSpeicher({ typ: 'zurueck', ts: Date.now() });
    }
  } else {
    entferneAlleMorphNamen();
  }

  vt.finished.finally(() => {
    entferneAlleMorphNamen();
  });
});

// Eingehende Seite (pagereveal) wird im Inline-Skript in BaseLayout.astro behandelt,
// weil ein Modul-Skript zu spät für pagereveal käme.

// Aus dem Back-Forward-Cache zurück: evtl. hängengebliebene Übergangsnamen entfernen
window.addEventListener('pageshow', (e) => {
  if ((e as PageTransitionEvent).persisted) entferneAlleMorphNamen();
});

// Für den Zurück-Fallback: Verlaufslänge bei Ankunft auf der Speisekarte merken
if (istSpeisekarteUrl(window.location.href)) {
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (!nav || nav.type !== 'back_forward') {
    try {
      sessionStorage.setItem('pizzeria-ankunft-laenge', String(window.history.length));
    } catch {
      // ignorieren
    }
  }
}
