import { slotSrc } from '@/lib/images';

/** Wall elevation 1 : 10 with a 1.75 m figure; all measures in cm. */
export function Elevation({ slots, cw, ch, centre = 145, n = 1, gap = 0, label, dimW }: { slots: string[]; cw: number; ch: number; centre?: number; n?: number; gap?: number; label: string; dimW?: string }) {
  const W = 440, H = 250, floor = 215, k = 1.26; // 1 cm = k units of the drawing
  const pw = cw * k, phh = ch * k, tot = n * pw + (n - 1) * gap * k, cx0 = 180 - tot / 2, cy = floor - centre * k;
  const fx = cx0 + tot + 74;
  return (
    <figure className="elev">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        <line x1="14" y1={floor} x2={W - 14} y2={floor} className="e-floor" />
        {Array.from({ length: n }).map((_, i) => {
          const x = cx0 + i * (pw + gap * k);
          const slot = slots[Math.min(i, slots.length - 1)];
          const src = slotSrc(slot);
          return (
            <g key={i}>
              <rect x={x} y={cy - phh / 2} width={pw} height={phh} className="e-work" />
              {src
                ? <image href={src} x={x + .5} y={cy - phh / 2 + .5} width={pw - 1} height={phh - 1} preserveAspectRatio="xMidYMid slice" />
                : <text x={x + pw / 2} y={cy} className="e-ph" textAnchor="middle">{slot}</text>}
            </g>
          );
        })}
        <g className="e-fig">
          <circle cx={fx} cy={floor - 164 * k} r={11 * k * .9} /><line x1={fx} y1={floor - 153 * k} x2={fx} y2={floor - 92 * k} />
          <line x1={fx} y1={floor - 146 * k} x2={fx - 20} y2={floor - 100 * k} /><line x1={fx} y1={floor - 146 * k} x2={fx + 20} y2={floor - 100 * k} />
          <line x1={fx} y1={floor - 92 * k} x2={fx - 14} y2={floor} /><line x1={fx} y1={floor - 92 * k} x2={fx + 14} y2={floor} />
        </g>
        <g className="e-dim">
          <line x1={cx0} y1={cy + phh / 2 + 14} x2={cx0 + tot} y2={cy + phh / 2 + 14} /><text x={cx0 + tot / 2} y={cy + phh / 2 + 12} textAnchor="middle">{dimW ?? `${cw} cm`}</text>
          <line x1={cx0 - 16} y1={cy - phh / 2} x2={cx0 - 16} y2={cy + phh / 2} /><text x={cx0 - 20} y={cy} textAnchor="middle" transform={`rotate(-90 ${cx0 - 20} ${cy})`}>{ch} cm</text>
          <line x1={W - 36} y1={floor} x2={W - 36} y2={cy} /><text x={W - 40} y={(floor + cy) / 2} textAnchor="middle" transform={`rotate(-90 ${W - 40} ${(floor + cy) / 2})`}>+ {(centre / 100).toFixed(2)} centre</text>
          <text x={fx} y={floor + 14} textAnchor="middle">1.75 m</text>
        </g>
      </svg>
      <figcaption className="micro">{label}</figcaption>
    </figure>
  );
}
