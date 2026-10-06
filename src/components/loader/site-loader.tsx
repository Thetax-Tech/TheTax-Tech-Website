import { LOGO_PATHS } from "@/components/brand/logo-mark";

/*
 * Branded intro loader — no React state, no client bundle.
 *
 *  1. HEAD_SCRIPT (in <head>) runs before first paint. On the first visit of a browser session it
 *     adds `tx-loading` to <html>; otherwise nothing happens (later navigations never show it).
 *  2. The overlay is `display:none` unless `html.tx-loading` — so with JS disabled or broken the
 *     site renders normally.
 *  3. BODY_SCRIPT tracks real readiness: web fonts loaded + the 3D hero announcing `tx:scene-ready`
 *     (or reporting it isn't needed). Progress eases toward 90% meanwhile, then completes.
 *     Hard cap 0.6s + 0.35s wipe (< 1s total); minimum 0.3s so the logo reads. Skipped on phones.
 *  4. On completion `tx-loaded` triggers the wipe; hero entrance animations, paused underneath,
 *     start at the same moment for a seamless reveal. No layout shift: the page is fully laid out
 *     beneath the overlay the whole time.
 */

export const LOADER_HEAD_SCRIPT = `(function(){try{var d=document.documentElement;if(location.pathname.indexOf('/admin')===0||sessionStorage.getItem('tx-intro-seen')||matchMedia('(prefers-reduced-motion: reduce)').matches||matchMedia('(max-width: 767px)').matches)return;d.classList.add('tx-loading');document.addEventListener('DOMContentLoaded',function(){if(!document.querySelector('.tx-loader'))d.classList.remove('tx-loading');else sessionStorage.setItem('tx-intro-seen','1')});window.__txLoadStart=performance.now();setTimeout(function(){d.classList.remove('tx-loading')},1200)}catch(e){}})()`;

const BODY_SCRIPT = `(function(){var d=document.documentElement;if(!d.classList.contains('tx-loading'))return;
var bar=document.getElementById('tx-loader-bar'),pct=document.getElementById('tx-loader-pct'),p=0,done=false,t0=window.__txLoadStart||performance.now();
var fonts=false,scene=false,dom=false;
function set(v){p=v;if(bar)bar.style.transform='scaleX('+(v/100)+')';if(pct)pct.textContent=Math.round(v)+'%'}
function finish(){if(done)return;done=true;set(100);var wait=Math.max(0,300-(performance.now()-t0));setTimeout(function(){d.classList.add('tx-loaded');setTimeout(function(){d.classList.remove('tx-loading','tx-loaded')},360)},wait)}
function check(){if(fonts&&dom&&(scene||!document.querySelector('[data-scene]')))finish()}
document.addEventListener('DOMContentLoaded',function(){dom=true;check()});
(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(function(){fonts=true;check()});
window.addEventListener('tx:scene-ready',function(){scene=true;check()});window.addEventListener('tx:scene-deferred',function(){scene=true;check()});
var iv=setInterval(function(){if(done){clearInterval(iv);return}set(p+(90-p)*0.25)},40);
setTimeout(finish,600)})()`;

export function SiteLoader() {
  return (
    <>
      <div className="tx-loader" aria-hidden="true">
        <div className="tx-loader-inner">
          <svg viewBox="-40 -40 1510 1397" className="tx-loader-logo">
            <defs>
              <filter id="tx-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="22" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g filter="url(#tx-glow)">
              <path className="tx-draw tx-d1" pathLength={1} d={LOGO_PATHS.ring} />
              <path className="tx-draw tx-d2" pathLength={1} d={LOGO_PATHS.wingTop} />
              <path className="tx-draw tx-d3 tx-mid" pathLength={1} d={LOGO_PATHS.wingMid} />
            </g>
          </svg>
          <div className="tx-loader-meta">
            <span className="tx-loader-word">THETA X TECH</span>
            <span id="tx-loader-pct" className="tx-loader-pct" suppressHydrationWarning>0%</span>
          </div>
          <div className="tx-loader-track">
            <span id="tx-loader-bar" className="tx-loader-bar" suppressHydrationWarning />
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: BODY_SCRIPT }} />
    </>
  );
}
