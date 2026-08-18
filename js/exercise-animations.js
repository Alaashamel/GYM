/* ============================================
   IRON FORGE GYM — Animated Exercise Form Diagrams
   رسم توضيحي متحرك (شكل بشري مبسط) لكل نمط حركة،
   مبني بالكامل بـ SVG + CSS Animations (بدون صور/فيديوهات)
   ============================================ */

const PATTERN_LABELS = {
  push:   { ar:'حركة دفع', en:'Push Movement' },
  pull:   { ar:'حركة سحب', en:'Pull Movement' },
  squat:  { ar:'حركة سكوات', en:'Squat Movement' },
  hinge:  { ar:'حركة انحناء الورك', en:'Hip-Hinge Movement' },
  press:  { ar:'حركة دفع علوي', en:'Overhead Press' },
  curl:   { ar:'حركة ثني الذراع', en:'Arm Curl' },
  core:   { ar:'حركة بطن', en:'Core Movement' },
  cardio: { ar:'حركة كارديو', en:'Cardio Movement' },
};

function getPatternSVG(pattern, uid){
  const gradId = `figGrad-${uid}`;
  const defs = `<defs><linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#FF4B1F"/><stop offset="1" stop-color="#FFB020"/>
  </linearGradient></defs>`;
  const stroke = `stroke="url(#${gradId})"`;
  const dim = `stroke="var(--border)"`;

  const bodies = {
    push: `
      ${defs}
      <line x1="14" y1="82" x2="86" y2="82" ${dim} stroke-width="2" stroke-dasharray="3 5"/>
      <circle cx="34" cy="34" r="9" ${stroke} stroke-width="4" fill="none"/>
      <line x1="34" y1="43" x2="54" y2="70" ${stroke} stroke-width="5" stroke-linecap="round"/>
      <line x1="54" y1="70" x2="54" y2="82" ${stroke} stroke-width="5" stroke-linecap="round"/>
      <g class="fig-part anim-push" style="transform-origin:34px 48px;">
        <line x1="34" y1="48" x2="70" y2="48" ${stroke} stroke-width="5" stroke-linecap="round"/>
        <rect x="66" y="40" width="7" height="16" rx="2" fill="url(#${gradId})"/>
      </g>`,
    pull: `
      ${defs}
      <line x1="14" y1="82" x2="86" y2="82" ${dim} stroke-width="2" stroke-dasharray="3 5"/>
      <circle cx="66" cy="34" r="9" ${stroke} stroke-width="4" fill="none"/>
      <line x1="66" y1="43" x2="50" y2="70" ${stroke} stroke-width="5" stroke-linecap="round"/>
      <line x1="50" y1="70" x2="50" y2="82" ${stroke} stroke-width="5" stroke-linecap="round"/>
      <rect x="26" y="40" width="7" height="16" rx="2" fill="var(--surface-raised)" stroke="var(--border)"/>
      <g class="fig-part anim-pull" style="transform-origin:66px 48px;">
        <line x1="66" y1="48" x2="30" y2="48" ${stroke} stroke-width="5" stroke-linecap="round"/>
      </g>`,
    squat: `
      ${defs}
      <line x1="14" y1="90" x2="86" y2="90" ${dim} stroke-width="2" stroke-dasharray="3 5"/>
      <g class="fig-part anim-squat" style="transform-origin:50px 90px;">
        <circle cx="50" cy="26" r="9" ${stroke} stroke-width="4" fill="none"/>
        <line x1="50" y1="35" x2="50" y2="58" ${stroke} stroke-width="5" stroke-linecap="round"/>
        <line x1="34" y1="40" x2="66" y2="40" ${stroke} stroke-width="5" stroke-linecap="round"/>
        <rect x="26" y="34" width="7" height="14" rx="2" fill="var(--surface-raised)" stroke="var(--border)"/>
        <rect x="67" y="34" width="7" height="14" rx="2" fill="var(--surface-raised)" stroke="var(--border)"/>
        <line x1="50" y1="58" x2="38" y2="90" ${stroke} stroke-width="5" stroke-linecap="round"/>
        <line x1="50" y1="58" x2="62" y2="90" ${stroke} stroke-width="5" stroke-linecap="round"/>
      </g>`,
    hinge: `
      ${defs}
      <line x1="14" y1="90" x2="86" y2="90" ${dim} stroke-width="2" stroke-dasharray="3 5"/>
      <line x1="50" y1="58" x2="42" y2="90" ${stroke} stroke-width="5" stroke-linecap="round"/>
      <line x1="50" y1="58" x2="58" y2="90" ${stroke} stroke-width="5" stroke-linecap="round"/>
      <g class="fig-part anim-hinge" style="transform-origin:50px 58px;">
        <circle cx="50" cy="24" r="9" ${stroke} stroke-width="4" fill="none"/>
        <line x1="50" y1="33" x2="50" y2="58" ${stroke} stroke-width="5" stroke-linecap="round"/>
        <line x1="50" y1="40" x2="30" y2="66" ${stroke} stroke-width="5" stroke-linecap="round"/>
        <rect x="18" y="60" width="26" height="6" rx="3" fill="url(#${gradId})"/>
      </g>`,
    press: `
      ${defs}
      <line x1="14" y1="88" x2="86" y2="88" ${dim} stroke-width="2" stroke-dasharray="3 5"/>
      <circle cx="50" cy="30" r="9" ${stroke} stroke-width="4" fill="none"/>
      <line x1="50" y1="39" x2="50" y2="64" ${stroke} stroke-width="5" stroke-linecap="round"/>
      <line x1="50" y1="64" x2="40" y2="88" ${stroke} stroke-width="5" stroke-linecap="round"/>
      <line x1="50" y1="64" x2="60" y2="88" ${stroke} stroke-width="5" stroke-linecap="round"/>
      <g class="fig-part anim-press" style="transform-origin:50px 44px;">
        <line x1="50" y1="44" x2="50" y2="18" ${stroke} stroke-width="5" stroke-linecap="round"/>
        <rect x="41" y="10" width="18" height="6" rx="3" fill="url(#${gradId})"/>
      </g>`,
    curl: `
      ${defs}
      <line x1="14" y1="88" x2="86" y2="88" ${dim} stroke-width="2" stroke-dasharray="3 5"/>
      <circle cx="50" cy="26" r="9" ${stroke} stroke-width="4" fill="none"/>
      <line x1="50" y1="35" x2="50" y2="62" ${stroke} stroke-width="5" stroke-linecap="round"/>
      <line x1="50" y1="62" x2="42" y2="88" ${stroke} stroke-width="5" stroke-linecap="round"/>
      <line x1="50" y1="62" x2="58" y2="88" ${stroke} stroke-width="5" stroke-linecap="round"/>
      <line x1="50" y1="44" x2="66" y2="52" ${stroke} stroke-width="5" stroke-linecap="round"/>
      <g class="fig-part anim-curl" style="transform-origin:66px 52px;">
        <line x1="66" y1="52" x2="66" y2="74" ${stroke} stroke-width="5" stroke-linecap="round"/>
        <rect x="60" y="72" width="12" height="6" rx="3" fill="url(#${gradId})"/>
      </g>`,
    core: `
      ${defs}
      <line x1="14" y1="86" x2="86" y2="86" ${dim} stroke-width="2" stroke-dasharray="3 5"/>
      <line x1="30" y1="86" x2="50" y2="70" ${stroke} stroke-width="5" stroke-linecap="round"/>
      <line x1="50" y1="70" x2="70" y2="86" ${stroke} stroke-width="5" stroke-linecap="round"/>
      <g class="fig-part anim-core" style="transform-origin:50px 70px;">
        <circle cx="30" cy="52" r="8" ${stroke} stroke-width="4" fill="none"/>
        <line x1="35" y1="58" x2="50" y2="70" ${stroke} stroke-width="5" stroke-linecap="round"/>
      </g>`,
    cardio: `
      ${defs}
      <line x1="14" y1="90" x2="86" y2="90" ${dim} stroke-width="2" stroke-dasharray="3 5"/>
      <circle cx="52" cy="22" r="9" ${stroke} stroke-width="4" fill="none"/>
      <line x1="50" y1="31" x2="46" y2="56" ${stroke} stroke-width="5" stroke-linecap="round"/>
      <g class="fig-part anim-run-arm1" style="transform-origin:47px 38px;">
        <line x1="47" y1="38" x2="34" y2="30" ${stroke} stroke-width="4" stroke-linecap="round"/>
      </g>
      <g class="fig-part anim-run-arm2" style="transform-origin:47px 38px;">
        <line x1="47" y1="38" x2="60" y2="48" ${stroke} stroke-width="4" stroke-linecap="round"/>
      </g>
      <g class="fig-part anim-run-leg1" style="transform-origin:46px 56px;">
        <line x1="46" y1="56" x2="30" y2="70" ${stroke} stroke-width="5" stroke-linecap="round"/>
        <line x1="30" y1="70" x2="36" y2="88" ${stroke} stroke-width="5" stroke-linecap="round"/>
      </g>
      <g class="fig-part anim-run-leg2" style="transform-origin:46px 56px;">
        <line x1="46" y1="56" x2="62" y2="66" ${stroke} stroke-width="5" stroke-linecap="round"/>
        <line x1="62" y1="66" x2="58" y2="88" ${stroke} stroke-width="5" stroke-linecap="round"/>
      </g>`,
  };

  return `<svg viewBox="0 0 100 100" class="pattern-fig">${bodies[pattern] || bodies.push}</svg>`;
}
