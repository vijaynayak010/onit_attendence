import { useState, useEffect, useRef } from 'react';
import { Menu, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/api';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 h-16 glass flex items-center justify-between px-4 lg:px-6 shrink-0 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <Menu size={20} />
        </button>
        
        {/* Mobile Logo */}
        <Link to="/dashboard" className="lg:hidden flex items-center gap-2 group">
          <img 
            src="/logo.png" 
            alt="OnIT India" 
            className="h-8 w-auto object-contain transition-transform group-active:scale-95" 
          />
          <span className="text-slate-900 text-[10px] font-black uppercase tracking-widest">OnIT India</span>
        </Link>
      </div>

      <div className="hidden lg:block">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2.5 rounded-2xl transition-all duration-300 transform active:scale-90
              ${showNotifications ? 'bg-slate-900 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-400 hover:text-slate-600 border border-transparent'}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-brand-500 border-2 border-white rounded-full' shadow-lg animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <NotificationDropdown
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkRead={handleMarkRead}
              onMarkAllRead={handleMarkAllRead}
              onClose={() => setShowNotifications(false)}
            />
          )}
        </div>

        <Link to="/profile" className="flex items-center gap-3 pl-4 border-l border-slate-100 hover:opacity-80 transition-all group">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center border border-brand-200 shadow-sm group-hover:scale-105 transition-transform">
            <span className="text-brand-700 text-sm font-black">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-black text-slate-900 leading-none tracking-tight">{user?.name || 'User'}</p>
            <p className="text-[10px] text-brand-600 mt-1 uppercase font-black tracking-widest opacity-70">{user?.role || 'employee'}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
