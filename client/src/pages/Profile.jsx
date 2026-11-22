import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, Award } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import TrustRing from '../components/TrustRing';
import RequestCard from '../components/RequestCard';

export default function Profile() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const uid = id || me._id;
  const own = uid === me._id;
  const [u, setU] = useState(null);
  const [asked, setAsked] = useState([]);
  const [solved, setSolved] = useState([]);

  useEffect(() => {
    api.get(`/users/${uid}`).then((r) => setU(r.data));
    api.get('/requests', { params: { author: uid } }).then((r) => setAsked(r.data));
    api.get('/requests', { params: { solvedBy: uid } }).then((r) => setSolved(r.data));
  }, [uid]);

  if (!u) return <div className="muted">Loading...</div>;
  return (
    <>
      <div className="card row between" style={{ marginBottom: 18, alignItems: 'flex-start' }}>
        <div className="row" style={{ alignItems: 'flex-start', gap: 18 }}>
          <Avatar name={u.name} size={72} />
          <div className="stack" style={{ gap: 8 }}>
            <h1 style={{ fontSize: '1.6rem' }}>{u.name}</h1>
            <div className="row small muted"><MapPin size={14} />{u.location || 'Remote'} · {u.role === 'both' ? 'Asks and helps' : u.role === 'help' ? 'Helper' : 'Seeker'}</div>
            <div className="row">{u.badges.length ? u.badges.map((b) => <span key={b} className="chip brand"><Award size={12} />{b}</span>) : <span className="small muted">No badges yet</span>}</div>
            {own && <Link to="/onboarding" className="btn sm" style={{ width: 'fit-content' }}>Edit profile</Link>}
          </div>
        </div>
        <div className="row" style={{ gap: 22 }}>
          <div className="stat"><div className="num">{u.points}</div><div className="label">points</div></div>
          <div className="stat"><div className="num">{u.helpedCount}</div><div className="label">solved</div></div>
          <div style={{ textAlign: 'center' }}><TrustRing value={u.trustScore} /><div className="small muted">Trust score</div></div>
        </div>
      </div>
      <div className="grid g2" style={{ marginBottom: 18 }}>
        <div className="card stack"><h3 style={{ fontSize: '1rem' }}>Skills</h3><div className="row">{u.skills.length ? u.skills.map((s) => <span key={s} className="chip mint">{s}</span>) : <span className="muted small">None added</span>}</div></div>
        <div className="card stack"><h3 style={{ fontSize: '1rem' }}>Interests</h3><div className="row">{u.interests.length ? u.interests.map((s) => <span key={s} className="chip">{s}</span>) : <span className="muted small">None added</span>}</div></div>
      </div>
      <div className="grid g2" style={{ alignItems: 'start' }}>
        <div className="stack"><h3>Contributions ({solved.length})</h3>{solved.map((r, i) => <RequestCard key={r._id} r={r} i={i} />)}{!solved.length && <div className="card muted small">No solved requests yet.</div>}</div>
        <div className="stack"><h3>Requests posted ({asked.length})</h3>{asked.map((r, i) => <RequestCard key={r._id} r={r} i={i} />)}{!asked.length && <div className="card muted small">No requests posted.</div>}</div>
      </div>
    </>
  );
}
