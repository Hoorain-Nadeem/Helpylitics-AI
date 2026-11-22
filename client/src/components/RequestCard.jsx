import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Users } from 'lucide-react';
import { timeAgo } from '../constants';

const STATUS = { open: ['Open', 'brand'], in_progress: ['In progress', 'amber'], solved: ['Solved', 'mint'] };

export default function RequestCard({ r, i = 0 }) {
  const [label, tone] = STATUS[r.status] || STATUS.open;
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.04, duration: 0.3 }} whileHover={{ y: -2 }}>
      <Link to={`/requests/${r._id}`} className="card req" style={{ display: 'grid' }}>
        <div className="row between">
          <div className="row">
            <span className={`chip urg-${r.urgency}`}>{r.urgency} urgency</span>
            <span className={`chip ${tone}`}>{label}</span>
            <span className="chip">{r.category}</span>
          </div>
          <span className="small muted">{timeAgo(r.createdAt)}</span>
        </div>
        <h3>{r.title}</h3>
        <p className="muted small" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.summary || r.description}</p>
        <div className="row between">
          <div className="row">{r.tags?.slice(0, 4).map((t) => <span key={t} className="chip">{t}</span>)}</div>
          <div className="row small muted">
            <span className="row" style={{ gap: 4 }}><MapPin size={14} />{r.location}</span>
            <span className="row" style={{ gap: 4 }}><Users size={14} />{r.helpers?.length || 0}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
