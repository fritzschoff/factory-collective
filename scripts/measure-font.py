#!/usr/bin/env python3
"""
One-off tool. Measures the display font (Archivo Black) so the sign and the bracket
window can be built in pure CSS, in exact proportion:
  - advance widths of the pieces of the long-form sign (em)
  - the inner contour of "(" and ")" (the shape of the window)
Writes src/lib/sign/font-metrics.json. Re-run only if the display font is replaced.
Needs: python3 + playwright (pip install playwright).
"""
import json, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT = 'file://' + os.path.join(ROOT, 'public/fonts/archivo-black.woff')
HTML = f"""<!doctype html><meta charset=utf-8><style>
@font-face{{font-family:D;src:url('{FONT}')}}
body{{margin:0;font-family:D}}
.s{{font-family:D;font-size:200px;line-height:1;white-space:pre;display:inline-block}}
</style><body></body>"""
JS = r"""
async () => {
  await document.fonts.load('200px D');
  const adv = {};
  for (const t of ['C','ONCEPT','. ','(','ATELIER',')',' C','OLLECTIVE',' .']) {
    const s = document.createElement('span'); s.className='s'; s.textContent=t; document.body.appendChild(s);
    adv[t] = s.getBoundingClientRect().width/200; s.remove();
  }
  // contour of the brackets, supersampled
  const K = 2, FS = 400, S = FS*2*K, c = document.createElement('canvas'); c.width=S; c.height=S;
  const g = c.getContext('2d', {willReadFrequently:true});
  const base = Math.round(S*.72), ox = Math.round(FS*.4*K);
  const out = {};
  for (const ch of ['(',')']) {
    g.clearRect(0,0,S,S); g.fillStyle='#000'; g.font = `${FS*K}px D`; g.textBaseline='alphabetic'; g.fillText(ch, ox, base);
    const d = g.getImageData(0,0,S,S).data; const rows=[]; let top=null,bot=null,lo0=1e9,hi0=-1;
    for (let r=0;r<S;r++){ let lo=-1,hi=-1; for(let q=0;q<S;q++){ if(d[(r*S+q)*4+3]>110){ if(lo<0)lo=q; hi=q+1; } }
      if(lo>=0){ rows.push({r:r-base, lo:(lo-ox)/K, hi:(hi-ox)/K}); if(top===null)top=r-base; bot=r-base; lo0=Math.min(lo0,lo); hi0=Math.max(hi0,hi);} }
    out[ch] = {rows, top:top/K, bot:(bot+1)/K, lo:(lo0-ox)/K, hi:(hi0-ox)/K, K};
  }
  // where does the baseline sit inside a line-height:1 box?  measure with an inline-block probe
  const probe = document.createElement('span'); probe.className='s'; probe.style.fontSize=FS+'px'; probe.innerHTML='x<span style="display:inline-block;width:1px;height:0;vertical-align:baseline"></span>';
  document.body.appendChild(probe); const pr = probe.getBoundingClientRect(); const ir = probe.querySelector('span').getBoundingClientRect();
  const baselineFromTop = (ir.bottom - pr.top)/FS; probe.remove();
  return {adv, out, baselineFromTop, FS};
}
"""
with sync_playwright() as pw:
    tmp = os.path.join(ROOT, 'scripts', '.measure.html'); open(tmp,'w').write(HTML)
    b = pw.chromium.launch(); pg = b.new_page(); pg.goto('file://' + tmp); pg.wait_for_timeout(300)
    res = pg.evaluate(JS); b.close(); os.remove(tmp)
FS = res['FS']; out = res['out']
def prof(ch):
    o = out[ch]; rows = o['rows']
    return o, {r['r']: r for r in rows}
oL, mL = prof('('); oR, mR = prof(')')
dys = sorted(set(mL) & set(mR)); mid = dys[len(dys)//2]; KK = oL['K']
top, bot = oL['top'], oL['bot']; H = bot - top            # ink height in px at FS
inL = mL[mid]['hi']; inR = mR[mid]['lo']                  # inner edge at mid, from glyph origin (px)
N = 28; kl = []; kr = []; ys = []
for i in range(N+1):
    t = i/N; dy = round((top + t*(H-1/KK))*KK)
    dy = min(max(dy, dys[0]), dys[-1])
    while dy not in mL or dy not in mR: dy += 1
    ys.append(round(t,4)); kl.append(round((mL[dy]['hi']-inL)/H,5)); kr.append(round((mR[dy]['lo']-inR)/H,5))
m = {
  'advEm': res['adv'],
  'baselineFromTopEm': round(res['baselineFromTop'],5),
  'bracket': {
    'inkHeightEm': round(H/FS,5),
    'inkTopFromBaselineEm': round(top/FS,5),            # negative: ink starts above the baseline
    'left':  {'innerAtMidEm': round(inL/FS,5), 'inkLeftEm': round(oL['lo']/FS,5), 'inkRightEm': round(oL['hi']/FS,5)},
    'right': {'innerAtMidEm': round(inR/FS,5), 'inkLeftEm': round(oR['lo']/FS,5), 'inkRightEm': round(oR['hi']/FS,5)},
    'rows': ys, 'kLeft': kl, 'kRight': kr                # offsets of the inner contour, in units of the ink height
  }
}
os.makedirs(os.path.join(ROOT,'src/lib/sign'), exist_ok=True)
json.dump(m, open(os.path.join(ROOT,'src/lib/sign/font-metrics.json'),'w'), indent=1)
print(json.dumps({k:m[k] for k in ('advEm','baselineFromTopEm')}, indent=1)); print({k:v for k,v in m['bracket'].items() if k not in('rows','kLeft','kRight')}); print('kLeft',m['bracket']['kLeft'][:6],'...'); print('kRight',m['bracket']['kRight'][:6],'...')
