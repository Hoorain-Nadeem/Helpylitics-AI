import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './loader.css';

const KEY = 'hl-loaded';
// If the loader already ran in this session, the site is ready immediately.
if (typeof window !== 'undefined' && sessionStorage.getItem(KEY)) window.__appReady = true;

const NODES = [[30, 100], [90, 40], [160, 85], [230, 30], [290, 95], [335, 50]];
const EDGES = [[0, 1], [1, 2], [2, 3], [2, 4], [3, 5], [4, 5]];
const COLORS = ['#7C74FF', '#2FD4A6', '#FFB05C'];

export default function Loader() {
  const [show, setShow] = useState(() => !window.__appReady);
  const root = useRef(null);

  useEffect(() => {
    if (!show) return;
    const finish = () => {
      sessionStorage.setItem(KEY, '1');
      window.__appReady = true;
      window.dispatchEvent(new Event('app:ready'));
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); setShow(false); return; }

    let dead = false;
    document.body.style.overflow = 'hidden';
    const ctx = gsap.context(() => {
      const num = root.current.querySelector('.ld-num');
      const bar = root.current.querySelector('.ld-bar');
      const p = { v: 0 };
      const render = () => { num.textContent = Math.round(p.v); bar.style.transform = `scaleX(${p.v / 100})`; };

      gsap.set('.ld-line', { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.timeline()
        .from('.ld-mark', { scale: 0.6, opacity: 0, duration: 0.5, ease: 'back.out(2)' })
        .from('.ld-word span', { yPercent: 110, duration: 0.5, stagger: 0.03, ease: 'power3.out' }, '-=0.2')
        .from('.ld-tag', { opacity: 0, y: 8, duration: 0.5 }, '-=0.2')
        .from('.ld-node', { scale: 0, transformOrigin: '50% 50%', duration: 0.3, stagger: 0.08 }, 0.3)
        .to('.ld-line', { strokeDashoffset: 0, duration: 0.5, stagger: 0.1 }, 0.6);

      const prog = gsap.to(p, { v: 85, duration: 1.8, ease: 'power1.out', onUpdate: render });

      const exit = () => {
        const t = gsap.timeline({ onComplete: () => { document.body.style.overflow = ''; setShow(false); ScrollTrigger.refresh(); } });
        t.to('.ld-content', { opacity: 0, y: -20, duration: 0.35 })
          .to(root.current, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' })
          .add(finish, '-=0.55');
      };

      const loaded = Promise.all([
        document.fonts?.ready,
        new Promise((r) => setTimeout(r, 1900)),
        new Promise((r) => (document.readyState === 'complete' ? r() : window.addEventListener('load', r, { once: true }))),
      ]);
      Promise.race([loaded, new Promise((r) => setTimeout(r, 4000))]).then(() => {
        if (dead) return;
        prog.kill();
        gsap.to(p, { v: 100, duration: 0.4, ease: 'power2.out', onUpdate: render, onComplete: exit });
      });
    }, root);

    return () => { dead = true; document.body.style.overflow = ''; ctx.revert(); };
  }, [show]);

  if (!show) return null;
  return (
    <div className="ld" ref={root} role="status" aria-label="Loading Helplytics AI">
      <div className="ld-content">
        <svg className="ld-net" viewBox="0 0 360 150" aria-hidden="true">
          {EDGES.map(([a, b]) => <line key={`${a}${b}`} className="ld-line" pathLength="1" x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} />)}
          {NODES.map(([x, y], i) => <circle key={i} className="ld-node" cx={x} cy={y} r="7" fill={COLORS[i % 3]} />)}
        </svg>
        <div className="ld-brand">
          <i className="ld-mark">H</i>
          <div className="ld-word" aria-hidden="true">{'Helplytics AI'.split('').map((c, i) => <span key={i}>{c === ' ' ? '\u00A0' : c}</span>)}</div>
        </div>
        <p className="ld-tag">People who need help, meet people who can.</p>
        <div className="ld-prog"><div className="ld-bar" /></div>
        <div className="ld-count"><span className="ld-num">0</span>%</div>
      </div>
    </div>
  );
}