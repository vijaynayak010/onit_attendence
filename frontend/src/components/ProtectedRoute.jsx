import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">Loading...</p>
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
