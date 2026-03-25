import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Clock, FileText, Shield, LogOut, X, Zap, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
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
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="OnIT India" className="h-8 object-contain" />
            </div>
            <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-800/50">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
              <span className="text-green-400 text-sm font-bold">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-slate-200 text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-slate-500 text-xs truncate">{user?.role || 'Employee'}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-2 mb-3">Menu</p>
          {navItems
            .filter(item => user?.role !== 'admin' || (!['/work-updates', '/attendance'].includes(item.to)))
            .map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${isActive
                  ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-2 mt-4 mb-3">Admin</p>
              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${isActive
                    ? 'bg-green-500/15 text-green-400 border border-green-500/20'
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
