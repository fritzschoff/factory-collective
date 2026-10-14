import type { CSSProperties, ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { signGeometry } from '@/lib/sign/geometry';

export interface SignProps {
  word?: string;
  /** window: ink = black bar, open = see-through, red = red bar */
  win?: 'ink' | 'open' | 'red';
  className?: string;
  style?: CSSProperties;
  /** show the word inside the brackets instead of the empty window */
  showWord?: boolean;
  children?: ReactNode;
}

/** The long-form sign C ONCEPT. ( WORD ) C OLLECTIVE . — only the red marks and the window are visible. */
export function Sign({ word = 'ATELIER', win = 'ink', className, style, showWord, children }: SignProps) {
  const g = signGeometry(word);
  const st = { '--tot': g.tot.toFixed(4), '--wl': g.winLeft.toFixed(5), ...style } as CSSProperties;
  return (
    <span className={cx('sign', `sign--${win}`, className)} style={st} aria-hidden="true">
      <span className="sg-m">C</span><span className="sg-h">ONCEPT</span><span className="sg-m">. </span>
      <span className="sg-g">
        <span className="sg-win" />
        <span className="sg-m sg-br">(</span><span className={cx('sg-word', !showWord && 'sg-h')}>{word.toUpperCase()}</span><span className="sg-m sg-br">)</span>
      </span>
      <span className="sg-m"> C</span><span className="sg-h">OLLECTIVE</span><span className="sg-m"> .</span>
      {children}
    </span>
  );
}

/** The sign as a block in the page: bar, ghost, with a caption. */
export function MarkBar({ word = 'ATELIER', w = '82%', win = 'ink', ghost, caption, className, style }: { word?: string; w?: string; win?: 'ink' | 'red' | 'open'; ghost?: boolean; caption?: string; className?: string; style?: CSSProperties }) {
  return (
    <div className={cx('markbar', ghost && 'markbar--ghost', className)} style={style}>
      <div className="markbar__in" style={{ width: w }}><Sign word={word} win={win} /></div>
      {caption && <p className="micro markbar__cap">{caption}</p>}
    </div>
  );
}

/** The sign, large, running off the right edge of the page. */
export function RunOff({ word = 'ATELIER', win = 'ink' }: { word?: string; win?: 'ink' | 'red' }) {
  return <div className="runoff" aria-hidden="true"><div className="runoff__in"><Sign word={word} win={win} /></div></div>;
}

/** ( ) as a decorative inline. */
export const Br = ({ children = '' }: { children?: ReactNode }) => <span className="br">( {children}{children ? ' ' : ''})</span>;
