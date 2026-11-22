import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import api from '../api';
import Avatar from '../components/Avatar';

export default function Leaderboard() {
  const [list, setList] = useState([]);
  useEffect(() => { api.get('/users/leaderboard').then((r) => setList(r.data)); }, []);
  const top = list.slice(0, 3);

  return (
    <>
      <div className="page-head"><h1>Leaderboard</h1><p>Top helpers ranked by points. Solve requests to climb.</p></div>
      <div className="podium">
        {top.map((u, i) => (
          <motion.div key={u._id} className="card stack" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div className="row between"><Trophy size={20} color={['#C9930A', '#7C8498', '#B0713C'][i]} /><span className="chip">Rank {i + 1}</span></div>
            <Link to={`/profile/${u._id}`} className="row"><Avatar name={u.name} size={46} /><div><b>{u.name}</b><div className="small muted">{u.location || 'Remote'}</div></div></Link>
            <div className="row between"><div><div className="stat"><div className="num" style={{ fontSize: '1.5rem' }}>{u.points}</div><div className="label">points</div></div></div><div className="small muted">Trust {u.trustScore}</div></div>
            <div className="row">{u.badges.map((b) => <span key={b} className="chip brand">{b}</span>)}</div>
          </motion.div>
        ))}
      </div>
      <div className="card flat">
        <table>
          <thead><tr><th>#</th><th>Helper</th><th>Solved</th><th>Trust</th><th>Points</th><th>Badges</th></tr></thead>
          <tbody>
            {list.map((u, i) => (
              <tr key={u._id}>
                <td>{i + 1}</td>
                <td><Link to={`/profile/${u._id}`} className="row"><Avatar name={u.name} size={30} />{u.name}</Link></td>
                <td>{u.helpedCount}</td><td>{u.trustScore}</td><td><b>{u.points}</b></td>
                <td><div className="row">{u.badges.map((b) => <span key={b} className="chip">{b}</span>)}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
