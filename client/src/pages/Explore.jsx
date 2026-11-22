import { useEffect, useState } from 'react';
import api from '../api';
import { CATEGORIES, URGENCIES } from '../constants';
import RequestCard from '../components/RequestCard';

export default function Explore() {
  const [f, setF] = useState({ q: '', category: '', urgency: '', skill: '', location: '', status: '' });
  const [list, setList] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    const t = setTimeout(() => api.get('/requests', { params: f }).then((r) => setList(r.data)), 250);
    return () => clearTimeout(t);
  }, [f]);

  return (
    <>
      <div className="page-head"><h1>Explore requests</h1><p>Find something you can help with.</p></div>
      <div className="filters">
        <input className="input" placeholder="Search title or description" aria-label="Search" value={f.q} onChange={set('q')} />
        <select className="select" aria-label="Category" value={f.category} onChange={set('category')}><option value="">All categories</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        <select className="select" aria-label="Urgency" value={f.urgency} onChange={set('urgency')}><option value="">Any urgency</option>{URGENCIES.map((c) => <option key={c}>{c}</option>)}</select>
        <input className="input" placeholder="Skill (react)" aria-label="Skill" value={f.skill} onChange={set('skill')} />
        <input className="input" placeholder="Location" aria-label="Location" value={f.location} onChange={set('location')} />
        <select className="select" aria-label="Status" value={f.status} onChange={set('status')}><option value="">Any status</option><option value="open">Open</option><option value="in_progress">In progress</option><option value="solved">Solved</option></select>
      </div>
      <div className="stack">
        {list?.map((r, i) => <RequestCard key={r._id} r={r} i={i} />)}
        {list && !list.length && <div className="card muted">No requests match these filters. Clear a filter or post a new request.</div>}
      </div>
    </>
  );
}
