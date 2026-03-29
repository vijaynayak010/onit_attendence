import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, ClipboardCheck, History, Shield, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks', icon: ClipboardCheck, label: 'Manage Tasks' },
  { to: '/attendance', icon: Calendar, label: 'Attendance' },
  { to: '/work-updates', icon: History, label: 'Work Updates' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 glass-dark z-30 flex flex-col transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex border-r border-white/5`}
      >
        {/* Logo */}
        <div className="p-8">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="flex flex-col">
              <span className="text-[#10B981] font-black text-2xl tracking-tighter leading-tight">OnIT India</span>
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-0.5 opacity-60">Management System</span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-0 py-4 space-y-1 overflow-y-auto">
          {navItems
            .filter(item => user?.role !== 'admin' || (!['/work-updates', '/attendance'].includes(item.to)))
            .map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-8 py-4 text-sm font-bold transition-all duration-200
                ${isActive
                  ? 'sidebar-active-item'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`
              }
            >
              <Icon size={20} className="shrink-0" />
              {label}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <div className="mt-4">
              <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] px-8 mb-2">Admin</p>
              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-8 py-4 text-sm font-bold transition-all duration-200
                  ${isActive
                    ? 'sidebar-active-item'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`
                }
              >
                <Shield size={20} className="shrink-0" />
                Admin Panel
              </NavLink>
            </div>
          )}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <div className="px-4 py-3 rounded-xl bg-white/5 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-[#10B981]/20 flex items-center justify-center text-[#10B981] font-black text-xs">
                {user?.name?.[0]?.toUpperCase() || 'U'}
             </div>
             <div className="min-w-0">
                <p className="text-slate-200 text-xs font-bold truncate">{user?.name || 'User'}</p>
                <p className="text-slate-500 text-[10px] uppercase font-bold truncate">{user?.role || 'Staff'}</p>
             </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
