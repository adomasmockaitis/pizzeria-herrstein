// Setzt die Klasse "nach-hero" auf <html>, sobald der Hero nicht mehr sichtbar ist.
// Header (kompakte Leiste) und Aktionsleiste reagieren per CSS darauf.
// Seiten ohne Hero (Unterseiten) bekommen die Klasse sofort.

const wurzel = document.documentElement;
const hero = document.querySelector<HTMLElement>('[data-hero-sentinel]');

if (!hero || !('IntersectionObserver' in window)) {
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
