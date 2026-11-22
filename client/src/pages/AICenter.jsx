import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import api from '../api';

export default function AICenter() {
  const [d, setD] = useState(null);
  useEffect(() => { api.get('/ai/insights').then((r) => setD(r.data)); }, []);
  if (!d) return <div className="muted">Analysing community activity...</div>;
  const max = Math.max(1, ...d.trendingCategories.map((c) => c.value));

  return (
    <>
      <div className="page-head"><h1>AI Center</h1><p>Trends and suggestions generated from live community activity.</p></div>
      <div className="grid g4" style={{ marginBottom: 18 }}>
        {[['Urgent open', d.urgentOpen], ['No helper yet', d.unanswered], ['Solved rate', `${d.solvedRate}%`], ['Total requests', d.total]].map(([l, v]) => (
          <div className="card stat" key={l}><div className="num">{v}</div><div className="label">{l}</div></div>
        ))}
      </div>
      <div className="grid g2">
        <div className="card stack">
          <div className="row" style={{ color: 'var(--brand-ink)', fontWeight: 500 }}><Sparkles size={16} /> Suggestions for you</div>
          {d.suggestions.map((s) => <p key={s}>{s}</p>)}
          <div className="small muted">Requests that match your skills</div>
          {d.matches.length ? d.matches.map((m) => <Link key={m._id} to={`/requests/${m._id}`} className="row between"><span>{m.title}</span><span className={`chip urg-${m.urgency}`}>{m.urgency}</span></Link>) : <p className="small muted">No matches right now. Add more skills in your profile.</p>}
        </div>
        <div className="card stack">
          <h3 style={{ fontSize: '1rem' }}>Trending categories (14 days)</h3>
          {d.trendingCategories.map((c, i) => (
            <div key={c.name}><div className="row between small"><span>{c.name}</span><b>{c.value}</b></div>
              <div className="bar"><motion.span initial={{ width: 0 }} animate={{ width: `${(c.value / max) * 100}%` }} transition={{ delay: i * 0.08, duration: 0.5 }} /></div></div>
          ))}
          {!d.trendingCategories.length && <p className="muted small">Not enough data yet.</p>}
          <div className="small muted" style={{ marginTop: 6 }}>Top tags</div>
          <div className="row">{d.topTags.map((t) => <span key={t.name} className="chip brand">{t.name} · {t.value}</span>)}</div>
        </div>
      </div>
    </>
  );
}
