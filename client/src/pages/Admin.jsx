import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flag, Trash2 } from 'lucide-react';
import api from '../api';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [list, setList] = useState([]);
  const load = () => {
    api.get('/admin/stats').then((r) => setStats(r.data));
    api.get('/admin/requests').then((r) => setList(r.data));
  };
  useEffect(load, []);

  const flag = async (id) => { await api.put(`/admin/requests/${id}/flag`); load(); };
  const del = async (id) => { if (confirm('Delete this request permanently?')) { await api.delete(`/admin/requests/${id}`); load(); } };
  const max = Math.max(1, ...(stats?.byCategory.map((c) => c.value) || [1]));

  return (
    <>
      <div className="page-head"><h1>Admin panel</h1><p>Moderate content and watch community health.</p></div>
      {stats && (
        <>
          <div className="grid g4" style={{ marginBottom: 18 }}>
            {[['Users', stats.users], ['Requests', stats.requests], ['Open', stats.open], ['Flagged', stats.flagged]].map(([l, v]) => <div key={l} className="card stat"><div className="num">{v}</div><div className="label">{l}</div></div>)}
          </div>
          <div className="card stack" style={{ marginBottom: 18 }}>
            <h3 style={{ fontSize: '1rem' }}>Requests by category</h3>
            {stats.byCategory.map((c) => <div key={c.name}><div className="row between small"><span>{c.name}</span><b>{c.value}</b></div><div className="bar"><span style={{ width: `${(c.value / max) * 100}%` }} /></div></div>)}
          </div>
        </>
      )}
      <div className="card flat">
        <table>
          <thead><tr><th>Request</th><th>Author</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {list.map((r) => (
              <tr key={r._id}>
                <td><Link to={`/requests/${r._id}`}>{r.title}</Link> {r.flagged && <span className="chip rose">Flagged</span>}</td>
                <td>{r.author?.name}</td><td>{r.status.replace('_', ' ')}</td>
                <td><div className="row"><button className="btn sm" onClick={() => flag(r._id)}><Flag size={14} />{r.flagged ? 'Unflag' : 'Flag'}</button><button className="btn sm danger" onClick={() => del(r._id)} aria-label="Delete"><Trash2 size={14} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
