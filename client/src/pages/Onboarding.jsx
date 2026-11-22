import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Plus } from 'lucide-react';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import ChipInput from '../components/ChipInput';

export default function Onboarding() {
  const { user, refresh } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: user.name, location: user.location || '', skills: user.skills || [], interests: user.interests || [] });
  const [ai, setAi] = useState({ canHelp: [], needHelp: [] });
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => api.post('/ai/onboarding', { skills: form.skills, interests: form.interests }).then((r) => setAi(r.data)).catch(() => {}), 300);
    return () => clearTimeout(t);
  }, [form.skills, form.interests]);

  const addTo = (key, v) => !form[key].includes(v) && setForm((f) => ({ ...f, [key]: [...f[key], v] }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.skills.length && user.role !== 'need') return setError('Add at least one skill so we can match you with requests.');
    try {
      await api.put('/users/me', { ...form, onboarded: true });
      await refresh();
      nav('/dashboard');
    } catch (err) { setError(errMsg(err)); }
  };

  const Suggest = ({ title, items, target }) => (
    <div>
      <div className="small muted" style={{ marginBottom: 6 }}>{title}</div>
      <div className="row">
        {items.map((s) => (
          <button type="button" key={s} className="chip mint" onClick={() => addTo(target, s)}><Plus size={12} />{s}</button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="auth">
      <motion.form onSubmit={save} className="card stack" style={{ width: 'min(620px,100%)' }} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <div><h2>Tell us about you</h2><p className="muted">This powers your matches and AI suggestions.</p></div>
        <div className="grid g2">
          <label className="field">Name<input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          <label className="field">Location<input className="input" placeholder="City or Remote" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
        </div>
        <div className="field"><span style={{ fontWeight: 500, fontSize: '.9rem' }}>Skills you have</span><ChipInput value={form.skills} onChange={(skills) => setForm({ ...form, skills })} placeholder="react, figma, python..." /></div>
        <div className="field"><span style={{ fontWeight: 500, fontSize: '.9rem' }}>Interests or topics you want to learn</span><ChipInput value={form.interests} onChange={(interests) => setForm({ ...form, interests })} placeholder="docker, interviews..." /></div>
        <div className="card" style={{ background: 'var(--brand-soft)', borderColor: 'transparent' }}>
          <div className="row" style={{ marginBottom: 12, color: 'var(--brand-ink)', fontWeight: 500 }}><Sparkles size={16} /> AI suggestions</div>
          <div className="stack">
            <Suggest title="You may be able to help with" items={ai.canHelp} target="skills" />
            <Suggest title="You may want help with" items={ai.needHelp} target="interests" />
          </div>
        </div>
        {error && <div className="error" role="alert">{error}</div>}
        <button className="btn primary lg">Finish and open dashboard</button>
      </motion.form>
    </div>
  );
}
