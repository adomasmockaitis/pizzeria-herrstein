// Steuert Scroll-Zustände auf <html>:
// - "gescrollt": sobald scrollY > 8px (steuert kompakte Header-Leiste)
// - "nach-hero": sobald der Hero nicht mehr sichtbar ist (steuert mobile Aktionsleiste unten)
// - "--header-top": setzt den Abstand des fixed Headers exakt unter Demo-Balken/Hinweis-Banner (ohne Springen)

const wurzel = document.documentElement;
const hero = document.querySelector<HTMLElement>('[data-hero-sentinel]');
const headerAnker = document.querySelector<HTMLElement>('[data-header-anker]');

let letzterHeaderTop = -1;

const aktualisiereHeaderTop = () => {
  const wert = headerAnker
    ? Math.max(0, Math.round(headerAnker.getBoundingClientRect().top))
    : 0;
  if (wert !== letzterHeaderTop) {
    letzterHeaderTop = wert;
    wurzel.style.setProperty('--header-top', `${wert}px`);
  }
};

const aktualisiereScrollZustand = () => {
  if (hero) {
    wurzel.classList.toggle('gescrollt', window.scrollY > 8);
  }
  aktualisiereHeaderTop();
};

if (!hero) {
  // Unterseiten ohne Hero: Leiste und Aktionsleiste von Anfang an aktiv
  wurzel.classList.add('nach-hero', 'gescrollt');
} else if (!('IntersectionObserver' in window)) {
  wurzel.classList.add('nach-hero');
} else {
  // Oberer Rand 44px: Der Hero gilt als "weg", sobald er unter der kompakten Leiste verschwunden ist.
  const beobachter = new IntersectionObserver(
    ([eintrag]) => {
      wurzel.classList.toggle('nach-hero', !eintrag.isIntersecting);
    },
    { rootMargin: '-44px 0px 0px 0px' },
  );
  beobachter.observe(hero);
}

aktualisiereScrollZustand();

let rahmenAngefordert = false;
const beiScrollOderResize = () => {
  if (rahmenAngefordert) return;
  rahmenAngefordert = true;
  window.requestAnimationFrame(() => {
    rahmenAngefordert = false;
    aktualisiereScrollZustand();
  });
};

window.addEventListener('scroll', beiScrollOderResize, { passive: true });
window.addEventListener('resize', beiScrollOderResize, { passive: true });
