/** The five found tools of the jewellery line, drawn as technical sections. 1 unit = 1 px of the viewBox. */
const NAMES = ['Spirit level', 'Screw clamp', 'Corrugated sheet', 'Structural profile', 'Folding clasp'];
const DE = ['Wasserwaage', 'Schraubzwinge', 'Wellblech', 'Profil', 'Faltschließe'];
const MADE = ['spring bangle', 'screw bangle', 'link bracelet', 'profile bangle', 'cuff'];
const CODE = ['BR / 0??.c', 'BR / 0??.b', 'BR / 0??.e', 'BR / 0??.d', 'BR / 0??.a'];
export const SOURCES = NAMES.map((n, i) => ({ name: n, de: DE[i], made: MADE[i], code: CODE[i] }));

function Tool({ i, cx, cy, u }: { i: number; cx: number; cy: number; u: number }) {
  const s = { fill: 'none', stroke: '#0B0B0B', strokeWidth: 1.15 } as const;
  switch (i) {
    case 0:
      return (<g {...s}>
        <path d={`M${cx - u * 1.9} ${cy - u * .42} h${u * 3.8} v${u * .84} h${-u * 3.8} z`} />
        <path d={`M${cx - u * .46} ${cy - u * .2} a${u * .2} ${u * .2} 0 0 0 0 ${u * .4} h${u * .92} a${u * .2} ${u * .2} 0 0 0 0 ${-u * .4} z`} />
        <path d={`M${cx - u * 1.2} ${cy - u * .42} v${u * .84}`} /><path d={`M${cx + u * 1.2} ${cy - u * .42} v${u * .84}`} />
      </g>);
    case 1:
      return (<g {...s}>
        <path d={`M${cx + u * 1.1} ${cy - u * 1.25} h${-u * 1.9} v${u * 2.5} h${u * 1.9}`} /><path d={`M${cx - u * .8} ${cy - u * 1.25} v${u * 2.5}`} />
        <path d={`M${cx + u * 1.1} ${cy - u * 1.25} v${u * .5}`} /><path d={`M${cx + u * 1.1} ${cy + u * 1.25} v${-u * .5}`} />
        <path d={`M${cx + u * .55} ${cy + u * 1.25} v${u * .75}`} /><path d={`M${cx + u * .05} ${cy + u * 2.0} h${u * 1.0}`} />
        <path d={`M${cx + u * .2} ${cy + u * .5} h${u * .7} v${u * .45} h${-u * .7} z`} />
      </g>);
    case 2: {
      let d = `M${cx - u * 2.0} ${cy + u * .55}`;
      for (let k = 0; k < 4; k++) { const sx = cx - u * 2.0 + k * u; d += ` L${sx + u * .2} ${cy - u * .55} L${sx + u * .6} ${cy - u * .55} L${sx + u * .8} ${cy + u * .55} L${sx + u} ${cy + u * .55}`; }
      return <path d={d} {...s} />;
    }
    case 3: {
      const a = u * 1.5, t = u * .34;
      return <path d={`M${cx - a} ${cy - a} h${a * 2} v${t} h${-(a - t / 2)} v${a * 2 - 2 * t} h${a - t / 2} v${t} h${-a * 2} v${-t} h${a - t / 2} v${-(a * 2 - 2 * t)} h${-(a - t / 2)} z`} {...s} fill="#0B0B0B" strokeWidth={1.1} />;
    }
    default: {
      const bl = (x1: number, y1: number, x2: number, y2: number) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0B0B0B" strokeWidth={u * .22} strokeLinecap="round" />;
      const hg = (hx: number, hy: number) => <circle cx={hx} cy={hy} r={u * .2} fill="#fff" stroke="#0B0B0B" strokeWidth={1.1} />;
      return (<g>
        {bl(cx - u * 1.7, cy - u * .78, cx + u * 1.5, cy - u * .78)}{bl(cx + u * 1.5, cy - u * .78, cx - u * 1.1, cy + u * .05)}{bl(cx - u * 1.1, cy + u * .05, cx + u * 1.7, cy + u * .88)}
        {hg(cx + u * 1.5, cy - u * .78)}{hg(cx - u * 1.1, cy + u * .05)}
        <path d={`M${cx - u * 1.7} ${cy - u * 1.25} a${u * 1.6} ${u * 1.6} 0 0 1 ${u * 1.5} ${u * .3}`} fill="none" stroke="#9C9B97" strokeWidth={.8} strokeDasharray="5 4" />
      </g>);
    }
  }
}

/** all five (only = undefined) or one tool, drawn 1 : 1 */
export function SourceDrawing({ only, ground = true, made = true, className }: { only?: number; ground?: boolean; made?: boolean; className?: string }) {
  const list = only === undefined ? [0, 1, 2, 3, 4] : [only];
  const W = only === undefined ? 1000 : 400, H = only === undefined ? 400 : 380;
  const slot = W / list.length;
  return (
    <svg className={className} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={only === undefined ? 'The five source objects, drawn 1 : 1' : `Source object: ${NAMES[only]}`} style={{ fontFamily: 'var(--text)' }}>
      {ground && <rect width={W} height={H} fill="#F4F3F1" />}
      {list.map((i, k) => {
        const cx = slot * (k + .5), cy = H * .4, u = Math.min(slot * .3, H * .22);
        return (
          <g key={i}>
            <line x1={cx} y1={18} x2={cx} y2={H - 74} stroke="#A9A8A4" strokeWidth={.6} strokeDasharray="18 4 2 4" />
            <Tool i={i} cx={cx} cy={cy} u={u} />
            <text x={cx} y={H - 48} fontSize={11.5} textAnchor="middle" fontFamily="var(--display)" fill="#0B0B0B">{NAMES[i]}</text>
            <text x={cx} y={H - 32} fontSize={10.5} textAnchor="middle" fill="#6B6A66">{DE[i]}</text>
            {made && <text x={cx} y={H - 13} fontSize={10} textAnchor="middle" fill="#0B0B0B">→ {CODE[i]} {MADE[i]}</text>}
          </g>
        );
      })}
    </svg>
  );
}
