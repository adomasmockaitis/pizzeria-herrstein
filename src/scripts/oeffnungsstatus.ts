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

export interface Oeffnungsstatus {
  offen: boolean;
  text: string;
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
      text: heutigeSonderzeit.text
        ? `Geschlossen · ${heutigeSonderzeit.text}`
        : 'Geschlossen',
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
          return {
            offen: true,
            text: `Jetzt geöffnet · bis ${spanne.bis} Uhr`,
          };
        }
      }

      const naechsteHeute = sortierteZeiten.find(
        (spanne) => zuMinuten(spanne.von) > jetztMinuten,
      );
      if (naechsteHeute) {
        return {
          offen: false,
          text: `Geschlossen · öffnet heute ${naechsteHeute.von} Uhr`,
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
          text: `Geschlossen · öffnet ${zielTag.tag} ${erste.von} Uhr`,
        };
      }
    }
  }

  return {
    offen: false,
    text: 'Derzeit geschlossen',
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
): { tageLabel: string; zeitenText: string }[] {
  const { offeneGruppen } = gruppiereOeffnungszeiten(tage);

  return offeneGruppen.map((gruppe) => {
    const tageLabel =
      gruppe.von === gruppe.bis ? `${gruppe.von}:` : `${gruppe.von} bis ${gruppe.bis}:`;
    const zeitenText = gruppe.zeiten.map((z) => `${z.von}–${z.bis} Uhr`).join(' & ');
    return { tageLabel, zeitenText };
  });
}
