import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Zap, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee'); // Added role state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      let res;
      if (role === 'admin') {
        res = await authService.adminLogin(email, password);
      } else {
        res = await authService.employeeLogin(email, password);
      }
      
      // Backend response: { success, message, data: { token, role, [isPasswordChanged] } }
      const token = res.data.data.token;
      const userData = {
        id: res.data.data._id || null,
        name: email.split('@')[0], // Use form email since backend may not return it
        email: res.data.data.email || email,
        role: res.data.data.role,
        isPasswordChanged: res.data.data.isPasswordChanged,
      };
      
      login(userData, token);
      
      addToast(`Welcome back! Logged in as ${role === 'admin' ? 'Administrator' : 'Employee'}.`, 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.response?.data?.message || 'Invalid credentials. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 flex flex-col items-center">
          <img src="/logo.png" alt="OnIT India Logo" className="h-20 mb-2 object-contain" />
          <p className="text-slate-400 mt-2 text-sm">Workforce Management Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-white text-xl font-semibold mb-1">Sign in to your account</h2>
          <p className="text-slate-400 text-sm mb-8">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setRole('employee')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  role === 'employee' ? 'bg-green-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Employee
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  role === 'admin' ? 'bg-green-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Admin
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors(v => ({ ...v, email: '' })); }}
                  placeholder="you@company.com"
                  className={`w-full rounded-xl border bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500
                    transition-all outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                    ${errors.email ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(v => ({ ...v, password: '' })); }}
                  placeholder="••••••••"
                  className={`w-full rounded-xl border bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500
                    transition-all outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                    ${errors.password ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'}`}
                />
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-green-500 hover:bg-green-400 disabled:opacity-60 disabled:cursor-not-allowed
                text-white font-semibold rounded-xl py-3 text-sm transition-all duration-200 shadow-lg shadow-green-500/25
                hover:shadow-green-500/40 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          © 2024 OnIT India. All rights reserved.
        </p>
      </div>
    </div>
  );
}
