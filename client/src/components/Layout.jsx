import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, Compass, PlusCircle, MessageSquare, Sparkles, Trophy, Bell, User, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

const links = [
  ['/dashboard', 'Dashboard', LayoutDashboard],
  ['/explore', 'Explore', Compass],
  ['/create', 'New request', PlusCircle],
  ['/messages', 'Messages', MessageSquare],
  ['/ai-center', 'AI Center', Sparkles],
  ['/leaderboard', 'Leaderboard', Trophy],
  ['/notifications', 'Notifications', Bell],
  ['/profile', 'Profile', User],
];

export default function Layout() {
  const { user, logout, unread } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="logo"><i>H</i> Helplytics AI</div>
        <nav className="nav" aria-label="Main">
          {links.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end={to === '/profile'}>
              <Icon size={18} /> {label}
              {label === 'Notifications' && unread > 0 && <span className="count">{unread}</span>}
            </NavLink>
          ))}
          {user.isAdmin && <NavLink to="/admin"><Shield size={18} /> Admin</NavLink>}
        </nav>
        <div className="me">
          <div className="row" style={{ marginBottom: 10 }}>
            <Avatar name={user.name} />
            <div><b>{user.name}</b><div className="small muted">Trust {user.trustScore}</div></div>
          </div>
          <button className="btn sm" onClick={() => { logout(); nav('/'); }}><LogOut size={15} /> Log out</button>
        </div>
      </aside>
      <main className="main">
        <AnimatePresence mode="wait">
          <motion.div key={loc.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
