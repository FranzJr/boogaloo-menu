/* Tema de temporada: Halloween. Se activa solo del 1 de octubre al 1 de
   noviembre (hora de Japón) y se apaga solo después. Para probarlo fuera de
   temporada agrega ?halloween=1 a la dirección (o ?halloween=0 para apagarlo).
   Es un toque ligero: colores morado/naranja, telarañas en las esquinas del
   encabezado y del pie, una arañita colgando y el osito vampiro. Se carga en
   el <head> para que los colores estén listos antes de pintar la página. */
(function () {
  const forced = new URLSearchParams(location.search).get('halloween');
  const [, month, day] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date())
    .split('-')
    .map(Number);
  const inSeason = month === 10 || (month === 11 && day <= 1);
  const on = forced === '1' ? true : forced === '0' ? false : inSeason;

  window.HALLOWEEN = on;
  if (!on) return;
  document.documentElement.classList.add('halloween');

  // Telaraña de esquina (esquina superior izquierda; la derecha es el espejo).
  function webSvg() {
    const R = 118;
    const angles = [0, 18, 36, 54, 72, 90].map((a) => (a * Math.PI) / 180);
    const pt = (r, a) => [(r * Math.cos(a)).toFixed(1), (r * Math.sin(a)).toFixed(1)];
    const spokes = angles.map((a) => `M0,0 L${pt(R, a).join(',')}`).join(' ');
    const rings = [24, 46, 70, 96]
      .map((r) =>
        angles
          .slice(0, -1)
          .map((a, i) => {
            const b = angles[i + 1];
            const mid = (a + b) / 2;
            return `M${pt(r, a).join(',')} Q${pt(r * 0.8, mid).join(',')} ${pt(r, b).join(',')}`;
          })
          .join(' ')
      )
      .join(' ');
    return `<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false"><path d="${spokes}" /><path d="${rings}" /></svg>`;
  }

  function spiderSvg() {
    return `<svg viewBox="0 0 40 92" aria-hidden="true" focusable="false">
      <line x1="20" y1="0" x2="20" y2="58" stroke="#8b7a99" stroke-width="1.2" />
      <g stroke="#2b1636" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 62 L4 54 L2 63" /><path d="M13 66 L2 66 L3 77" /><path d="M14 70 L5 77 L7 87" /><path d="M16 72 L11 82 L13 90" />
        <path d="M26 62 L36 54 L38 63" /><path d="M27 66 L38 66 L37 77" /><path d="M26 70 L35 77 L33 87" /><path d="M24 72 L29 82 L27 90" />
      </g>
      <ellipse cx="20" cy="68" rx="9" ry="9.5" fill="#2b1636" /><circle cx="20" cy="58" r="5.5" fill="#2b1636" />
      <circle cx="18" cy="57" r="1.3" fill="#fff" /><circle cx="22" cy="57" r="1.3" fill="#fff" />
      <path d="M20 63 l-2 4 h4 z" fill="#f97316" />
    </svg>`;
  }

  function decorate() {
    const header = document.querySelector('.site-header');
    const footer = document.querySelector('.site-footer');
    const top = header || (document.body.classList.contains('lk-body') ? document.body : null);
    const add = (parent, cls, svg) => {
      const el = document.createElement('span');
      el.className = 'hw-deco ' + cls;
      el.innerHTML = svg;
      parent.appendChild(el);
    };
    if (top) {
      add(top, 'hw-web hw-web-l', webSvg());
      add(top, 'hw-web hw-web-r', webSvg());
      add(top, 'hw-spider', spiderSvg());
    }
    if (footer) {
      add(footer, 'hw-web hw-web-l hw-web-light hw-web-foot', webSvg());
      add(footer, 'hw-web hw-web-r hw-web-light hw-web-foot', webSvg());
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', decorate);
  else decorate();
})();
