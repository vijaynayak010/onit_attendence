import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
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
        name: res.data.data.name || email.split('@')[0],
        email: res.data.data.email || email,
        role: res.data.data.role,
        isPasswordChanged: res.data.data.isPasswordChanged,
      };
      
      login(userData, token);
      
      addToast(`Welcome back! Logged in as ${role === 'admin' ? 'Administrator' : 'Employee'}.`, 'success');
      
      if (userData.role === 'employee' && userData.isPasswordChanged === false) {
        navigate('/change-password');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Invalid credentials. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03)_0%,transparent_70%)]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-700">
        {/* Logo Section */}
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="w-24 h-24 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/5 flex items-center justify-center shadow-2xl shadow-emerald-500/10 mb-6 transform hover:scale-110 transition-transform duration-500">
             <img src="/logo.png" alt="OnIT India" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-white text-4xl font-black tracking-tighter">OnIT <span className="text-emerald-400 font-black">India</span></h1>
          <p className="text-slate-500 mt-3 text-[10px] font-black uppercase tracking-[0.3em]">Workforce Management Node</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] p-10 shadow-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"></div>
          
          <div className="mb-8">
            <h2 className="text-white text-2xl font-black tracking-tight mb-2">Workspace Access</h2>
            <p className="text-slate-400 text-sm font-medium">Identify yourself to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Switcher */}
            <div className="flex bg-slate-950/50 rounded-2xl p-1.5 border border-white/5 shadow-inner">
              <button
                type="button"
                onClick={() => { setRole('employee'); setErrors({}); }}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
                  role === 'employee' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Employee
              </button>
              <button
                type="button"
                onClick={() => { setRole('admin'); setErrors({}); }}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
                  role === 'admin' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Admin
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Secure Email</label>
                <div className="group relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors(v => ({ ...v, email: '' })); }}
                    placeholder="name@company.com"
                    className={`w-full rounded-2xl border bg-slate-950/40 pl-12 pr-4 py-4 text-sm text-white placeholder-slate-600
                      transition-all outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-slate-950/60
                      ${errors.email ? 'border-red-500/50' : 'border-white/5 hover:border-white/10 focus:border-emerald-500/50'}`}
                  />
                </div>
                {errors.email && <p className="text-[10px] font-bold text-red-400 mt-1 ml-1">{errors.email}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Access Token</label>
                <div className="group relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors(v => ({ ...v, password: '' })); }}
                    placeholder="••••••••"
                    className={`w-full rounded-2xl border bg-slate-950/40 pl-12 pr-4 py-4 text-sm text-white placeholder-slate-600
                      transition-all outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-slate-950/60
                      ${errors.password ? 'border-red-500/50' : 'border-white/5 hover:border-white/10 focus:border-emerald-500/50'}`}
                  />
                </div>
                {errors.password && <p className="text-[10px] font-bold text-red-400 mt-1 ml-1">{errors.password}</p>}
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/10"
              variant="primary"
              icon={ArrowRight}
            >
              {loading ? 'Authenticating...' : 'Access Secure Session'}
            </Button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest mt-10">
          © {new Date().getFullYear()} OnIT India • Dark Secure Node
        </p>
      </div>
    </div>
  );
}
