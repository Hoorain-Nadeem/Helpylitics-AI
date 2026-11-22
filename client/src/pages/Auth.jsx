import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';

const ROLES = [['need', 'Need help'], ['help', 'Can help'], ['both', 'Both']];

export default function Auth() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'both' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const { data } = await api.post(`/auth/${mode}`, form);
      login(data);
      nav(data.user.onboarded ? '/dashboard' : '/onboarding');
    } catch (err) { setError(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <div className="auth">
      <motion.div className="card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Link to="/" className="logo" style={{ padding: 0 }}><i>H</i> Helplytics AI</Link>
        <h2 style={{ marginTop: 18 }}>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h2>
        <div className="tabs" role="tablist">
          {['login', 'signup'].map((m) => (
            <button key={m} role="tab" aria-selected={mode === m} className={mode === m ? 'on' : ''} onClick={() => setMode(m)}>{m === 'login' ? 'Log in' : 'Sign up'}</button>
          ))}
        </div>
        <form className="stack" onSubmit={submit}>
          {mode === 'signup' && <label className="field">Full name<input className="input" value={form.name} onChange={set('name')} required /></label>}
          <label className="field">Email<input className="input" type="email" value={form.email} onChange={set('email')} required /></label>
          <label className="field">Password<input className="input" type="password" minLength={6} value={form.password} onChange={set('password')} required /></label>
          {mode === 'signup' && (
            <div className="field"><span style={{ fontWeight: 500, fontSize: '.9rem' }}>I want to</span>
              <div className="roles" style={{ marginTop: 6 }}>
                {ROLES.map(([v, l]) => <button type="button" key={v} className={`role ${form.role === v ? 'on' : ''}`} onClick={() => setForm({ ...form, role: v })}>{l}</button>)}
              </div>
            </div>
          )}
          {error && <div className="error" role="alert">{error}</div>}
          <button className="btn primary lg" disabled={busy}>{busy ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Log in'}</button>
        </form>
        {mode === 'login' && <p className="small muted" style={{ marginTop: 14 }}>Demo: sara@demo.com / password123 (after running the seed script)</p>}
      </motion.div>
    </div>
  );
}
