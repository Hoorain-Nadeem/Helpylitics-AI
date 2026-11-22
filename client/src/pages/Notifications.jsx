import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle2, HandHeart, FilePlus2 } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../constants';

const ICON = { new_request: FilePlus2, help_offer: HandHeart, solved: CheckCircle2, status: Bell, system: Bell };

export default function Notifications() {
  const { setUnread, socket } = useAuth();
  const [list, setList] = useState(null);

  const load = () => api.get('/notifications').then((r) => setList(r.data));
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!socket) return;
    const h = (n) => setList((p) => [n, ...(p || [])]);
    socket.on('notification', h);
    return () => socket.off('notification', h);
  }, [socket]);

  const markAll = async () => { await api.put('/notifications/read'); setUnread(0); load(); };

  return (
    <>
      <div className="row between page-head"><div><h1>Notifications</h1><p>New requests, help offers and status changes.</p></div><button className="btn" onClick={markAll}>Mark all as read</button></div>
      <div className="card flat">
        {list && !list.length && <p className="muted" style={{ padding: 20 }}>You are all caught up.</p>}
        {list?.map((n) => {
          const Icon = ICON[n.type] || Bell;
          return (
            <Link key={n._id} to={n.link || '/notifications'} className={`li ${n.read ? '' : 'unread'}`}>
              <div className="avatar"><Icon size={18} /></div>
              <div className="grow">{n.text}<div className="small muted">{timeAgo(n.createdAt)}</div></div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
