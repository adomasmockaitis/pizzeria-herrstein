// Interaktionen und Animationen für /speisekarte:
// Large Title, sticky Kategorie-Köpfe, Listen-Einblendung, Extras-Details und 2-stufige Live-Suche

const KURVE_IOS = 'cubic-bezier(0.32, 0.72, 0, 1)';
const KURVE_EIN = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
const reduziertMedia = window.matchMedia('(prefers-reduced-motion: reduce)');

interface Normalisiert {
  text: string;
  indexMap: Array<[number, number]>;
}

interface SuchToken {
  anzeige: string;
  umlaut: string;
  einfach: string;
}

interface TextFeld {
  el: HTMLElement;
  original: string;
  umlaut: Normalisiert;
  einfach: Normalisiert;
}

interface GerichtEintrag {
  el: HTMLElement;
  index: number;
  felder: TextFeld[];
  kontextUmlaut: string;
  kontextEinfach: string;
  teiltrefferEl: HTMLElement | null;
  passt: boolean;
  trefferAnzahl: number;
  fehlende: string[];
  getroffeneTokens: SuchToken[];
}

interface AbschnittEintrag {
  el: HTMLElement;
  liste: HTMLElement;
  gerichte: GerichtEintrag[];
}

interface KategorieEintrag {
  id: string;
  el: HTMLElement;
  block: HTMLElement;
  sentinel: HTMLElement | null;
  kopf: HTMLElement | null;
  navItem: HTMLElement | null;
  extras: HTMLDetailsElement | null;
  abschnitte: AbschnittEintrag[];
}

const IGNORIERTE_ZEICHEN = /[\s\-–—"„“”'‚‘»«]/;
const FUELLWOERTER = /^(und|mit)$/i;
const UMLAUT_ERSETZUNG: Record<string, string> = {
  ä: 'ae',
  ö: 'oe',
  ü: 'ue',
  ß: 'ss',
};

function normalisiereMitIndex(eingabe: string, umlauteErweitern: boolean): Normalisiert {
  let text = '';
  const indexMap: Array<[number, number]> = [];

  for (let i = 0; i < eingabe.length; i++) {
    const roh = eingabe[i].toLowerCase();
    if (IGNORIERTE_ZEICHEN.test(roh)) continue;

    if (roh === 'ß') {
      text += 'ss';
      indexMap.push([i, i + 1], [i, i + 1]);
      continue;
    }

    if (umlauteErweitern && roh in UMLAUT_ERSETZUNG) {
      const ersatz = UMLAUT_ERSETZUNG[roh];
      text += ersatz;
      for (let k = 0; k < ersatz.length; k++) {
        indexMap.push([i, i + 1]);
      }
      continue;
    }

    const basis = roh.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    for (const zeichen of basis) {
      if (!IGNORIERTE_ZEICHEN.test(zeichen)) {
        text += zeichen;
        indexMap.push([i, i + 1]);
      }
    }
  }

  return { text, indexMap };
}

function zerlegeSuchbegriffe(roh: string): SuchToken[] {
  const teile = roh
    .trim()
    .split(/[\s,;]+/)
    .map((t) => t.replace(/^["„“”'‚‘»«]+|["„“”'‚‘»«]+$/g, ''))
    .filter((t) => t.length > 0 && !FUELLWOERTER.test(t));

  const ergebnis: SuchToken[] = [];
  const gesehen = new Set<string>();

  for (const teil of teile) {
    const umlaut = normalisiereMitIndex(teil, true).text;
    if (!umlaut || gesehen.has(umlaut)) continue;
    gesehen.add(umlaut);

    const einfach = normalisiereMitIndex(teil, false)
      .text.replace(/ae/g, 'a')
      .replace(/oe/g, 'o')
      .replace(/ue/g, 'u');

    ergebnis.push({ anzeige: teil, umlaut, einfach: einfach || umlaut });
  }

  return ergebnis;
}

function findeBereiche(feld: TextFeld, tokens: SuchToken[]): Array<[number, number]> {
  const bereiche: Array<[number, number]> = [];

  for (const token of tokens) {
    let gefunden = false;

    if (token.umlaut) {
      let startSuche = 0;
      while (startSuche < feld.umlaut.text.length) {
        const pos = feld.umlaut.text.indexOf(token.umlaut, startSuche);
        if (pos === -1) break;
        const start = feld.umlaut.indexMap[pos]?.[0] ?? 0;
        const ende = feld.umlaut.indexMap[pos + token.umlaut.length - 1]?.[1] ?? feld.original.length;
        bereiche.push([start, ende]);
        startSuche = pos + token.umlaut.length;
        gefunden = true;
      }
    }

    if (!gefunden && token.einfach) {
      let startSuche = 0;
      while (startSuche < feld.einfach.text.length) {
        const pos = feld.einfach.text.indexOf(token.einfach, startSuche);
        if (pos === -1) break;
        const start = feld.einfach.indexMap[pos]?.[0] ?? 0;
        const ende = feld.einfach.indexMap[pos + token.einfach.length - 1]?.[1] ?? feld.original.length;
        bereiche.push([start, ende]);
        startSuche = pos + token.einfach.length;
      }
    }
  }

  if (bereiche.length <= 1) return bereiche;

  bereiche.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const vereint: Array<[number, number]> = [bereiche[0]];
  for (let i = 1; i < bereiche.length; i++) {
    const aktuell = bereiche[i];
    const letzter = vereint[vereint.length - 1];
    if (aktuell[0] <= letzter[1]) {
      letzter[1] = Math.max(letzter[1], aktuell[1]);
    } else {
      vereint.push(aktuell);
    }
  }
  return vereint;
}

function setzeHervorhebung(feld: TextFeld, tokens: SuchToken[]) {
  if (tokens.length === 0) {
    if (feld.el.firstElementChild) {
      feld.el.textContent = feld.original;
    }
    return;
  }

  const bereiche = findeBereiche(feld, tokens);
  if (bereiche.length === 0) {
    if (feld.el.firstElementChild) {
      feld.el.textContent = feld.original;
    }
    return;
  }

  const fragment = document.createDocumentFragment();
  let zeiger = 0;
  for (const [start, ende] of bereiche) {
    if (start > zeiger) {
      fragment.appendChild(document.createTextNode(feld.original.slice(zeiger, start)));
    }
    const mark = document.createElement('mark');
    mark.className = 'gericht__treffer';
    mark.textContent = feld.original.slice(start, ende);
    fragment.appendChild(mark);
    zeiger = ende;
  }
  if (zeiger < feld.original.length) {
    fragment.appendChild(document.createTextNode(feld.original.slice(zeiger)));
  }

  feld.el.textContent = '';
  feld.el.appendChild(fragment);
}

// ---------- 1. Large Title & Navigations-Titel ----------
function initLargeTitle() {
  const largeTitle = document.querySelector<HTMLElement>('[data-large-title]');
  const navTitel = document.querySelector<HTMLElement>('[data-nav-titel]');
  const headerEl = document.querySelector<HTMLElement>('.header--unterseite');
  if (!largeTitle || !navTitel) return;

  const aktualisiere = () => {
    if (reduziertMedia.matches) {
      largeTitle.style.transform = '';
      largeTitle.style.opacity = '';
      const navUnten = headerEl?.getBoundingClientRect().bottom ?? 56;
      navTitel.classList.toggle('ist-sichtbar', largeTitle.getBoundingClientRect().bottom <= navUnten + 4);
      return;
    }

    const fortschritt = Math.min(1, Math.max(0, window.scrollY / 80));
    const skala = 1 - fortschritt * 0.08;
    largeTitle.style.transform = fortschritt > 0.001 ? `scale(${skala.toFixed(4)})` : '';
    largeTitle.style.opacity = fortschritt > 0.001 ? (1 - fortschritt).toFixed(3) : '';
    navTitel.classList.toggle('ist-sichtbar', fortschritt >= 0.65);
  };

  let rahmen = false;
  const beiScroll = () => {
    if (rahmen) return;
    rahmen = true;
    window.requestAnimationFrame(() => {
      rahmen = false;
      aktualisiere();
    });
  };

  aktualisiere();
  window.addEventListener('scroll', beiScroll, { passive: true });
  window.addEventListener('resize', beiScroll, { passive: true });
  reduziertMedia.addEventListener('change', aktualisiere);
}

// ---------- 2. Mitlaufende Kategorie-Überschriften ----------
function initStickyKoepfe(kategorien: KategorieEintrag[]) {
  const aktualisiere = () => {
    for (const kat of kategorien) {
      if (!kat.kopf || !kat.sentinel) continue;
      if (kat.el.hidden) {
        kat.kopf.classList.remove('ist-angeheftet');
        continue;
      }
      const kopfTop = parseFloat(getComputedStyle(kat.kopf).top) || 0;
      const sentinelUnten = kat.sentinel.getBoundingClientRect().bottom;
      const sektionUnten = kat.el.getBoundingClientRect().bottom;
      const angeheftet =
        sentinelUnten <= kopfTop + 1 && sektionUnten > kopfTop + kat.kopf.offsetHeight;
      kat.kopf.classList.toggle('ist-angeheftet', angeheftet);
    }
  };

  let rahmen = false;
  const planen = () => {
    if (rahmen) return;
    rahmen = true;
    window.requestAnimationFrame(() => {
      rahmen = false;
      aktualisiere();
    });
  };

  aktualisiere();
  window.addEventListener('scroll', planen, { passive: true });
  window.addEventListener('resize', planen, { passive: true });
  window.addEventListener('speisekarte:filter', aktualisiere);
}

// ---------- 3. Kategorie-Block Erst-Einblendung ----------
function initBlockEinblendung(kategorien: KategorieEintrag[]): () => void {
  const wartend = new Set<HTMLElement>();
  let beobachter: IntersectionObserver | undefined;

  const zeigeAlleSofort = () => {
    for (const block of wartend) {
      block.style.opacity = '';
      beobachter?.unobserve(block);
    }
    wartend.clear();
  };

  if (
    reduziertMedia.matches ||
    !('IntersectionObserver' in window) ||
    typeof Element.prototype.animate !== 'function' ||
    window.location.hash.length > 1
  ) {
    return zeigeAlleSofort;
  }

  beobachter = new IntersectionObserver(
    (eintraege) => {
      for (const eintrag of eintraege) {
        if (!eintrag.isIntersecting) continue;
        const block = eintrag.target as HTMLElement;
        beobachter?.unobserve(block);
        if (!wartend.delete(block)) continue;
        block.style.opacity = '';
        if (!reduziertMedia.matches) {
          block.animate(
            [
              { opacity: 0, transform: 'translateY(12px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 350, easing: KURVE_EIN },
          );
        }
      }
    },
    { rootMargin: '0px 0px -24px 0px', threshold: 0.01 },
  );

  for (const kat of kategorien) {
    if (kat.block.getBoundingClientRect().top > window.innerHeight * 0.96) {
      kat.block.style.opacity = '0';
      wartend.add(kat.block);
      beobachter.observe(kat.block);
    }
  }

  window.addEventListener('speisekarte:ankersprung', zeigeAlleSofort);
  window.addEventListener('hashchange', zeigeAlleSofort);
  reduziertMedia.addEventListener('change', (e) => {
    if (e.matches) zeigeAlleSofort();
  });

  return zeigeAlleSofort;
}

// ---------- 4. "Extras & Aufpreise" (<details>) Höhen-Animation ----------
function initExtrasDetails() {
  const elemente = document.querySelectorAll<HTMLDetailsElement>('[data-extras-details]');

  for (const details of elemente) {
    const summary = details.querySelector<HTMLElement>('summary');
    const inhalt = details.querySelector<HTMLElement>('[data-extras-inhalt]');
    if (!summary || !inhalt) continue;

    let anim: Animation | undefined;
    let zielOffen = details.open;

    summary.addEventListener('click', (event) => {
      if (reduziertMedia.matches || typeof inhalt.animate !== 'function') return;
      event.preventDefault();

      zielOffen = !zielOffen;
      const aktuelleHoehe = details.open ? inhalt.getBoundingClientRect().height : 0;
      const aktuelleDeckkraft = details.open ? parseFloat(getComputedStyle(inhalt).opacity) || 1 : 0;

      anim?.cancel();
      anim = undefined;

      if (zielOffen) {
        details.open = true;
        const zielHoehe = inhalt.scrollHeight;
        const a = inhalt.animate(
          [
            { height: `${aktuelleHoehe}px`, opacity: aktuelleDeckkraft },
            { height: `${zielHoehe}px`, opacity: 1 },
          ],
          { duration: 240, easing: KURVE_IOS },
        );
        anim = a;
        a.finished.then(
          () => {
            if (anim === a) anim = undefined;
          },
          () => {},
        );
      } else {
        const a = inhalt.animate(
          [
            { height: `${aktuelleHoehe}px`, opacity: aktuelleDeckkraft },
            { height: '0px', opacity: 0 },
          ],
          { duration: 200, easing: KURVE_IOS },
        );
        anim = a;
        a.finished.then(
          () => {
            if (anim === a) {
              anim = undefined;
              if (!zielOffen) details.open = false;
            }
          },
          () => {},
        );
      }
    });
  }
}

// ---------- 5. Live-Suche (2-stufig + FLIP + gestaffeltes Einblenden) ----------
function initSuche(kategorien: KategorieEintrag[], zeigeAlleBloeckeSofort: () => void) {
  const seite = document.querySelector<HTMLElement>('[data-speisekarte-seite]');
  const suchBox = seite?.querySelector<HTMLElement>('[data-suche-box]');
  const eingabe = seite?.querySelector<HTMLInputElement>('[data-suche-eingabe]');
  const leerenBtn = seite?.querySelector<HTMLButtonElement>('[data-suche-leeren]');
  const statusEl = seite?.querySelector<HTMLElement>('[data-suche-status]');
  const teiltrefferBanner = seite?.querySelector<HTMLElement>('[data-teiltreffer-hinweis]');
  const leerBox = seite?.querySelector<HTMLElement>('[data-suche-leer]');
  const leerTextEl = seite?.querySelector<HTMLElement>('[data-suche-leer-text]');

  if (!seite || !suchBox || !eingabe || !statusEl || !teiltrefferBanner || !leerBox || !leerTextEl) {
    return;
  }

  suchBox.hidden = false;

  const textTeiltrefferHinweis = seite.dataset.textTeiltrefferHinweis ?? '';
  const textTeiltrefferZaehler = seite.dataset.textTeiltrefferZaehler ?? '';
  const textTeiltrefferOhne = seite.dataset.textTeiltrefferOhne ?? '';
  const textKeinTreffer = seite.dataset.textKeinTreffer ?? '';
  const statusAlle = seite.dataset.statusAlle ?? '';
  const statusSingular = seite.dataset.statusSingular ?? '';
  const statusPlural = seite.dataset.statusPlural ?? '';
  const statusAlleZutatenSingular = seite.dataset.statusAlleZutatenSingular ?? '';
  const statusAlleZutatenPlural = seite.dataset.statusAlleZutatenPlural ?? '';
  const statusTeilweiseSingular = seite.dataset.statusTeilweiseSingular ?? '';
  const statusTeilweisePlural = seite.dataset.statusTeilweisePlural ?? '';
  const statusLeer = seite.dataset.statusLeer ?? '';
  const anzahlGesamt = seite.dataset.anzahlGesamt ?? '0';

  const alleGerichte: GerichtEintrag[] = [];
  for (const kat of kategorien) {
    for (const abs of kat.abschnitte) {
      for (const g of abs.gerichte) alleGerichte.push(g);
    }
  }

  let laufende: Animation[] = [];
  let generation = 0;
  let eingabeTimer: number | undefined;
  let statusTimer: number | undefined;

  const stoppeAnimationen = () => {
    for (const a of laufende) a.cancel();
    laufende = [];
  };

  const starte = (el: HTMLElement, keyframes: Keyframe[], optionen: KeyframeAnimationOptions) => {
    const a = el.animate(keyframes, optionen);
    laufende.push(a);
    return a;
  };

  const kannAnimieren = () =>
    !reduziertMedia.matches && typeof seite.animate === 'function';

  const istImViewport = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return r.bottom >= -80 && r.top <= window.innerHeight + 80;
  };

  const meldeStatus = (
    treffer: number,
    hatSuche: boolean,
    mehrereBegriffe: boolean,
    istTeilweise: boolean,
    sofort: boolean,
  ) => {
    window.clearTimeout(statusTimer);
    const schreiben = () => {
      if (!hatSuche) {
        statusEl.textContent = statusAlle.replace('{anzahl}', anzahlGesamt);
      } else if (treffer === 0) {
        statusEl.textContent = statusLeer;
      } else if (istTeilweise) {
        statusEl.textContent =
          treffer === 1
            ? statusTeilweiseSingular
            : statusTeilweisePlural.replace('{anzahl}', String(treffer));
      } else if (mehrereBegriffe) {
        statusEl.textContent =
          treffer === 1
            ? statusAlleZutatenSingular
            : statusAlleZutatenPlural.replace('{anzahl}', String(treffer));
      } else {
        statusEl.textContent =
          treffer === 1 ? statusSingular : statusPlural.replace('{anzahl}', String(treffer));
      }
    };

    if (sofort) {
      schreiben();
    } else {
      statusTimer = window.setTimeout(schreiben, 220);
    }
  };

  const scrolleZuErstemErgebnisWennNoetig = (ziel: HTMLElement | null) => {
    if (!ziel) return;
    const zielRect = ziel.getBoundingClientRect();
    const suchRect = suchBox.getBoundingClientRect();
    const navEl = document.querySelector<HTMLElement>('.header--unterseite');
    const navUnten = navEl ? navEl.getBoundingClientRect().bottom : 56;
    const katNaviEl = document.querySelector<HTMLElement>('[data-kat-navi-leiste]');
    const leistenUnten = katNaviEl ? katNaviEl.getBoundingClientRect().bottom : navUnten + 60;

    // Ergebnis bereits im sichtbaren Bereich -> nicht scrollen
    if (zielRect.top >= leistenUnten - 8 && zielRect.top <= window.innerHeight - 80) {
      return;
    }

    // Nach unten scrollen nur soweit das Suchfeld dabei sichtbar bleibt
    if (zielRect.top > window.innerHeight - 80) {
      const noetig = zielRect.top - (window.innerHeight - 160);
      const maxOhneSuchfeldVerlust = Math.max(0, suchRect.top - navUnten - 12);
      const delta = Math.min(noetig, maxOhneSuchfeldVerlust);
      if (delta > 16) {
        window.scrollBy({
          top: delta,
          behavior: reduziertMedia.matches ? 'auto' : 'smooth',
        });
      }
    } else if (zielRect.bottom < leistenUnten && document.activeElement !== eingabe) {
      const zielY = window.scrollY + zielRect.top - leistenUnten - 8;
      window.scrollTo({
        top: Math.max(0, zielY),
        behavior: reduziertMedia.matches ? 'auto' : 'smooth',
      });
    }
  };

  const wendeFilterAn = async (sofort: boolean) => {
    const meine = ++generation;
    const rohWert = eingabe.value.trim();
    const tokens = zerlegeSuchbegriffe(rohWert);
    const hatSuche = tokens.length > 0;

    if (leerenBtn) {
      leerenBtn.hidden = eingabe.value.length === 0;
    }

    if (hatSuche) {
      zeigeAlleBloeckeSofort();
    }

    // Stufe 1 & 2 bewerten
    let vollTrefferAnzahl = 0;
    let teilTrefferAnzahl = 0;

    for (const gericht of alleGerichte) {
      if (!hatSuche) {
        gericht.trefferAnzahl = 0;
        gericht.fehlende = [];
        gericht.getroffeneTokens = [];
        gericht.passt = true;
        continue;
      }

      const getroffen: SuchToken[] = [];
      const fehlend: string[] = [];

      for (const token of tokens) {
        let passtToken =
          gericht.kontextUmlaut.includes(token.umlaut) ||
          gericht.kontextEinfach.includes(token.einfach);

        if (!passtToken) {
          for (const feld of gericht.felder) {
            if (
              feld.umlaut.text.includes(token.umlaut) ||
              feld.einfach.text.includes(token.einfach)
            ) {
              passtToken = true;
              break;
            }
          }
        }

        if (passtToken) {
          getroffen.push(token);
        } else {
          fehlend.push(token.anzeige);
        }
      }

      gericht.getroffeneTokens = getroffen;
      gericht.trefferAnzahl = getroffen.length;
      gericht.fehlende = fehlend;

      if (getroffen.length === tokens.length) vollTrefferAnzahl++;
      if (getroffen.length > 0) teilTrefferAnzahl++;
    }

    const istTeiltrefferModus =
      hatSuche && tokens.length >= 2 && vollTrefferAnzahl === 0 && teilTrefferAnzahl > 0;

    // Teiltreffer: Gibt es Gerichte mit mindestens 2 passenden Zutaten, nur diese zeigen –
    // sonst würde jede einzelne Zutat (z. B. „Mozzarella“) Dutzende Gerichte bringen.
    const besteTrefferzahl = Math.max(0, ...alleGerichte.map((g) => g.trefferAnzahl));
    const mindestTreffer = besteTrefferzahl >= 2 ? 2 : 1;

    let sichtbareGerichte = 0;
    for (const gericht of alleGerichte) {
      if (!hatSuche) {
        gericht.passt = true;
      } else if (istTeiltrefferModus) {
        gericht.passt = gericht.trefferAnzahl >= mindestTreffer;
      } else {
        gericht.passt = gericht.trefferAnzahl === tokens.length;
      }
      if (gericht.passt) sichtbareGerichte++;
    }

    const animieren = kannAnimieren();
    stoppeAnimationen();

    // 1. Ausblendende sichtbare Zeilen sanft ausblenden (120ms)
    if (animieren) {
      const auszublenden = alleGerichte
        .filter((g) => !g.el.hidden && !g.passt && istImViewport(g.el))
        .map((g) => g.el);

      if (auszublenden.length > 0) {
        const aus = auszublenden.map((el) =>
          starte(el, [{ opacity: 1 }, { opacity: 0 }], {
            duration: 120,
            easing: 'ease-in',
            fill: 'forwards',
          }),
        );
        await Promise.allSettled(aus.map((a) => a.finished));
        if (meine !== generation) return;
      }
    }

    // 2. FLIP-Vorher-Höhen der sichtbaren Kategorie-Blöcke merken
    const altHoehen = new Map<HTMLElement, number>();
    if (animieren) {
      for (const kat of kategorien) {
        if (!kat.el.hidden) {
          altHoehen.set(kat.block, kat.block.getBoundingClientRect().height);
        }
      }
    }

    stoppeAnimationen();

    // 3. DOM-Update: Sichtbarkeit, Reihenfolge, Markierungen, Teiltreffer-Infos
    const neuErscheinend: HTMLElement[] = [];
    const warTeiltrefferBannerVersteckt = teiltrefferBanner.hidden;
    const warLeerVersteckt = leerBox.hidden;

    for (const kat of kategorien) {
      let katHatTreffer = false;

      for (const abs of kat.abschnitte) {
        let absHatTreffer = false;

        // Reihenfolge: in Stufe 2 nach Trefferzahl absteigend, sonst Originalreihenfolge
        const sortiert = [...abs.gerichte].sort((a, b) => {
          if (istTeiltrefferModus) {
            const diff = b.trefferAnzahl - a.trefferAnzahl;
            if (diff !== 0) return diff;
          }
          return a.index - b.index;
        });

        let reihenfolgeGeaendert = false;
        for (let i = 0; i < sortiert.length; i++) {
          if (abs.liste.children[i] !== sortiert[i].el) {
            reihenfolgeGeaendert = true;
            break;
          }
        }
        if (reihenfolgeGeaendert) {
          const frag = document.createDocumentFragment();
          for (const g of sortiert) frag.appendChild(g.el);
          abs.liste.appendChild(frag);
        }

        for (const g of sortiert) {
          const warVersteckt = g.el.hidden;
          g.el.hidden = !g.passt;

          if (g.passt) {
            absHatTreffer = true;
            katHatTreffer = true;
            if (warVersteckt) neuErscheinend.push(g.el);
          }

          for (const feld of g.felder) {
            setzeHervorhebung(feld, g.passt && hatSuche ? g.getroffeneTokens : []);
          }

          if (g.teiltrefferEl) {
            if (istTeiltrefferModus && g.passt) {
              const zaehler = textTeiltrefferZaehler
                .replace('{treffer}', String(g.trefferAnzahl))
                .replace('{gesamt}', String(tokens.length));
              const fehlendText =
                g.fehlende.length > 0
                  ? ` · ${textTeiltrefferOhne.replace('{zutaten}', g.fehlende.join(', '))}`
                  : '';
              g.teiltrefferEl.textContent = `${zaehler}${fehlendText}`;
              g.teiltrefferEl.hidden = false;
            } else {
              g.teiltrefferEl.hidden = true;
              g.teiltrefferEl.textContent = '';
            }
          }
        }

        abs.el.hidden = !absHatTreffer;
      }

      kat.el.hidden = !katHatTreffer;
      if (kat.navItem) kat.navItem.hidden = !katHatTreffer;
      if (kat.extras) kat.extras.hidden = hatSuche;
    }

    // Teiltreffer-Hinweis oben
    if (istTeiltrefferModus) {
      teiltrefferBanner.textContent = textTeiltrefferHinweis.replace(
        '{anzahl}',
        String(tokens.length),
      );
      teiltrefferBanner.hidden = false;
    } else {
      teiltrefferBanner.hidden = true;
    }

    // Keine-Treffer-Box
    const zeigeLeer = hatSuche && sichtbareGerichte === 0;
    if (zeigeLeer) {
      leerTextEl.textContent = textKeinTreffer.replace('{begriff}', rohWert);
      leerBox.hidden = false;
    } else {
      leerBox.hidden = true;
    }

    // Kategorie-Leiste und sticky Überschriften informieren
    window.dispatchEvent(new CustomEvent('speisekarte:filter'));

    // 4. Animationen nach DOM-Update (FLIP-Blockhöhen + gestaffelte Zeilen + Banner)
    if (animieren) {
      for (const kat of kategorien) {
        if (kat.el.hidden) continue;
        const alt = altHoehen.get(kat.block);
        if (alt === undefined) continue;
        const neu = kat.block.getBoundingClientRect().height;
        if (Math.abs(alt - neu) > 1) {
          starte(kat.block, [{ height: `${alt}px`, overflow: 'hidden' }, { height: `${neu}px`, overflow: 'hidden' }], {
            duration: 240,
            easing: KURVE_IOS,
          });
        }
      }

      const gestaffelt = neuErscheinend.filter((el) => istImViewport(el));
      for (let i = 0; i < gestaffelt.length; i++) {
        if (i >= 20) break;
        starte(
          gestaffelt[i],
          [
            { opacity: 0, transform: 'translateY(6px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          {
            duration: 180,
            delay: i * 15,
            easing: KURVE_EIN,
            fill: 'backwards',
          },
        );
      }

      if (istTeiltrefferModus && warTeiltrefferBannerVersteckt) {
        starte(
          teiltrefferBanner,
          [
            { opacity: 0, transform: 'translateY(-8px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 220, easing: KURVE_EIN, fill: 'backwards' },
        );
      }

      if (zeigeLeer && warLeerVersteckt) {
        starte(
          leerBox,
          [
            { opacity: 0, transform: 'translateY(8px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 220, easing: KURVE_EIN, fill: 'backwards' },
        );
      }
    }

    // 5. Status melden & ggf. zum ersten Ergebnis scrollen
    meldeStatus(sichtbareGerichte, hatSuche, tokens.length >= 2, istTeiltrefferModus, sofort);

    if (hatSuche) {
      const erstesZiel = zeigeLeer
        ? leerBox
        : istTeiltrefferModus
          ? teiltrefferBanner
          : kategorien.find((k) => !k.el.hidden)?.el ?? null;
      scrolleZuErstemErgebnisWennNoetig(erstesZiel);
    }
  };

  eingabe.addEventListener('input', () => {
    if (leerenBtn) leerenBtn.hidden = eingabe.value.length === 0;
    window.clearTimeout(eingabeTimer);
    eingabeTimer = window.setTimeout(() => {
      void wendeFilterAn(false);
    }, 80);
  });

  eingabe.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && eingabe.value.length > 0) {
      event.preventDefault();
      window.clearTimeout(eingabeTimer);
      eingabe.value = '';
      void wendeFilterAn(true);
    }
  });

  leerenBtn?.addEventListener('click', () => {
    window.clearTimeout(eingabeTimer);
    eingabe.value = '';
    void wendeFilterAn(true);
    eingabe.focus();
  });
}

// ---------- Initialisierung ----------
function initSpeisekarte() {
  const sektionen = Array.from(
    document.querySelectorAll<HTMLElement>('[data-kategorie-sektion]'),
  );
  if (sektionen.length === 0) return;

  const kategorien: KategorieEintrag[] = [];

  for (const sektion of sektionen) {
    const id = sektion.dataset.kategorieSektion ?? '';
    const block = sektion.querySelector<HTMLElement>('[data-kategorie-block]');
    if (!id || !block) continue;

    const abschnitte: AbschnittEintrag[] = [];
    for (const absEl of Array.from(sektion.querySelectorAll<HTMLElement>('[data-abschnitt]'))) {
      const liste = absEl.querySelector<HTMLElement>('[data-gerichte-liste]');
      if (!liste) continue;

      const gerichte: GerichtEintrag[] = [];
      for (const gerichtEl of Array.from(absEl.querySelectorAll<HTMLElement>('[data-gericht]'))) {
        const felder: TextFeld[] = [];
        for (const feldEl of Array.from(gerichtEl.querySelectorAll<HTMLElement>('[data-feld]'))) {
          const original = feldEl.dataset.original ?? feldEl.textContent ?? '';
          felder.push({
            el: feldEl,
            original,
            umlaut: normalisiereMitIndex(original, true),
            einfach: normalisiereMitIndex(original, false),
          });
        }

        const katName = gerichtEl.dataset.kategorieName ?? '';
        const absTitel = gerichtEl.dataset.abschnittTitel ?? '';
        const kontext = `${katName} ${absTitel}`;

        gerichte.push({
          el: gerichtEl,
          index: Number(gerichtEl.dataset.index ?? gerichte.length),
          felder,
          kontextUmlaut: normalisiereMitIndex(kontext, true).text,
          kontextEinfach: normalisiereMitIndex(kontext, false).text,
          teiltrefferEl: gerichtEl.querySelector<HTMLElement>('[data-teiltreffer-info]'),
          passt: true,
          trefferAnzahl: 0,
          fehlende: [],
          getroffeneTokens: [],
        });
      }

      abschnitte.push({ el: absEl, liste, gerichte });
    }

    kategorien.push({
      id,
      el: sektion,
      block,
      sentinel: sektion.querySelector<HTMLElement>('[data-sticky-sentinel]'),
      kopf: sektion.querySelector<HTMLElement>('[data-kategorie-kopf]'),
      navItem: document.querySelector<HTMLElement>(`[data-kat-item="${CSS.escape(id)}"]`),
      extras: sektion.querySelector<HTMLDetailsElement>('[data-extras-details]'),
      abschnitte,
    });
  }

  initLargeTitle();
  initStickyKoepfe(kategorien);
  const zeigeAlleBloeckeSofort = initBlockEinblendung(kategorien);
  initExtrasDetails();
  initSuche(kategorien, zeigeAlleBloeckeSofort);
}

initSpeisekarte();
