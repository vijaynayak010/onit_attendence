import { CheckCircle, Clock, BellOff, X, Activity } from 'lucide-react';

export default function NotificationDropdown({ notifications, unreadCount, onMarkRead, onMarkAllRead, onClose }) {
  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/90 backdrop-blur-2xl rounded-3xl shadow-premium border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
      <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Notifications</h3>
          {unreadCount > 0 && <p className="text-[10px] text-brand-600 font-bold mt-0.5">{unreadCount} unread alerts</p>}
        </div>
        <div className="flex items-center gap-1">
          {notifications.length > 0 && (
            <button 
              onClick={onMarkAllRead}
              className="p-1.5 text-slate-400 hover:text-brand-600 transition-colors"
              title="Mark all as read"
            >
              <CheckCircle size={16} />
            </button>
          )}
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors lg:hidden">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto scrollbar-none">
        {notifications.length === 0 ? (
          <div className="py-12 flex flex-col items-center text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200 mb-3">
              <BellOff size={24} />
            </div>
            <p className="text-sm font-bold text-slate-900">All caught up!</p>
            <p className="text-xs text-slate-400 mt-1">No new notifications at the moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifications.map((n) => (
              <div 
                key={n._id} 
                className={`p-4 flex gap-3 transition-colors hover:bg-slate-50/80 relative group ${!n.isRead ? 'bg-brand-50/30' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm
                  ${n.type === 'task_assigned' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                  {n.type === 'task_assigned' ? <Clock size={18} /> : <Activity size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs leading-relaxed ${!n.isRead ? 'font-bold text-slate-900' : 'text-slate-600 font-medium'}`}>
                    {n.message}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider">
                    {new Date(n.createdAt).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!n.isRead && (
                  <button 
                    onClick={() => onMarkRead(n._id)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-brand-500 rounded-full shadow-lg shadow-brand-500/50"
                    title="Mark as read"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 bg-slate-50/50 text-center border-t border-slate-50">
           <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
             View All Activity
           </button>
        </div>
      )}
    </div>
  );
}
