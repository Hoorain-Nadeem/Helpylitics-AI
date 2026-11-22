import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Plus } from 'lucide-react';
import api, { errMsg } from '../api';
import { CATEGORIES, URGENCIES } from '../constants';
import ChipInput from '../components/ChipInput';

export default function CreateRequest() {
  const nav = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: '', urgency: '', tags: [], location: '' });
  const [ai, setAi] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    if (form.description.trim().length < 20 && form.title.trim().length < 8) { setAi(null); return; }
    const t = setTimeout(() => api.post('/ai/analyze', { title: form.title, description: form.description }).then((r) => setAi(r.data)).catch(() => {}), 450);
    return () => clearTimeout(t);
  }, [form.title, form.description]);

  const applyAll = () => setForm((f) => ({ ...f, title: ai.betterTitle || f.title, category: ai.category, urgency: ai.urgency, tags: [...new Set([...f.tags, ...ai.tags])] }));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const { data } = await api.post('/requests', form);
      nav(`/requests/${data._id}`);
    } catch (err) { setError(errMsg(err)); setBusy(false); }
  };

  return (
    <>
      <div className="page-head"><h1>Create a request</h1><p>Leave category, tags and urgency empty and AI will fill them in.</p></div>
      <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr', alignItems: 'start' }}>
        <form className="card stack" onSubmit={submit}>
          <label className="field">Title<input className="input" value={form.title} onChange={set('title')} placeholder="e.g. React useEffect runs twice" required /></label>
          <label className="field">Description<textarea className="textarea" value={form.description} onChange={set('description')} placeholder="What are you trying to do, what happened, and by when do you need it?" required /></label>
          <div className="field"><span style={{ fontWeight: 500, fontSize: '.9rem' }}>Tags</span><ChipInput value={form.tags} onChange={(tags) => setForm({ ...form, tags })} placeholder="react, api..." /></div>
          <div className="grid g3">
            <label className="field">Category<select className="select" value={form.category} onChange={set('category')}><option value="">Auto-detect</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
            <label className="field">Urgency<select className="select" value={form.urgency} onChange={set('urgency')}><option value="">Auto-detect</option>{URGENCIES.map((c) => <option key={c}>{c}</option>)}</select></label>
            <label className="field">Location<input className="input" value={form.location} onChange={set('location')} placeholder="Remote" /></label>
          </div>
          {error && <div className="error" role="alert">{error}</div>}
          <button className="btn primary lg" disabled={busy}>{busy ? 'Posting...' : 'Post request'}</button>
        </form>

        <div className="card stack" style={{ position: 'sticky', top: 20 }}>
          <div className="row between"><div className="row" style={{ color: 'var(--brand-ink)', fontWeight: 500 }}><Sparkles size={16} /> AI suggestions</div>{ai && <button className="btn sm" onClick={applyAll}>Apply all</button>}</div>
          {!ai && <p className="muted small">Start typing a title and description. Suggestions appear here.</p>}
          {ai && (
            <>
              <div className="row"><span className="chip brand">{ai.category}</span><span className={`chip urg-${ai.urgency}`}>{ai.urgency} urgency</span></div>
              <div><div className="small muted" style={{ marginBottom: 6 }}>Suggested tags</div>
                <div className="row">{ai.tags.length ? ai.tags.map((t) => <button key={t} type="button" className="chip mint" onClick={() => !form.tags.includes(t) && setForm({ ...form, tags: [...form.tags, t] })}><Plus size={12} />{t}</button>) : <span className="small muted">No tags detected yet</span>}</div>
              </div>
              {ai.tips.length > 0 && <div><div className="small muted" style={{ marginBottom: 6 }}>Make it easier to answer</div>{ai.tips.map((t) => <p key={t} className="small" style={{ marginBottom: 4 }}>{t}</p>)}</div>}
              <div><div className="small muted" style={{ marginBottom: 6 }}>Rewrite suggestion</div>
                <pre className="small" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', background: 'var(--bg)', padding: 10, borderRadius: 10 }}>{ai.rewrite}</pre>
                <button type="button" className="btn sm" style={{ marginTop: 8 }} onClick={() => setForm({ ...form, description: `${form.description.trim()}\n\n${ai.rewrite}` })}>Append to description</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
