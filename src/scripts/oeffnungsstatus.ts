// Reine Berechnungs- und Formatierungshelfer für Öffnungszeiten (Zeitzone Europe/Berlin)

export interface Zeitspanne {
  von: string;
  bis: string;
}

export interface WochentagEintrag {
  tag: string;
  kuerzel: string;
  ruhetag: boolean;
  zeiten: Zeitspanne[];
}

export interface SonderzeitEintrag {
  datum: {
    von: string;
    bis: string;
  };
  geschlossen: boolean;
  text: string;
}

export interface OeffnungszeitenDaten {
  zeitzone?: string;
  tage: WochentagEintrag[];
  sonderzeiten?: SonderzeitEintrag[];
}

/** offen = grün, bald = schließt in ≤ SCHLIESST_BALD_MINUTEN (gelb), zu = geschlossen (rot) */
export type OeffnungsZustand = 'offen' | 'bald' | 'zu';

export interface Oeffnungsstatus {
  offen: boolean;
  zustand: OeffnungsZustand;
  text: string;
}

/** Ab so vielen Minuten vor Schließung gilt „schließt bald“. */
export const SCHLIESST_BALD_MINUTEN = 30;

export interface OeffnungsstatusTexte {
  jetztGeoeffnet: string;
  schliesstBald: string;
  oeffnetHeute: string;
  oeffnetTag: string;
  geschlossenMitHinweis: string;
  geschlossen: string;
  derzeitGeschlossen: string;
}

export interface OeffnungszeitenKurzTexte {
  tageBereich: string;
  zeitspanneKurz: string;
}

export interface OeffnungszeitenGruppe {
  von: string;
  bis: string;
  zeiten: Zeitspanne[];
}

const STANDARD_ZEITZONE = 'Europe/Berlin';

function zuMinuten(uhrzeit: string): number {
  const teile = uhrzeit.split(':');
  const stunden = Number(teile[0] ?? 0);
  const minuten = Number(teile[1] ?? 0);
  return stunden * 60 + minuten;
}

function findeSonderzeit(
  isoDatum: string,
  sonderzeiten: SonderzeitEintrag[],
): SonderzeitEintrag | undefined {
  return sonderzeiten.find(
    (eintrag) => isoDatum >= eintrag.datum.von && isoDatum <= eintrag.datum.bis,
  );
}

function addiereTageIso(jahr: number, monat: number, tag: number, offset: number): string {
  return new Date(Date.UTC(jahr, monat - 1, tag + offset, 12)).toISOString().slice(0, 10);
}

/**
 * Ermittelt für ein gegebenes Datum den Live-Öffnungsstatus anhand von oeffnungszeiten.json.
 */
export function ermittleOeffnungsstatus(
  datum: Date,
  daten: OeffnungszeitenDaten,
  texte: OeffnungsstatusTexte,
): Oeffnungsstatus {
  const timeZone = daten.zeitzone ?? STANDARD_ZEITZONE;
  const formatierer = new Intl.DateTimeFormat('de-DE', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  const teile = formatierer.formatToParts(datum);
  const wert = (typ: Intl.DateTimeFormatPartTypes): string =>
    teile.find((teil) => teil.type === typ)?.value ?? '';

  const jahr = Number(wert('year'));
  const monat = Number(wert('month'));
  const tagNum = Number(wert('day'));
  const heuteIso = `${wert('year')}-${wert('month')}-${wert('day')}`;
  const wochentag = wert('weekday').toLowerCase();
  const stunde = Number(wert('hour')) % 24;
  const minute = Number(wert('minute'));
  const jetztMinuten = stunde * 60 + minute;

  const sonderzeiten = daten.sonderzeiten ?? [];
  const heutigeSonderzeit = findeSonderzeit(heuteIso, sonderzeiten);
  if (heutigeSonderzeit && heutigeSonderzeit.geschlossen) {
    return {
      offen: false,
      zustand: 'zu',
      text: heutigeSonderzeit.text
        ? texte.geschlossenMitHinweis.replace('{text}', heutigeSonderzeit.text)
        : texte.geschlossen,
    };
  }

  const tagIndex = daten.tage.findIndex(
    (eintrag) => eintrag.tag.toLowerCase() === wochentag,
  );

  if (tagIndex !== -1) {
    const heutigerTag = daten.tage[tagIndex];
    if (!heutigerTag.ruhetag && heutigerTag.zeiten.length > 0) {
      const sortierteZeiten = [...heutigerTag.zeiten].sort(
        (a, b) => zuMinuten(a.von) - zuMinuten(b.von),
      );

      for (const spanne of sortierteZeiten) {
        const vonMin = zuMinuten(spanne.von);
        const bisMin = zuMinuten(spanne.bis);
        if (jetztMinuten >= vonMin && jetztMinuten < bisMin) {
          const bald = bisMin - jetztMinuten <= SCHLIESST_BALD_MINUTEN;
          return {
            offen: true,
            zustand: bald ? 'bald' : 'offen',
            text: (bald ? texte.schliesstBald : texte.jetztGeoeffnet).replace('{bis}', spanne.bis),
          };
        }
      }

      const naechsteHeute = sortierteZeiten.find(
        (spanne) => zuMinuten(spanne.von) > jetztMinuten,
      );
      if (naechsteHeute) {
        return {
          offen: false,
          zustand: 'zu',
          text: texte.oeffnetHeute.replace('{von}', naechsteHeute.von),
        };
      }
    }

    for (let offset = 1; offset <= 14; offset++) {
      const zielIso = addiereTageIso(jahr, monat, tagNum, offset);
      const zielSonderzeit = findeSonderzeit(zielIso, sonderzeiten);
      if (zielSonderzeit && zielSonderzeit.geschlossen) {
        continue;
      }

      const zielTag = daten.tage[(tagIndex + offset) % daten.tage.length];
      if (!zielTag.ruhetag && zielTag.zeiten.length > 0) {
        const sortierteZeiten = [...zielTag.zeiten].sort(
          (a, b) => zuMinuten(a.von) - zuMinuten(b.von),
        );
        const erste = sortierteZeiten[0];
        return {
          offen: false,
          zustand: 'zu',
          text: texte.oeffnetTag.replace('{tag}', zielTag.tag).replace('{von}', erste.von),
        };
      }
    }
  }

  return {
    offen: false,
    zustand: 'zu',
    text: texte.derzeitGeschlossen,
  };
}

/**
 * Fasst aufeinanderfolgende Wochentage mit gleichen Öffnungszeiten zu Gruppen zusammen
 * und sammelt Ruhetage separat.
 */
export function gruppiereOeffnungszeiten(tage: WochentagEintrag[]): {
  offeneGruppen: OeffnungszeitenGruppe[];
  ruhetage: string[];
} {
  const offeneGruppen: OeffnungszeitenGruppe[] = [];
  const ruhetage: string[] = [];
  let letzterOffenIndex = -2;
  let letzterSignatur = '';

  tage.forEach((eintrag, index) => {
    if (eintrag.ruhetag || eintrag.zeiten.length === 0) {
      ruhetage.push(eintrag.tag);
      return;
    }

    const signatur = eintrag.zeiten.map((z) => `${z.von}-${z.bis}`).join('|');
    const letzteGruppe = offeneGruppen[offeneGruppen.length - 1];

    if (letzteGruppe && signatur === letzterSignatur && index === letzterOffenIndex + 1) {
      letzteGruppe.bis = eintrag.tag;
    } else {
      offeneGruppen.push({
        von: eintrag.tag,
        bis: eintrag.tag,
        zeiten: eintrag.zeiten,
      });
    }

    letzterOffenIndex = index;
    letzterSignatur = signatur;
  });

  return { offeneGruppen, ruhetage };
}

/**
 * Formatiert gruppierte Öffnungszeiten kompakt für Bestellinformationen.
 */
export function formatiereOeffnungszeitenKurz(
  tage: WochentagEintrag[],
  texte: OeffnungszeitenKurzTexte,
): { tageLabel: string; zeitenText: string }[] {
  const { offeneGruppen } = gruppiereOeffnungszeiten(tage);

  return offeneGruppen.map((gruppe) => {
    const tageLabel =
      gruppe.von === gruppe.bis
        ? `${gruppe.von}:`
        : texte.tageBereich.replace('{von}', gruppe.von).replace('{bis}', gruppe.bis);
    const zeitenText = gruppe.zeiten
      .map((z) => texte.zeitspanneKurz.replace('{von}', z.von).replace('{bis}', z.bis))
      .join(' & ');
    return { tageLabel, zeitenText };
  });
}
