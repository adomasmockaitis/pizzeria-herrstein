// Interaktionen und Animationen für /speisekarte:
// Large Title, sticky Kategorie-Köpfe, Extras-Details, Live-Suche, Filter-Sheet/Popover und URL-Zustand

const KURVE_IOS = 'cubic-bezier(0.32, 0.72, 0, 1)';
const KURVE_EIN = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
const reduziertMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
const desktopMedia = window.matchMedia('(min-width: 768px)');

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

interface ZutatDefinitionKonfig {
  id: string;
  label: string;
  stichwoerter: string[];
  ausschluss?: string[];
}

interface ZutatDefinition {
  id: string;
  label: string;
  stichwoerter: string[];
  ausschluss: string[];
  anzahl: number;
}

interface FilterKonfig {
  buttonLabel: string;
  buttonLabelAktiv: string;
  gerichteAnzeigenNull: string;
  gerichteAnzeigenSingular: string;
  gerichteAnzeigenPlural: string;
  filterEntfernenLabel: string;
  vegChip: string;
  zutatStatusMit: string;
  zutatStatusOhne: string;
  zutatChipMit: string;
  zutatChipOhne: string;
  preisChipBis: string;
  allergenChipOhne: string;
  zutatenListe: ZutatDefinitionKonfig[];
}

type ZutatZustand = 'neutral' | 'mit' | 'ohne';

interface FilterZustand {
  vegetarisch: boolean;
  kategorien: Set<string>;
  mitZutaten: Set<string>;
  ohneZutaten: Set<string>;
  maxPreis: number | null;
  ohneAllergene: Set<string>;
}

interface GerichtEintrag {
  el: HTMLElement;
  index: number;
  kategorieId: string;
  vegetarisch: boolean;
  preis: number | null;
  kennzeichnungen: Set<string>;
  zutaten: Set<string>;
  zutatSuchtext: string;
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
  name: string;
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
const ERLAUBTE_PREISE = new Set([8, 10, 12]);
const SVG_NS = 'http://www.w3.org/2000/svg';

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

function erstelleSymbolSvg(typ: 'haken' | 'kreuz'): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 14 14');
  svg.setAttribute('width', '13');
  svg.setAttribute('height', '13');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');

  const pfad = document.createElementNS(SVG_NS, 'path');
  pfad.setAttribute(
    'd',
    typ === 'haken' ? 'M2.5 7.5 5.5 10.5 11.5 3.5' : 'M3.5 3.5 10.5 10.5M10.5 3.5 3.5 10.5',
  );
  pfad.setAttribute('stroke', 'currentColor');
  pfad.setAttribute('stroke-width', '2');
  pfad.setAttribute('stroke-linecap', 'round');
  pfad.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(pfad);
  return svg;
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

// ---------- 3. "Extras & Aufpreise" (<details>) Höhen-Animation ----------
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

// ---------- 4. Live-Suche + Filter (UND-Verknüpfung) & URL-Zustand ----------
function initSucheUndFilter(kategorien: KategorieEintrag[]) {
  const seite = document.querySelector<HTMLElement>('[data-speisekarte-seite]');
  const suchBox = seite?.querySelector<HTMLElement>('[data-suche-box]');
  const eingabe = seite?.querySelector<HTMLInputElement>('[data-suche-eingabe]');
  const leerenBtn = seite?.querySelector<HTMLButtonElement>('[data-suche-leeren]');
  const statusEl = seite?.querySelector<HTMLElement>('[data-suche-status]');
  const teiltrefferBanner = seite?.querySelector<HTMLElement>('[data-teiltreffer-hinweis]');
  const leerBox = seite?.querySelector<HTMLElement>('[data-suche-leer]');
  const leerTextEl = seite?.querySelector<HTMLElement>('[data-suche-leer-text]');

  const filterBtn = seite?.querySelector<HTMLButtonElement>('[data-filter-btn]');
  const filterBadge = seite?.querySelector<HTMLElement>('[data-filter-badge]');
  const filterBackdrop = seite?.querySelector<HTMLElement>('[data-filter-backdrop]');
  const filterPanel = seite?.querySelector<HTMLElement>('[data-filter-panel]');
  const fertigBtn = seite?.querySelector<HTMLButtonElement>('[data-filter-schliessen]');
  const resetBtn = seite?.querySelector<HTMLButtonElement>('[data-filter-reset]');
  const anzeigenBtn = seite?.querySelector<HTMLButtonElement>('[data-filter-anzeigen]');
  const vegSwitch = seite?.querySelector<HTMLButtonElement>('[data-filter-veg]');
  const vegZeile = seite?.querySelector<HTMLElement>('[data-filter-veg-zeile]');
  const katChips = Array.from(
    seite?.querySelectorAll<HTMLButtonElement>('[data-filter-kat]') ?? [],
  );
  const zutatenAbschnitt = seite?.querySelector<HTMLElement>('[data-filter-zutaten-abschnitt]');
  const zutatenListeEl = seite?.querySelector<HTMLElement>('[data-filter-zutaten-liste]');
  const preisGruppe = seite?.querySelector<HTMLElement>('[data-filter-preis-gruppe]');
  const preisRadios = Array.from(
    seite?.querySelectorAll<HTMLButtonElement>('[data-filter-preis]') ?? [],
  );
  const allergenChips = Array.from(
    seite?.querySelectorAll<HTMLButtonElement>('[data-filter-allergen]') ?? [],
  );
  const aktiveFilterLeiste = seite?.querySelector<HTMLElement>('[data-aktive-filter]');
  const aktiveFilterChipsEl = seite?.querySelector<HTMLElement>('[data-aktive-filter-chips]');
  const aktiveFilterResetBtn = seite?.querySelector<HTMLButtonElement>('[data-aktive-filter-reset]');
  const konfigScript = document.querySelector<HTMLScriptElement>('[data-filter-konfig]');

  if (
    !seite ||
    !suchBox ||
    !eingabe ||
    !statusEl ||
    !teiltrefferBanner ||
    !leerBox ||
    !leerTextEl ||
    !konfigScript?.textContent
  ) {
    return;
  }

  let konfig: FilterKonfig;
  try {
    konfig = JSON.parse(konfigScript.textContent) as FilterKonfig;
  } catch {
    return;
  }

  suchBox.hidden = false;

  const textTeiltrefferHinweis = seite.dataset.textTeiltrefferHinweis ?? '';
  const textTeiltrefferZaehler = seite.dataset.textTeiltrefferZaehler ?? '';
  const textTeiltrefferOhne = seite.dataset.textTeiltrefferOhne ?? '';
  const textKeinTreffer = seite.dataset.textKeinTreffer ?? '';
  const textKeinTrefferFilter = seite.dataset.textKeinTrefferFilter ?? textKeinTreffer;
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

  // Zutaten aus Name & Beschreibung aller Gerichte anhand der kuratierten Stichwortliste erkennen
  const zutatDefs: ZutatDefinition[] = konfig.zutatenListe.map((z) => ({
    id: z.id,
    label: z.label,
    stichwoerter: z.stichwoerter.map((w) => normalisiereMitIndex(w, true).text).filter(Boolean),
    ausschluss: (z.ausschluss ?? [])
      .map((w) => normalisiereMitIndex(w, true).text)
      .filter(Boolean),
    anzahl: 0,
  }));

  for (const def of zutatDefs) {
    for (const gericht of alleGerichte) {
      let text = gericht.zutatSuchtext;
      if (def.ausschluss.length > 0) {
        for (const aus of def.ausschluss) {
          text = text.split(aus).join(' ');
        }
      }
      if (def.stichwoerter.some((kw) => text.includes(kw))) {
        gericht.zutaten.add(def.id);
        def.anzahl++;
      }
    }
  }

  // Nur Zutaten anzeigen, die bei mindestens 2 Gerichten vorkommen
  const verfuegbareZutaten = zutatDefs.filter((z) => z.anzahl >= 2);
  const zutatNachId = new Map(verfuegbareZutaten.map((z) => [z.id, z]));
  const zutatChipNachId = new Map<string, HTMLButtonElement>();
  const kategorieNameNachId = new Map(kategorien.map((k) => [k.id, k.name]));
  const allergenLabelNachKuerzel = new Map(
    allergenChips.map((btn) => [btn.dataset.filterAllergen ?? '', btn.dataset.label ?? '']),
  );

  const zustand: FilterZustand = {
    vegetarisch: false,
    kategorien: new Set<string>(),
    mitZutaten: new Set<string>(),
    ohneZutaten: new Set<string>(),
    maxPreis: null,
    ohneAllergene: new Set<string>(),
  };

  if (zutatenListeEl && zutatenAbschnitt && verfuegbareZutaten.length > 0) {
    const frag = document.createDocumentFragment();
    for (const zutat of verfuegbareZutaten) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-chip filter-chip--zutat';
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', zutat.label);
      btn.dataset.filterZutat = zutat.id;
      btn.textContent = zutat.label;
      zutatChipNachId.set(zutat.id, btn);
      frag.appendChild(btn);
    }
    zutatenListeEl.appendChild(frag);
    zutatenAbschnitt.hidden = false;
  }

  const istFilterAktiv = () =>
    zustand.vegetarisch ||
    zustand.kategorien.size > 0 ||
    zustand.mitZutaten.size > 0 ||
    zustand.ohneZutaten.size > 0 ||
    zustand.maxPreis !== null ||
    zustand.ohneAllergene.size > 0;

  const zaehleAktiveFilter = () =>
    (zustand.vegetarisch ? 1 : 0) +
    zustand.kategorien.size +
    zustand.mitZutaten.size +
    zustand.ohneZutaten.size +
    (zustand.maxPreis !== null ? 1 : 0) +
    zustand.ohneAllergene.size;

  const gerichtPasstFilter = (gericht: GerichtEintrag): boolean => {
    if (zustand.vegetarisch && !gericht.vegetarisch) return false;
    if (zustand.kategorien.size > 0 && !zustand.kategorien.has(gericht.kategorieId)) return false;
    if (zustand.maxPreis !== null && (gericht.preis === null || gericht.preis > zustand.maxPreis)) {
      return false;
    }
    for (const zId of zustand.mitZutaten) {
      if (!gericht.zutaten.has(zId)) return false;
    }
    for (const zId of zustand.ohneZutaten) {
      if (gericht.zutaten.has(zId)) return false;
    }
    for (const kuerzel of zustand.ohneAllergene) {
      if (gericht.kennzeichnungen.has(kuerzel)) return false;
    }
    return true;
  };

  const holeZutatZustand = (id: string): ZutatZustand => {
    if (zustand.mitZutaten.has(id)) return 'mit';
    if (zustand.ohneZutaten.has(id)) return 'ohne';
    return 'neutral';
  };

  const aktualisiereZutatChip = (id: string) => {
    const btn = zutatChipNachId.get(id);
    const zutat = zutatNachId.get(id);
    if (!btn || !zutat) return;

    const status = holeZutatZustand(id);
    btn.classList.toggle('filter-chip--mit', status === 'mit');
    btn.classList.toggle('filter-chip--ohne', status === 'ohne');
    btn.setAttribute('aria-pressed', status === 'neutral' ? 'false' : 'true');
    btn.textContent = '';

    if (status === 'mit' || status === 'ohne') {
      const symbolSpan = document.createElement('span');
      symbolSpan.className = 'filter-chip__symbol';
      symbolSpan.setAttribute('aria-hidden', 'true');
      symbolSpan.appendChild(erstelleSymbolSvg(status === 'mit' ? 'haken' : 'kreuz'));
      btn.appendChild(symbolSpan);
      btn.setAttribute(
        'aria-label',
        (status === 'mit' ? konfig.zutatStatusMit : konfig.zutatStatusOhne).replace(
          '{zutat}',
          zutat.label,
        ),
      );
    } else {
      btn.setAttribute('aria-label', zutat.label);
    }

    const textSpan = document.createElement('span');
    textSpan.textContent = zutat.label;
    btn.appendChild(textSpan);
  };

  let aktiveLeisteTimer: number | undefined;

  const erstelleAktivenChip = (
    text: string,
    variante: 'standard' | 'mit' | 'ohne',
    beiKlick: () => void,
  ) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'aktiver-filter-chip';
    if (variante === 'mit') btn.classList.add('aktiver-filter-chip--mit');
    if (variante === 'ohne') btn.classList.add('aktiver-filter-chip--ohne');
    btn.setAttribute('aria-label', konfig.filterEntfernenLabel.replace('{filter}', text));

    const labelSpan = document.createElement('span');
    labelSpan.textContent = text;
    btn.appendChild(labelSpan);

    const xSpan = document.createElement('span');
    xSpan.className = 'aktiver-filter-chip__x';
    xSpan.setAttribute('aria-hidden', 'true');
    xSpan.appendChild(erstelleSymbolSvg('kreuz'));
    btn.appendChild(xSpan);

    btn.addEventListener('click', beiKlick);
    return btn;
  };

  const aktualisiereFilterUi = (trefferAnzahl: number) => {
    if (vegSwitch) {
      vegSwitch.setAttribute('aria-checked', zustand.vegetarisch ? 'true' : 'false');
    }

    for (const btn of katChips) {
      const id = btn.dataset.filterKat ?? '';
      btn.setAttribute('aria-pressed', zustand.kategorien.has(id) ? 'true' : 'false');
    }

    for (const id of zutatChipNachId.keys()) {
      aktualisiereZutatChip(id);
    }

    const aktiverPreisWert = zustand.maxPreis !== null ? String(zustand.maxPreis) : '';
    for (const radio of preisRadios) {
      const aktiv = (radio.dataset.filterPreis ?? '') === aktiverPreisWert;
      radio.setAttribute('aria-checked', aktiv ? 'true' : 'false');
      radio.tabIndex = aktiv ? 0 : -1;
    }

    for (const btn of allergenChips) {
      const kuerzel = btn.dataset.filterAllergen ?? '';
      btn.setAttribute('aria-pressed', zustand.ohneAllergene.has(kuerzel) ? 'true' : 'false');
    }

    const aktiveAnzahl = zaehleAktiveFilter();
    if (filterBadge) {
      filterBadge.hidden = aktiveAnzahl === 0;
      filterBadge.textContent = String(aktiveAnzahl);
    }
    if (filterBtn) {
      filterBtn.setAttribute(
        'aria-label',
        aktiveAnzahl > 0
          ? konfig.buttonLabelAktiv.replace('{anzahl}', String(aktiveAnzahl))
          : konfig.buttonLabel,
      );
    }

    if (anzeigenBtn) {
      if (trefferAnzahl === 0) {
        anzeigenBtn.textContent = konfig.gerichteAnzeigenNull;
      } else if (trefferAnzahl === 1) {
        anzeigenBtn.textContent = konfig.gerichteAnzeigenSingular;
      } else {
        anzeigenBtn.textContent = konfig.gerichteAnzeigenPlural.replace(
          '{anzahl}',
          String(trefferAnzahl),
        );
      }
    }

    if (resetBtn) {
      resetBtn.disabled = aktiveAnzahl === 0;
    }

    // Aktive Filter-Chips unter der Suchleiste rendern & animiert ein-/ausblenden
    if (aktiveFilterLeiste && aktiveFilterChipsEl) {
      aktiveFilterChipsEl.textContent = '';

      if (zustand.vegetarisch) {
        aktiveFilterChipsEl.appendChild(
          erstelleAktivenChip(konfig.vegChip, 'mit', () => {
            zustand.vegetarisch = false;
            beiFilterAenderung();
          }),
        );
      }

      for (const katId of zustand.kategorien) {
        const katName = kategorieNameNachId.get(katId) ?? katId;
        aktiveFilterChipsEl.appendChild(
          erstelleAktivenChip(katName, 'standard', () => {
            zustand.kategorien.delete(katId);
            beiFilterAenderung();
          }),
        );
      }

      for (const zId of zustand.mitZutaten) {
        const zName = zutatNachId.get(zId)?.label ?? zId;
        aktiveFilterChipsEl.appendChild(
          erstelleAktivenChip(konfig.zutatChipMit.replace('{zutat}', zName), 'mit', () => {
            zustand.mitZutaten.delete(zId);
            beiFilterAenderung();
          }),
        );
      }

      for (const zId of zustand.ohneZutaten) {
        const zName = zutatNachId.get(zId)?.label ?? zId;
        aktiveFilterChipsEl.appendChild(
          erstelleAktivenChip(konfig.zutatChipOhne.replace('{zutat}', zName), 'ohne', () => {
            zustand.ohneZutaten.delete(zId);
            beiFilterAenderung();
          }),
        );
      }

      if (zustand.maxPreis !== null) {
        aktiveFilterChipsEl.appendChild(
          erstelleAktivenChip(
            konfig.preisChipBis.replace('{preis}', String(zustand.maxPreis)),
            'standard',
            () => {
              zustand.maxPreis = null;
              beiFilterAenderung();
            },
          ),
        );
      }

      for (const kuerzel of zustand.ohneAllergene) {
        const label = allergenLabelNachKuerzel.get(kuerzel) ?? kuerzel;
        aktiveFilterChipsEl.appendChild(
          erstelleAktivenChip(konfig.allergenChipOhne.replace('{allergen}', label), 'ohne', () => {
            zustand.ohneAllergene.delete(kuerzel);
            beiFilterAenderung();
          }),
        );
      }

      window.clearTimeout(aktiveLeisteTimer);
      if (aktiveAnzahl > 0) {
        const warVersteckt = aktiveFilterLeiste.hidden;
        aktiveFilterLeiste.hidden = false;
        if (warVersteckt && !reduziertMedia.matches) {
          void aktiveFilterLeiste.offsetHeight;
        }
        aktiveFilterLeiste.classList.add('ist-sichtbar');
      } else if (!aktiveFilterLeiste.hidden) {
        aktiveFilterLeiste.classList.remove('ist-sichtbar');
        if (reduziertMedia.matches) {
          aktiveFilterLeiste.hidden = true;
        } else {
          aktiveLeisteTimer = window.setTimeout(() => {
            if (zaehleAktiveFilter() === 0) {
              aktiveFilterLeiste.hidden = true;
            }
          }, 210);
        }
      }
    }
  };

  const schreibeUrlZustand = () => {
    const params = new URLSearchParams(window.location.search);

    if (zustand.vegetarisch) {
      params.set('veg', '1');
    } else {
      params.delete('veg');
    }

    if (zustand.kategorien.size > 0) {
      params.set('kat', Array.from(zustand.kategorien).join(','));
    } else {
      params.delete('kat');
    }

    if (zustand.mitZutaten.size > 0) {
      params.set('mit', Array.from(zustand.mitZutaten).join(','));
    } else {
      params.delete('mit');
    }

    if (zustand.ohneZutaten.size > 0) {
      params.set('ohne', Array.from(zustand.ohneZutaten).join(','));
    } else {
      params.delete('ohne');
    }

    if (zustand.maxPreis !== null) {
      params.set('preis', String(zustand.maxPreis));
    } else {
      params.delete('preis');
    }

    if (zustand.ohneAllergene.size > 0) {
      params.set('allergen', Array.from(zustand.ohneAllergene).join(','));
    } else {
      params.delete('allergen');
    }

    const query = params.toString();
    const neueUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
    window.history.replaceState(window.history.state, '', neueUrl);
  };

  const ladeUrlZustand = () => {
    const params = new URLSearchParams(window.location.search);
    zustand.vegetarisch = params.get('veg') === '1';

    zustand.kategorien.clear();
    const katParam = params.get('kat');
    if (katParam) {
      for (const id of katParam.split(',')) {
        if (kategorieNameNachId.has(id)) zustand.kategorien.add(id);
      }
    }

    zustand.mitZutaten.clear();
    const mitParam = params.get('mit');
    if (mitParam) {
      for (const id of mitParam.split(',')) {
        if (zutatNachId.has(id)) zustand.mitZutaten.add(id);
      }
    }

    zustand.ohneZutaten.clear();
    const ohneParam = params.get('ohne');
    if (ohneParam) {
      for (const id of ohneParam.split(',')) {
        if (zutatNachId.has(id) && !zustand.mitZutaten.has(id)) {
          zustand.ohneZutaten.add(id);
        }
      }
    }

    const preisRoh = params.get('preis');
    const preisNum = preisRoh ? Number(preisRoh) : NaN;
    zustand.maxPreis = ERLAUBTE_PREISE.has(preisNum) ? preisNum : null;

    zustand.ohneAllergene.clear();
    const allergenParam = params.get('allergen');
    if (allergenParam) {
      for (const kuerzel of allergenParam.split(',')) {
        if (allergenLabelNachKuerzel.has(kuerzel)) zustand.ohneAllergene.add(kuerzel);
      }
    }
  };

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
    hatFilter: boolean,
    mehrereBegriffe: boolean,
    istTeilweise: boolean,
    sofort: boolean,
  ) => {
    window.clearTimeout(statusTimer);
    const schreiben = () => {
      if (!hatSuche && !hatFilter) {
        statusEl.textContent = statusAlle.replace('{anzahl}', anzahlGesamt);
      } else if (treffer === 0) {
        statusEl.textContent = statusLeer;
      } else if (istTeilweise) {
        statusEl.textContent =
          treffer === 1
            ? statusTeilweiseSingular
            : statusTeilweisePlural.replace('{anzahl}', String(treffer));
      } else if (hatSuche && mehrereBegriffe) {
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

    if (zielRect.top >= leistenUnten - 8 && zielRect.top <= window.innerHeight - 80) {
      return;
    }

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

  const wendeFilterAn = async (sofort: boolean, ausloeser: 'suche' | 'filter' | 'init' = 'suche') => {
    const meine = ++generation;
    const rohWert = eingabe.value.trim();
    const tokens = zerlegeSuchbegriffe(rohWert);
    const hatSuche = tokens.length > 0;
    const hatFilter = istFilterAktiv();

    if (leerenBtn) {
      leerenBtn.hidden = eingabe.value.length === 0;
    }

    if (hatSuche || hatFilter) {
      window.dispatchEvent(new CustomEvent('einblenden:sofort'));
    }

    // Filter und 2-stufige Suche gemeinsam (UND-Verknüpfung) bewerten
    let vollTrefferAnzahl = 0;
    let teilTrefferAnzahl = 0;
    const filterErgebnis = new Map<GerichtEintrag, boolean>();

    for (const gericht of alleGerichte) {
      const passtFilter = gerichtPasstFilter(gericht);
      filterErgebnis.set(gericht, passtFilter);

      if (!passtFilter || !hatSuche) {
        gericht.trefferAnzahl = 0;
        gericht.fehlende = [];
        gericht.getroffeneTokens = [];
        gericht.passt = passtFilter;
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

    const besteTrefferzahl = Math.max(
      0,
      ...alleGerichte.filter((g) => filterErgebnis.get(g)).map((g) => g.trefferAnzahl),
    );
    const mindestTreffer = besteTrefferzahl >= 2 ? 2 : 1;

    let sichtbareGerichte = 0;
    for (const gericht of alleGerichte) {
      const passtFilter = filterErgebnis.get(gericht) ?? false;
      if (!passtFilter) {
        gericht.passt = false;
      } else if (!hatSuche) {
        gericht.passt = true;
      } else if (istTeiltrefferModus) {
        gericht.passt = gericht.trefferAnzahl >= mindestTreffer;
      } else {
        gericht.passt = gericht.trefferAnzahl === tokens.length;
      }
      if (gericht.passt) sichtbareGerichte++;
    }

    aktualisiereFilterUi(sichtbareGerichte);

    const animieren = !sofort && kannAnimieren();
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
      if (kat.extras) {
        kat.extras.hidden =
          hatSuche ||
          zustand.vegetarisch ||
          zustand.mitZutaten.size > 0 ||
          zustand.ohneZutaten.size > 0 ||
          zustand.maxPreis !== null ||
          zustand.ohneAllergene.size > 0;
      }
    }

    if (istTeiltrefferModus) {
      teiltrefferBanner.textContent = textTeiltrefferHinweis.replace(
        '{anzahl}',
        String(tokens.length),
      );
      teiltrefferBanner.hidden = false;
    } else {
      teiltrefferBanner.hidden = true;
    }

    const zeigeLeer = (hatSuche || hatFilter) && sichtbareGerichte === 0;
    if (zeigeLeer) {
      leerTextEl.textContent = hatSuche
        ? textKeinTreffer.replace('{begriff}', rohWert)
        : textKeinTrefferFilter;
      leerBox.hidden = false;
    } else {
      leerBox.hidden = true;
    }

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
    meldeStatus(
      sichtbareGerichte,
      hatSuche,
      hatFilter,
      tokens.length >= 2,
      istTeiltrefferModus,
      sofort,
    );

    if (ausloeser === 'suche' && hatSuche) {
      const erstesZiel = zeigeLeer
        ? leerBox
        : istTeiltrefferModus
          ? teiltrefferBanner
          : kategorien.find((k) => !k.el.hidden)?.el ?? null;
      scrolleZuErstemErgebnisWennNoetig(erstesZiel);
    }
  };

  function beiFilterAenderung(sofort = true) {
    schreibeUrlZustand();
    void wendeFilterAn(sofort, 'filter');
  }

  function filterZuruecksetzen() {
    zustand.vegetarisch = false;
    zustand.kategorien.clear();
    zustand.mitZutaten.clear();
    zustand.ohneZutaten.clear();
    zustand.maxPreis = null;
    zustand.ohneAllergene.clear();
    beiFilterAenderung(true);
  }

  // ---------- Filter-Dialog (Mobil Bottom-Sheet & Desktop Popover) ----------
  let panelOffen = false;
  let panelGeneration = 0;

  const holeFokussierbareElemente = (): HTMLElement[] => {
    if (!filterPanel) return [];
    return Array.from(
      filterPanel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => !el.closest('[hidden]') && el.getClientRects().length > 0);
  };

  const oeffnePanel = () => {
    if (!filterPanel || !filterBackdrop || !filterBtn || panelOffen) return;
    const meine = ++panelGeneration;
    panelOffen = true;

    filterBackdrop.hidden = false;
    filterPanel.hidden = false;
    filterBtn.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('filter-offen');

    if (!reduziertMedia.matches) {
      void filterPanel.offsetHeight;
    }

    if (meine !== panelGeneration) return;
    filterBackdrop.classList.add('ist-offen');
    filterPanel.classList.add('ist-offen');

    const fokusZiel = fertigBtn ?? holeFokussierbareElemente()[0] ?? filterPanel;
    fokusZiel.focus({ preventScroll: true });
  };

  const schliessePanel = (fokusZurueck: boolean) => {
    if (!filterPanel || !filterBackdrop || !filterBtn || !panelOffen) return;
    const meine = ++panelGeneration;
    panelOffen = false;

    filterBackdrop.classList.remove('ist-offen');
    filterPanel.classList.remove('ist-offen');
    filterBtn.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('filter-offen');

    const verstecken = () => {
      if (meine !== panelGeneration || panelOffen) return;
      filterBackdrop.hidden = true;
      filterPanel.hidden = true;
    };

    if (reduziertMedia.matches) {
      verstecken();
    } else {
      window.setTimeout(verstecken, desktopMedia.matches ? 210 : 360);
    }

    if (fokusZurueck) {
      filterBtn.focus({ preventScroll: true });
    }
  };

  filterBtn?.addEventListener('click', () => {
    if (panelOffen) {
      schliessePanel(true);
    } else {
      oeffnePanel();
    }
  });

  fertigBtn?.addEventListener('click', () => schliessePanel(true));
  anzeigenBtn?.addEventListener('click', () => schliessePanel(true));
  filterBackdrop?.addEventListener('click', () => schliessePanel(true));
  resetBtn?.addEventListener('click', filterZuruecksetzen);
  aktiveFilterResetBtn?.addEventListener('click', filterZuruecksetzen);

  document.addEventListener('keydown', (event) => {
    if (!panelOffen || !filterPanel) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      schliessePanel(true);
      return;
    }

    if (event.key === 'Tab') {
      const elemente = holeFokussierbareElemente();
      if (elemente.length === 0) {
        event.preventDefault();
        filterPanel.focus();
        return;
      }

      const erstes = elemente[0];
      const letztes = elemente[elemente.length - 1];
      const aktuell = document.activeElement;
      const imPanel = filterPanel.contains(aktuell);

      if (event.shiftKey && (!imPanel || aktuell === erstes)) {
        event.preventDefault();
        letztes.focus();
      } else if (!event.shiftKey && (!imPanel || aktuell === letztes)) {
        event.preventDefault();
        erstes.focus();
      }
    }
  });

  // a) Vegetarisch-Schalter
  const schalteVegetarisch = () => {
    zustand.vegetarisch = !zustand.vegetarisch;
    beiFilterAenderung();
  };

  vegSwitch?.addEventListener('click', (event) => {
    event.stopPropagation();
    schalteVegetarisch();
  });

  vegZeile?.addEventListener('click', () => {
    schalteVegetarisch();
    vegSwitch?.focus();
  });

  // b) Kategorien-Chips
  for (const btn of katChips) {
    btn.addEventListener('click', () => {
      const id = btn.dataset.filterKat;
      if (!id) return;
      if (zustand.kategorien.has(id)) {
        zustand.kategorien.delete(id);
      } else {
        zustand.kategorien.add(id);
      }
      beiFilterAenderung();
    });
  }

  // c) Zutaten-Chips (3-stufig: neutral -> mit -> ohne -> neutral)
  zutatenListeEl?.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const btn = target?.closest<HTMLButtonElement>('[data-filter-zutat]');
    const id = btn?.dataset.filterZutat;
    if (!id) return;

    const aktuell = holeZutatZustand(id);
    if (aktuell === 'neutral') {
      zustand.mitZutaten.add(id);
      zustand.ohneZutaten.delete(id);
    } else if (aktuell === 'mit') {
      zustand.mitZutaten.delete(id);
      zustand.ohneZutaten.add(id);
    } else {
      zustand.mitZutaten.delete(id);
      zustand.ohneZutaten.delete(id);
    }
    beiFilterAenderung();
  });

  // d) Preis Segmented Control (Radiogroup-Muster)
  const waehlePreisSegment = (radio: HTMLButtonElement, fokussieren: boolean) => {
    const wert = radio.dataset.filterPreis ?? '';
    const zahl = wert ? Number(wert) : null;
    zustand.maxPreis = zahl !== null && ERLAUBTE_PREISE.has(zahl) ? zahl : null;
    beiFilterAenderung();
    if (fokussieren) radio.focus();
  };

  for (const radio of preisRadios) {
    radio.addEventListener('click', () => waehlePreisSegment(radio, false));
  }

  preisGruppe?.addEventListener('keydown', (event) => {
    if (preisRadios.length === 0) return;
    const aktuellIndex = preisRadios.findIndex((r) => r === document.activeElement);
    if (aktuellIndex === -1) return;

    let zielIndex: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      zielIndex = (aktuellIndex + 1) % preisRadios.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      zielIndex = (aktuellIndex - 1 + preisRadios.length) % preisRadios.length;
    } else if (event.key === 'Home') {
      zielIndex = 0;
    } else if (event.key === 'End') {
      zielIndex = preisRadios.length - 1;
    }

    if (zielIndex !== null) {
      event.preventDefault();
      waehlePreisSegment(preisRadios[zielIndex], true);
    }
  });

  // e) Allergen-Chips
  for (const btn of allergenChips) {
    btn.addEventListener('click', () => {
      const kuerzel = btn.dataset.filterAllergen;
      if (!kuerzel) return;
      if (zustand.ohneAllergene.has(kuerzel)) {
        zustand.ohneAllergene.delete(kuerzel);
      } else {
        zustand.ohneAllergene.add(kuerzel);
      }
      beiFilterAenderung();
    });
  }

  // Sucheingabe
  eingabe.addEventListener('input', () => {
    if (leerenBtn) leerenBtn.hidden = eingabe.value.length === 0;
    window.clearTimeout(eingabeTimer);
    eingabeTimer = window.setTimeout(() => {
      void wendeFilterAn(false, 'suche');
    }, 80);
  });

  eingabe.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && eingabe.value.length > 0) {
      event.preventDefault();
      window.clearTimeout(eingabeTimer);
      eingabe.value = '';
      void wendeFilterAn(true, 'suche');
    }
  });

  leerenBtn?.addEventListener('click', () => {
    window.clearTimeout(eingabeTimer);
    eingabe.value = '';
    void wendeFilterAn(true, 'suche');
    eingabe.focus();
  });

  // Initialen Filterzustand aus URL laden und anwenden
  ladeUrlZustand();
  void wendeFilterAn(true, 'init');

  window.addEventListener('popstate', () => {
    ladeUrlZustand();
    void wendeFilterAn(true, 'init');
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

    let katNameFuerKategorie = id;
    const abschnitte: AbschnittEintrag[] = [];
    for (const absEl of Array.from(sektion.querySelectorAll<HTMLElement>('[data-abschnitt]'))) {
      const liste = absEl.querySelector<HTMLElement>('[data-gerichte-liste]');
      if (!liste) continue;

      const gerichte: GerichtEintrag[] = [];
      for (const gerichtEl of Array.from(absEl.querySelectorAll<HTMLElement>('[data-gericht]'))) {
        const felder: TextFeld[] = [];
        let nameUndBeschreibung = '';

        for (const feldEl of Array.from(gerichtEl.querySelectorAll<HTMLElement>('[data-feld]'))) {
          const original = feldEl.dataset.original ?? feldEl.textContent ?? '';
          const feldTyp = feldEl.dataset.feld ?? '';
          if (feldTyp === 'name' || feldTyp === 'beschreibung') {
            nameUndBeschreibung += ` ${original}`;
          }
          felder.push({
            el: feldEl,
            original,
            umlaut: normalisiereMitIndex(original, true),
            einfach: normalisiereMitIndex(original, false),
          });
        }

        const katId = gerichtEl.dataset.kategorieId ?? id;
        const katName = gerichtEl.dataset.kategorieName ?? '';
        if (katName) katNameFuerKategorie = katName;
        const absTitel = gerichtEl.dataset.abschnittTitel ?? '';
        const kontext = `${katName} ${absTitel}`;
        const preisRoh = gerichtEl.dataset.preis;
        const preisZahl = preisRoh !== undefined && preisRoh !== '' ? Number(preisRoh) : null;
        const kennzRoh = gerichtEl.dataset.kennzeichnung ?? '';
        const kennzeichnungen = new Set(
          kennzRoh
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
        );

        gerichte.push({
          el: gerichtEl,
          index: Number(gerichtEl.dataset.index ?? gerichte.length),
          kategorieId: katId,
          vegetarisch: gerichtEl.dataset.vegetarisch === '1',
          preis: preisZahl !== null && Number.isFinite(preisZahl) ? preisZahl : null,
          kennzeichnungen,
          zutaten: new Set<string>(),
          zutatSuchtext: normalisiereMitIndex(nameUndBeschreibung, true).text,
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
      name: katNameFuerKategorie,
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
  initExtrasDetails();
  initSucheUndFilter(kategorien);
}

initSpeisekarte();
