import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Clock, FileText, Shield, LogOut, X, LayoutList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks', icon: LayoutList, label: 'Manage Tasks' },
  { to: '/attendance', icon: Clock, label: 'Attendance' },
  { to: '/work-updates', icon: FileText, label: 'Work Updates' },
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
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-900 z-30 flex flex-col transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}
      >
        {/* Logo */}
        <div className="p-8 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <img 
                src="/logo.png" 
                alt="OnIT India" 
                className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300" 
              />
              <div className="flex flex-col">
                <span className="text-white font-black text-lg tracking-tighter leading-none">OnIT India</span>
                <span className="text-brand-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-80">Workforce</span>
              </div>
            </Link>
            <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white transition-colors p-2">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* User info */}
        <div className="px-6 py-6">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/40 border border-slate-700/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/20">
              <span className="text-white text-sm font-black">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-slate-100 text-sm font-bold truncate">{user?.name || 'User'}</p>
              <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest truncate">{user?.role || 'Employee'}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] px-3 mb-4 mt-2">Main Menu</p>
          {navItems
            .filter(item => user?.role !== 'admin' || (!['/work-updates', '/attendance'].includes(item.to)))
            .map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300
                ${isActive
                  ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-lg shadow-brand-500/5'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] px-3 mt-8 mb-4">Management</p>
              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300
                  ${isActive
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-lg shadow-brand-500/5'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`
                }
              >
                <Shield size={18} />
                Admin Panel
              </NavLink>
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-slate-700/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
