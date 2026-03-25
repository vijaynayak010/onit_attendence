import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/api';
import Button from '../components/Button';
import Card from '../components/Card';

export default function ChangePassword() {
  const { user, login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.newPassword) e.newPassword = 'New password is required';
    else if (form.newPassword.length < 6) e.newPassword = 'Password must be at least 6 characters';
    
    if (form.newPassword !== form.confirmPassword) {
      e.confirmPassword = 'Passwords do not match';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      setLoading(true);
      await authService.changePassword(null, form.newPassword);
      
      // Update local storage and auth context
      const updatedUser = { ...user, isPasswordChanged: true };
      const token = localStorage.getItem('token');
      
      // We re-login to update the context with the new isPasswordChanged state
      login(updatedUser, token);

      addToast('Account secured! We are redirecting you to your dashboard.', 'success');
      
      // Small delay for better UX
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-2xl mb-4 border border-green-500/20">
            <ShieldCheck className="text-green-500 w-8 h-8" />
          </div>
          <h1 className="text-white text-2xl font-bold">Secure Your Account</h1>
          <p className="text-slate-400 mt-2 text-sm">
            For security reasons, you must change your temporary password before proceeding.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={form.newPassword}
                  onChange={(e) => {
                    setForm({ ...form, newPassword: e.target.value });
                    setErrors({ ...errors, newPassword: '' });
                  }}
                  className={`w-full rounded-xl border bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500
                    transition-all outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                    ${errors.newPassword ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'}`}
                  placeholder="At least 6 characters"
                />
              </div>
              {errors.newPassword && <p className="text-xs text-red-400">{errors.newPassword}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Confirm New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                  <CheckCircle size={16} />
                </div>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => {
                    setForm({ ...form, confirmPassword: e.target.value });
                    setErrors({ ...errors, confirmPassword: '' });
                  }}
                  className={`w-full rounded-xl border bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500
                    transition-all outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                    ${errors.confirmPassword ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'}`}
                  placeholder="Repeat new password"
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-60 disabled:cursor-not-allowed
                text-white font-semibold rounded-xl py-3 text-sm transition-all duration-200 shadow-lg shadow-green-500/25
                hover:shadow-green-500/40 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Set New Password
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
