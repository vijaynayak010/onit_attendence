import { useState, useEffect } from 'react';
import { User, Lock, Mail, Save, CheckCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService, profileService } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';

export default function Profile() {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Password Form State
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await profileService.getProfile();
        setProfileData(res.data.data);
      } catch (err) {
        // Ignoring if fails, we fallback to auth context user
        console.error("Failed to load profile", err);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const validate = () => {
    const e = {};
    if (!form.oldPassword) e.oldPassword = 'Current password is required';
    if (!form.newPassword) e.newPassword = 'New password is required';
    else if (form.newPassword.length < 6) e.newPassword = 'Password must be at least 6 characters';
    
    if (form.newPassword !== form.confirmPassword) {
      e.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePasswordChange = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.changePassword(form.oldPassword, form.newPassword);
      addToast('Password updated successfully!', 'success');
      setSaved(true);
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const displayUser = profileData || user;
  const displayName = displayUser?.email ? displayUser.email.split('@')[0] : 'User';

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage your account and security settings</p>
      </div>

      {/* Avatar & Info */}
      <Card>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-md">
            <span className="text-white text-3xl font-bold">
              {displayName[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 capitalize">{displayName}</h2>
            <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-0.5">
              <Mail size={14} />
              {displayUser?.email}
            </p>
            <div className="flex gap-2 mt-2">
              <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full capitalize border border-green-200">
                <User size={12} className="mr-1" />
                {displayUser?.role || 'Employee'}
              </span>
              {displayUser?.isPasswordChanged === false && (
                <span className="inline-flex items-center px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full border border-orange-200">
                  <Shield size={12} className="mr-1" />
                  Default Password Active
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Change Password Form */}
      <Card padding="lg">
        <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Lock size={18} className="text-gray-400" />
          Change Password
        </h3>
        
        <div className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Current Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={form.oldPassword}
              onChange={e => { setForm(v => ({ ...v, oldPassword: e.target.value })); setErrors(v => ({ ...v, oldPassword: '' })); }}
              placeholder="••••••••"
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-green-500 focus:border-green-500
                ${errors.oldPassword ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'}`}
            />
            {errors.oldPassword && <p className="text-xs text-red-500">{errors.oldPassword}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={form.newPassword}
              onChange={e => { setForm(v => ({ ...v, newPassword: e.target.value })); setErrors(v => ({ ...v, newPassword: '' })); }}
              placeholder="••••••••"
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-green-500 focus:border-green-500
                ${errors.newPassword ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'}`}
            />
            {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={e => { setForm(v => ({ ...v, confirmPassword: e.target.value })); setErrors(v => ({ ...v, confirmPassword: '' })); }}
              placeholder="••••••••"
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-green-500 focus:border-green-500
                ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'}`}
            />
            {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
          </div>

          <div className="pt-2">
            <Button
              onClick={handlePasswordChange}
              loading={loading}
              size="lg"
              icon={saved ? CheckCircle : Save}
              className="w-full sm:w-auto"
            >
              {saved ? 'Password Updated!' : 'Update Password'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
