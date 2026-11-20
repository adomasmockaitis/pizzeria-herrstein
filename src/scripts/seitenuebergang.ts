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
  typ: 'vor' | 'zurueck' | 'morph';
  katId?: string;
  ts: number;
}

const SPEICHER_SCHLUESSEL = 'pizzeria-vt';
const MORPH_NAME = 'kategorie-morph';

const normalisierePfad = (pfad: string): string => {
  const bereinigt = pfad.replace(/\/+$/, '');
  return bereinigt || '/';
};

const istSpeisekarteUrl = (urlStr?: string): boolean => {
  if (!urlStr) return false;
  try {
    const url = new URL(urlStr, window.location.href);
    return normalisierePfad(url.pathname).endsWith('/speisekarte');
  } catch {
    return false;
  }
};

const istStartseiteUrl = (urlStr?: string): boolean => {
  if (!urlStr) return false;
  try {
    const url = new URL(urlStr, window.location.href);
    const base = normalisierePfad(import.meta.env.BASE_URL || '/');
    return normalisierePfad(url.pathname) === base;
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

// Ausgehende Seite: Richtung und ggf. Morph-Typ setzen
window.addEventListener('pageswap', (rohEvent) => {
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
    vt.types.add('zurueck');
    schreibeSpeicher({ typ: 'zurueck', ts: Date.now() });
  } else {
    entferneAlleMorphNamen();
  }

  vt.finished.finally(() => {
    entferneAlleMorphNamen();
  });
});

// Eingehende Seite: Richtung und Ziel-Element für den Morph setzen
window.addEventListener('pagereveal', (rohEvent) => {
  const event = rohEvent as PageRevealEventLike;
  const vt = event.viewTransition;
  const gespeichert = leseSpeicher();
  loescheSpeicher();

  if (!vt) {
    entferneAlleMorphNamen();
    return;
  }

  const nav = (window as Window & { navigation?: { activation?: NavigationActivationLike } })
    .navigation;
  const activation = nav?.activation;
  const vonUrl = activation?.from?.url;
  const aktuellSpeisekarte = istSpeisekarteUrl(window.location.href);
  const aktuellStartseite = istStartseiteUrl(window.location.href);
  const hashId = window.location.hash.replace(/^#/, '');

  if (aktuellSpeisekarte) {
    if (hashId) {
      window.dispatchEvent(new CustomEvent('einblenden:sofort'));
    }

    if (gespeichert?.typ === 'morph' && gespeichert.katId) {
      const zielSektion = document.querySelector<HTMLElement>(
        `[data-kategorie-sektion="${CSS.escape(gespeichert.katId)}"]`,
      );
      const zielBlock = zielSektion?.querySelector<HTMLElement>('[data-kategorie-block]');

      if (zielBlock && zielSektion && !zielSektion.hidden) {
        zielSektion.scrollIntoView({ behavior: 'auto', block: 'start' });
        setzeMorphName(zielBlock);
        vt.types.add('morph');
        vt.finished.finally(() => {
          entferneAlleMorphNamen();
        });
        return;
      }
    }

    if (!vonUrl || istStartseiteUrl(vonUrl) || gespeichert?.typ === 'vor') {
      vt.types.add('vor');
    }
  } else if (aktuellStartseite) {
    if ((vonUrl && istSpeisekarteUrl(vonUrl)) || gespeichert?.typ === 'zurueck') {
      vt.types.add('zurueck');
    }
  }

  vt.finished.finally(() => {
    entferneAlleMorphNamen();
  });
});
