import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import api from '../api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);
  const [socket, setSocket] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
      return data;
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (localStorage.getItem('token')) await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  useEffect(() => {
    if (!user?._id) return;
    api.get('/notifications').then((r) => setUnread(r.data.filter((n) => !n.read).length)).catch(() => {});
    const s = io({ auth: { token: localStorage.getItem('token') } });
    s.on('notification', (n) => { setUnread((u) => u + 1); showToast(n.text); });
    setSocket(s);
    return () => s.disconnect();
  }, [user?._id, showToast]);

  const login = (data) => { localStorage.setItem('token', data.token); setUser(data.user); };
  const logout = () => { localStorage.removeItem('token'); setUser(null); setSocket(null); };

  return (
    <Ctx.Provider value={{ user, loading, login, logout, refresh, unread, setUnread, socket, showToast }}>
      {children}
      {toast && <div className="toast" role="status">{toast}</div>}
    </Ctx.Provider>
  );
}
