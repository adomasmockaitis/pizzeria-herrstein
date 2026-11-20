// Gemeinsame Erst-Einblendung für Abschnitte und Blöcke mit [data-einblenden].
// Ohne JS bleiben alle Elemente sichtbar; der versteckte Ausgangszustand wird nur per JS gesetzt.

const reduziertMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
const wartend = new Set<HTMLElement>();
let beobachter: IntersectionObserver | undefined;

const zeigeElement = (el: HTMLElement, animieren: boolean) => {
  wartend.delete(el);
  beobachter?.unobserve(el);

  if (!animieren || reduziertMedia.matches) {
    el.classList.remove('einblenden-bereit', 'einblenden-aktiv');
    return;
  }

  el.classList.add('einblenden-aktiv');
  el.classList.remove('einblenden-bereit');
  window.setTimeout(() => {
    el.classList.remove('einblenden-aktiv');
  }, 380);
};

const zeigeAlleSofort = () => {
  for (const el of Array.from(wartend)) {
    zeigeElement(el, false);
  }
  wartend.clear();
};

function initEinblenden() {
  const elemente = Array.from(document.querySelectorAll<HTMLElement>('[data-einblenden]'));
  if (elemente.length === 0) return;

  if (
    reduziertMedia.matches ||
    !('IntersectionObserver' in window) ||
    window.location.hash.length > 1
  ) {
    return;
  }

  beobachter = new IntersectionObserver(
    (eintraege) => {
      for (const eintrag of eintraege) {
        if (!eintrag.isIntersecting) continue;
        const el = eintrag.target as HTMLElement;
        if (!wartend.has(el)) continue;
        zeigeElement(el, true);
      }
    },
    { rootMargin: '0px 0px -24px 0px', threshold: 0.01 },
  );

  for (const el of elemente) {
    if (el.getBoundingClientRect().top > window.innerHeight * 0.95) {
      el.classList.add('einblenden-bereit');
      wartend.add(el);
      beobachter.observe(el);
    }
  }

  // Vom Seitenübergang (Inline-Skript in BaseLayout) gesetzt, wenn mit Anker (#pizza) angekommen
  if ((window as Window & { __einblendenSofort?: boolean }).__einblendenSofort) zeigeAlleSofort();
  window.addEventListener('einblenden:sofort', zeigeAlleSofort);
  window.addEventListener('speisekarte:ankersprung', zeigeAlleSofort);
  window.addEventListener('speisekarte:filter', zeigeAlleSofort);
  window.addEventListener('hashchange', zeigeAlleSofort);
  reduziertMedia.addEventListener('change', (event) => {
    if (event.matches) zeigeAlleSofort();
  });
}

initEinblenden();
