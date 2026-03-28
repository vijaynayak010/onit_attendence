import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-brand-500/10 rounded-full blur-[120px] animate-pulse"></div>
        
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/5 flex items-center justify-center shadow-2xl shadow-brand-500/10 animate-transition-in">
             <img src="/logo.png" alt="OnIT India" className="w-12 h-12 object-contain animate-pulse" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"></div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 animate-pulse">Initializing Session</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  
  // Force employee to change password on first login
  const isChangePasswordPage = window.location.pathname === '/change-password';
  if (user.role === 'employee' && !user.isPasswordChanged && !isChangePasswordPage) {
    return <Navigate to="/change-password" replace />;
  }

  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return children;
}
