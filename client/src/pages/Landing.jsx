import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Bell, MessageSquare, Trophy, Wand2, Check } from 'lucide-react';
import HeroScene from '../components/HeroScene';
import api from '../api';
import './landing.css';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  ['Someone gets stuck', 'A learner posts a request in plain words. No forms to figure out.'],
  ['AI reads it', 'Category, tags and urgency are detected as soon as the request is written.'],
  ['The right people are matched', 'Helpers whose skills fit get a live notification.'],
  ['Help happens in the open', 'Offer help on the request, then talk in real time.'],
  ['Solved, and it counts', 'The author picks who solved it. That helper earns points, trust and badges.'],
];
const TYPED = 'I am stuck: my useEffect fetch fires twice and my project is due tomorrow.';

const KW = { 'Web Development': ['react', 'html', 'css', 'javascript', 'node', 'api', 'mongodb'], 'Data & AI': ['python', 'pandas', 'ml', 'data', 'sql'], Design: ['figma', 'ui', 'ux', 'design', 'logo'], Career: ['resume', 'interview', 'cv', 'portfolio', 'job'], Academics: ['exam', 'assignment', 'math', 'homework'], 'DevOps & Cloud': ['docker', 'aws', 'deploy', 'git'] };
function demoAI(text) {
  const s = text.toLowerCase();
  let cat = 'Other', best = 0; const tags = [];
  for (const [c, words] of Object.entries(KW)) {
    const hit = words.filter((w) => new RegExp(`\\b${w}\\b`).test(s));
    tags.push(...hit);
    if (hit.length > best) { best = hit.length; cat = c; }
  }
  const urg = /urgent|asap|deadline|tomorrow|today|exam|due/.test(s) ? 'High' : /stuck|error|bug|confused|soon/.test(s) ? 'Medium' : 'Low';
  return { cat, urg, tags: [...new Set(tags)].slice(0, 5) };
}

const features = [
  [Wand2, 'AI-assisted requests', 'Auto category, smart tags, urgency detection and a clearer rewrite.'],
  [Bell, 'Skill-based matching', 'Helpers are notified when a request matches their profile.'],
  [MessageSquare, 'Live messaging', 'Talk to the person you are helping, in real time.'],
  [ShieldCheck, 'Trust score', 'Every solved request raises a helper\'s trust score.'],
  [Trophy, 'Leaderboard and badges', 'Top helpers are ranked and rewarded for showing up.'],
  [Sparkles, 'AI Center', 'Trends, unanswered requests and where you can help next.'],
];

function Card({ children, title = 'New request' }) {
  return <div className="mock"><div className="mock-h"><span /><span /><span /><b>{title}</b></div>{children}</div>;
}

export default function Landing() {
  const root = useRef(null);
  const statsRef = useRef(null);
  const [stats, setStats] = useState({ members: 1280, requests: 3420, solved: 2915, helpers: 460 });
  const [demo, setDemo] = useState('Urgent: my docker deploy to aws keeps failing and the deadline is tomorrow');
  const ai = demoAI(demo);

  useEffect(() => { api.get('/stats').then((r) => { if (r.data.members > 5) setStats(r.data); }).catch(() => {}); }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const heroTl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
        .from('.hero-line', { yPercent: 110, duration: 0.9, stagger: 0.12 })
        .from('.hero-sub, .hero-cta', { opacity: 0, y: 16, duration: 0.6, stagger: 0.1 }, '-=0.4')
        .from('.hero-scene', { opacity: 0, scale: 0.92, duration: 1 }, '-=0.9');
      const playHero = () => heroTl.play();
      if (window.__appReady) playHero(); else window.addEventListener('app:ready', playHero, { once: true });

      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const items = gsap.utils.toArray('.jstep');
        gsap.set('.panel', { autoAlpha: 0 });
        gsap.set('.p0', { autoAlpha: 1 });
        gsap.set('.jl', { strokeDasharray: 1, strokeDashoffset: 1 });
        const typed = root.current.querySelector('.typed');
        const o = { n: 0 }, t = { v: 50 }, p = { v: 0 };
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: '.journey', start: 'top top', end: '+=3000', scrub: 0.8, pin: true, anticipatePin: 1,
            onUpdate: (s) => { const i = Math.min(4, Math.floor(s.progress * 5)); items.forEach((el, k) => el.classList.toggle('on', k === i)); },
          },
        });
        const swap = (a, b, at) => { tl.to(a, { autoAlpha: 0, duration: 0.2 }, at).to(b, { autoAlpha: 1, duration: 0.2 }, at); };
        tl.fromTo('.jbar', { scaleY: 0 }, { scaleY: 1, duration: 5 }, 0);
        tl.to(o, { n: TYPED.length, duration: 0.8, onUpdate: () => { typed.textContent = TYPED.slice(0, Math.round(o.n)); } }, 0.1);
        swap('.p0', '.p1', 1);
        tl.from('.p1 .pop', { scale: 0, opacity: 0, duration: 0.25, stagger: 0.12, transformOrigin: 'left center' }, 1.25);
        swap('.p1', '.p2', 2);
        tl.from('.p2 .node', { scale: 0, transformOrigin: '50% 50%', duration: 0.3, stagger: 0.1 }, 2.15)
          .to('.jl', { strokeDashoffset: 0, duration: 0.5, stagger: 0.12 }, 2.3)
          .from('.notif', { y: -16, opacity: 0, duration: 0.3 }, 2.7);
        swap('.p2', '.p3', 3);
        tl.from('.bub', { y: 20, opacity: 0, duration: 0.3, stagger: 0.25 }, 3.2);
        swap('.p3', '.p4', 4);
        tl.fromTo('.ring-fg', { strokeDashoffset: 50 }, { strokeDashoffset: 8, duration: 0.6 }, 4.15)
          .to(t, { v: 92, duration: 0.6, onUpdate: () => { root.current.querySelector('.trust-num').textContent = Math.round(t.v); } }, 4.15)
          .to(p, { v: 15, duration: 0.5, onUpdate: () => { root.current.querySelector('.pts-num').textContent = `+${Math.round(p.v)}`; } }, 4.2)
          .from('.p4 .pop', { scale: 0, opacity: 0, duration: 0.25, stagger: 0.12 }, 4.4)
          .to({}, { duration: 0.1 }, 4.9);
      });
      mm.add('(prefers-reduced-motion: reduce)', () => { root.current.classList.add('static'); root.current.querySelector('.typed').textContent = TYPED; });

      gsap.utils.toArray('.reveal').forEach((el) =>
        gsap.from(el, { opacity: 0, y: 24, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));
    }, root);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.count').forEach((el) => {
        const o = { v: 0 };
        gsap.to(o, { v: Number(el.dataset.end), duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 95%', once: true }, onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString(); } });
      });
    }, statsRef);
    return () => ctx.revert();
  }, [stats]);

  return (
    <div ref={root}>
      <header className="top">
        <div className="logo" style={{ padding: 0 }}><i>H</i> Helplytics AI</div>
        <div className="row"><Link to="/auth" className="btn">Log in</Link><Link to="/auth?mode=signup" className="btn primary">Get started</Link></div>
      </header>

      <section className="hero">
        <div>
          <h1>
            <span className="line"><span className="hero-line">Get unstuck faster.</span></span>
            <span className="line"><span className="hero-line">Help someone else do the same.</span></span>
          </h1>
          <p className="hero-sub">Helplytics AI connects people who need a hand with people who have the skills. Scroll down to watch one request travel from stuck to solved.</p>
          <div className="row hero-cta">
            <Link to="/auth?mode=signup" className="btn primary lg">Post your first request</Link>
            <Link to="/auth?mode=signup" className="btn lg">Become a helper</Link>
          </div>
        </div>
        <HeroScene />
      </section>

      <section className="stats-band" ref={statsRef}>
        <div className="grid">
          {[['Members', stats.members], ['Requests posted', stats.requests], ['Solved', stats.solved], ['Active helpers', stats.helpers]].map(([l, v]) => (
            <div key={l}><div className="num count" data-end={v}>0</div><div className="label">{l}</div></div>
          ))}
        </div>
      </section>

      <section className="journey" aria-label="How Helplytics works">
        <div className="jleft">
          <h2>One request, from stuck to solved</h2>
          <div className="jsteps">
            <div className="jtrack"><div className="jbar" /></div>
            {STEPS.map(([t, d], i) => (
              <div key={t} className={`jstep ${i === 0 ? 'on' : ''}`}><h3>{t}</h3><p>{d}</p></div>
            ))}
          </div>
        </div>
        <div className="stage" aria-hidden="true">
          <div className="panel p0"><Card><div className="mock-t">React useEffect runs twice</div><p className="typed-wrap"><span className="typed" /><i className="caret" /></p></Card></div>
          <div className="panel p1"><Card title="AI analysis"><div className="mock-t">React useEffect runs twice</div><p className="muted small">{TYPED}</p>
            <div className="row" style={{ marginTop: 12 }}><span className="chip brand pop">Web Development</span><span className="chip urg-High pop">High urgency</span><span className="chip mint pop">react</span><span className="chip mint pop">javascript</span></div></Card></div>
          <div className="panel p2">
            <svg viewBox="0 0 400 300" role="presentation">
              {[[60, 70], [340, 70], [200, 262]].map(([x, y]) => <line key={x} className="jl" x1="200" y1="150" x2={x} y2={y} pathLength="1" />)}
              <g className="node"><circle cx="200" cy="150" r="36" fill="var(--brand)" /><text x="200" y="155" textAnchor="middle" className="nt">You</text></g>
              {[[60, 70, 'AK'], [340, 70, 'BA'], [200, 262, 'HR']].map(([x, y, n]) => <g className="node" key={n}><circle cx={x} cy={y} r="27" fill="var(--mint)" /><text x={x} y={y + 5} textAnchor="middle" className="nt">{n}</text></g>)}
            </svg>
            <div className="notif"><Bell size={15} /> New request matches your skills</div>
          </div>
          <div className="panel p3"><Card title="Messages">
            <div className="bub in">Hi! Are you using StrictMode? That runs effects twice in dev.</div>
            <div className="bub out">Yes I am. Is that the bug?</div>
            <div className="bub in">Not a bug. Add a cleanup function and it is fine.</div></Card></div>
          <div className="panel p4"><Card title="Marked as solved">
            <div className="row" style={{ gap: 24 }}>
              <div className="ring"><svg viewBox="0 0 100 100" width="104" height="104"><circle cx="50" cy="50" r="40" fill="none" stroke="#EEF0F6" strokeWidth="9" /><circle className="ring-fg" cx="50" cy="50" r="40" fill="none" stroke="var(--brand)" strokeWidth="9" strokeLinecap="round" pathLength="100" strokeDasharray="100" strokeDashoffset="50" transform="rotate(-90 50 50)" /></svg><b className="trust-num">50</b></div>
              <div className="stack" style={{ gap: 8 }}><div className="small muted">Helper trust score</div><span className="chip mint pop"><Check size={12} /> Solved</span><span className="chip brand pop"><span className="pts-num">+0</span>&nbsp;points</span><span className="chip amber pop">Badge: First Helper</span></div>
            </div></Card></div>
        </div>
      </section>

      <section className="section">
        <h2 className="reveal">Try the AI yourself</h2>
        <div className="grid g2 reveal" style={{ alignItems: 'start' }}>
          <label className="field">Describe a problem
            <textarea className="textarea" value={demo} onChange={(e) => setDemo(e.target.value)} />
          </label>
          <div className="card stack">
            <div className="small muted">What Helplytics detects</div>
            <div className="row"><AnimatePresence mode="popLayout">
              <motion.span key={ai.cat} className="chip brand" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}>{ai.cat}</motion.span>
              <motion.span key={ai.urg} className={`chip urg-${ai.urg}`} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}>{ai.urg} urgency</motion.span>
            </AnimatePresence></div>
            <div className="row"><AnimatePresence mode="popLayout">
              {ai.tags.map((t) => <motion.span layout key={t} className="chip mint" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}>{t}</motion.span>)}
            </AnimatePresence>{!ai.tags.length && <span className="small muted">No tags yet. Mention a tool like react or figma.</span>}</div>
            <p className="small muted">Inside the app this runs on the server and also suggests a rewrite and a summary.</p>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <h2 className="reveal">Everything the community needs, in one place</h2>
        <div className="grid g3">
          {features.map(([Icon, t, d]) => (
            <div className="card reveal" key={t}><Icon size={22} color="var(--brand)" /><h3 style={{ margin: '12px 0 6px', fontSize: '1.05rem' }}>{t}</h3><p className="muted small">{d}</p></div>
          ))}
        </div>
      </section>

      <section className="cta reveal">
        <h2>Someone out there can solve your problem today.</h2>
        <Link to="/auth?mode=signup" className="btn lg" style={{ color: 'var(--brand-ink)' }}>Join Helplytics</Link>
      </section>
    </div>
  );
}