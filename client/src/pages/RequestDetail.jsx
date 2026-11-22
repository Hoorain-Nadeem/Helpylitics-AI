import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, HandHeart, MessageSquare, Sparkles, Trash2 } from 'lucide-react';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import { timeAgo } from '../constants';

export default function RequestDetail() {
  const { id } = useParams();
  const { user, showToast } = useAuth();
  const nav = useNavigate();
  const [r, setR] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { api.get(`/requests/${id}`).then((x) => setR(x.data)).catch((e) => setError(errMsg(e))); }, [id]);

  const act = async (fn) => {
    try { setR((await fn()).data); } catch (e) { showToast(errMsg(e)); }
  };

  if (error) return <div className="card error">{error}</div>;
  if (!r) return <div className="muted">Loading...</div>;

  const isAuthor = r.author._id === user._id;
  const iHelp = r.helpers.some((h) => h.user._id === user._id);
  const solved = r.status === 'solved';
  const draft = `Hi ${r.author.name.split(' ')[0]}, I saw your request "${r.title}". I have experience with ${r.tags.slice(0, 3).join(', ') || r.category}. Want to hop on a quick chat so I can help?`;

  return (
    <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start' }}>
      <div className="stack">
        <div className="card stack">
          <div className="row">
            <span className={`chip urg-${r.urgency}`}>{r.urgency} urgency</span>
            <span className={`chip ${solved ? 'mint' : 'brand'}`}>{r.status.replace('_', ' ')}</span>
            <span className="chip">{r.category}</span>
            <span className="small muted">{timeAgo(r.createdAt)} · {r.location}</span>
          </div>
          <h1 style={{ fontSize: '1.7rem' }}>{r.title}</h1>
          <p style={{ whiteSpace: 'pre-wrap' }}>{r.description}</p>
          <div className="row">{r.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>
          <div className="row">
            {!isAuthor && !solved && !iHelp && <button className="btn primary" onClick={() => act(() => api.post(`/requests/${id}/help`))}><HandHeart size={16} /> I can help</button>}
            {iHelp && !solved && <span className="chip mint">You offered to help</span>}
            {isAuthor && !solved && <button className="btn success" onClick={() => act(() => api.post(`/requests/${id}/solve`, {}))}><CheckCircle2 size={16} /> Mark as solved</button>}
            {(isAuthor || user.isAdmin) && <button className="btn danger" onClick={async () => { if (confirm('Delete this request?')) { await api.delete(`/requests/${id}`); nav('/explore'); } }}><Trash2 size={16} /> Delete</button>}
          </div>
          {solved && r.solvedBy && <p className="small muted">Solved with help from <Link to={`/profile/${r.solvedBy._id}`} style={{ color: 'var(--brand-ink)' }}>{r.solvedBy.name}</Link>.</p>}
        </div>

        <div className="card stack">
          <div className="row" style={{ color: 'var(--brand-ink)', fontWeight: 500 }}><Sparkles size={16} /> AI summary</div>
          <p>{r.summary}</p>
          {!isAuthor && !solved && (
            <div><div className="small muted" style={{ marginBottom: 6 }}>Suggested first message</div>
              <p className="small" style={{ background: 'var(--bg)', padding: 10, borderRadius: 10 }}>{draft}</p>
              <button className="btn sm" style={{ marginTop: 8 }} onClick={() => nav(`/messages/${r.author._id}`, { state: { draft } })}><MessageSquare size={14} /> Send as message</button>
            </div>
          )}
        </div>
      </div>

      <div className="stack">
        <div className="card stack">
          <h3 style={{ fontSize: '1rem' }}>Posted by</h3>
          <Link to={`/profile/${r.author._id}`} className="row"><Avatar name={r.author.name} /><div><b>{r.author.name}</b><div className="small muted">Trust {r.author.trustScore}</div></div></Link>
          {!isAuthor && <Link className="btn sm" to={`/messages/${r.author._id}`}><MessageSquare size={14} /> Message</Link>}
        </div>
        <div className="card flat">
          <div style={{ padding: '16px 18px 4px' }}><h3 style={{ fontSize: '1rem' }}>Helpers ({r.helpers.length})</h3></div>
          {!r.helpers.length && <p className="muted small" style={{ padding: '8px 18px 18px' }}>No helpers yet.</p>}
          {r.helpers.map((h) => (
            <div className="li" key={h.user._id}>
              <Avatar name={h.user.name} size={34} />
              <div className="grow"><Link to={`/profile/${h.user._id}`}><b>{h.user.name}</b></Link><div className="small muted">Trust {h.user.trustScore}</div></div>
              {isAuthor && <Link to={`/messages/${h.user._id}`} className="btn sm" aria-label={`Message ${h.user.name}`}><MessageSquare size={14} /></Link>}
              {isAuthor && !solved && <button className="btn sm success" onClick={() => act(() => api.post(`/requests/${id}/solve`, { helperId: h.user._id }))}>Solved by</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
