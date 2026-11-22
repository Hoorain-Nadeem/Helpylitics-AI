import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, PlusCircle, Compass, MessageSquare } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import RequestCard from '../components/RequestCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [recent, setRecent] = useState([]);
  const [mine, setMine] = useState([]);
  const [helping, setHelping] = useState([]);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    api.get('/requests', { params: { limit: 5 } }).then((r) => setRecent(r.data));
    api.get('/requests', { params: { mine: 1 } }).then((r) => setMine(r.data));
    api.get('/requests', { params: { helping: 1 } }).then((r) => setHelping(r.data));
    api.get('/ai/insights').then((r) => setInsights(r.data));
  }, []);

  const stats = [
    ['My requests', mine.length], ['Helping on', helping.length], ['Solved for others', user.helpedCount], ['Trust score', user.trustScore],
  ];

  return (
    <>
      <div className="page-head"><h1>Hi {user.name.split(' ')[0]}, here is what is happening</h1><p>Your activity and the requests that match your skills.</p></div>
      <div className="grid g4" style={{ marginBottom: 18 }}>
        {stats.map(([l, v], i) => (
          <motion.div key={l} className="card stat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <div className="num">{v}</div><div className="label">{l}</div>
          </motion.div>
        ))}
      </div>
      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="stack">
          <div className="row between"><h3>Recent requests</h3><Link to="/explore" className="small" style={{ color: 'var(--brand-ink)' }}>See all</Link></div>
          {recent.map((r, i) => <RequestCard key={r._id} r={r} i={i} />)}
          {!recent.length && <div className="card muted">No requests yet. Post the first one.</div>}
        </div>
        <div className="stack" style={{ alignContent: 'start' }}>
          <div className="card stack">
            <div className="row" style={{ color: 'var(--brand-ink)', fontWeight: 500 }}><Sparkles size={16} /> AI insights</div>
            {insights?.suggestions.map((s) => <p key={s} className="small">{s}</p>)}
            {insights?.matches?.length > 0 && (
              <div><div className="small muted" style={{ marginBottom: 6 }}>Matches for your skills</div>
                {insights.matches.map((m) => <Link key={m._id} to={`/requests/${m._id}`} className="small" style={{ display: 'block', padding: '4px 0', color: 'var(--brand-ink)' }}>{m.title}</Link>)}
              </div>
            )}
          </div>
          <div className="card stack">
            <h3 style={{ fontSize: '1rem' }}>Quick actions</h3>
            <Link className="btn primary" to="/create"><PlusCircle size={16} /> Ask for help</Link>
            <Link className="btn" to="/explore"><Compass size={16} /> Find requests to solve</Link>
            <Link className="btn" to="/messages"><MessageSquare size={16} /> Open messages</Link>
          </div>
        </div>
      </div>
    </>
  );
}
