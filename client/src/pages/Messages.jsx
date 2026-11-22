import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';

export default function Messages() {
  const { userId } = useParams();
  const { user, socket } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();
  const [convos, setConvos] = useState([]);
  const [msgs, setMsgs] = useState([]);
  const [other, setOther] = useState(null);
  const [text, setText] = useState(loc.state?.draft || '');
  const end = useRef(null);

  const loadConvos = () => api.get('/messages/conversations').then((r) => setConvos(r.data));
  useEffect(() => { loadConvos(); }, [userId]);

  useEffect(() => {
    if (!userId) { setMsgs([]); setOther(null); return; }
    api.get(`/messages/${userId}`).then((r) => setMsgs(r.data));
    api.get(`/users/${userId}`).then((r) => setOther(r.data));
  }, [userId]);

  useEffect(() => {
    if (!socket) return;
    const onMsg = (m) => {
      if (m.from === userId) { setMsgs((p) => [...p, m]); api.get(`/messages/${userId}`); }
      loadConvos();
    };
    socket.on('message', onMsg);
    return () => socket.off('message', onMsg);
  }, [socket, userId]);

  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const { data } = await api.post('/messages', { to: userId, text });
    setMsgs((p) => [...p, data]);
    setText('');
    loadConvos();
  };

  return (
    <>
      <div className="page-head"><h1>Messages</h1></div>
      <div className="card flat chat">
        <div className="list">
          {!convos.length && <p className="muted small" style={{ padding: 16 }}>No conversations yet. Open a request and message the author or a helper.</p>}
          {convos.map((c) => (
            <Link key={c.userId} to={`/messages/${c.userId}`} className={`convo ${c.userId === userId ? 'on' : ''}`}>
              <Avatar name={c.user.name} />
              <div className="grow" style={{ minWidth: 0 }}><b>{c.user.name}</b><div className="small muted" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.last.text}</div></div>
              {c.unread > 0 && <span className="chip brand">{c.unread}</span>}
            </Link>
          ))}
        </div>
        <div className="thread">
          {!userId ? <p className="muted" style={{ padding: 24 }}>Select a conversation.</p> : (
            <>
              <div className="li"><Avatar name={other?.name || '?'} /><b>{other?.name}</b></div>
              <div className="msgs">
                {msgs.map((m) => <div key={m._id} className={`bubble ${m.from === user._id ? 'mine' : ''}`}>{m.text}</div>)}
                <div ref={end} />
              </div>
              <form onSubmit={send}>
                <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message" aria-label="Message" />
                <button className="btn primary" aria-label="Send"><Send size={16} /></button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
