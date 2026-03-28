import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Shield, Edit2, Save, X, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { profileService } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
  });
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await profileService.getProfile();
      const profile = res.data.data;
      setOriginalData(profile);
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        mobile: profile.mobile || '',
      });
    } catch (err) {
      addToast('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    if (!formData.name?.trim()) return 'Full Name is required';
    if (!formData.email?.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email format';
    if (formData.mobile && !/^\d{10,15}$/.test(formData.mobile)) return 'Mobile number should be 10-15 digits';
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      addToast(error, 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await profileService.updateProfile(formData);
      addToast('Profile updated successfully', 'success');
      setOriginalData(res.data.data);
      setIsEditing(false);
      
      // Update auth context if email or name changed
      const token = sessionStorage.getItem('token');
      login({ ...user, ...res.data.data }, token);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your professional information</p>
        </div>
        {!isEditing ? (
          <Button icon={Edit2} onClick={() => setIsEditing(true)}>Edit Profile</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="secondary" icon={X} onClick={() => {
              setIsEditing(false);
              setFormData({
                name: originalData.name || '',
                email: originalData.email || '',
                mobile: originalData.mobile || '',
              });
            }}>Cancel</Button>
            <Button icon={Save} onClick={handleSave} loading={saving}>Save Changes</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1 border-none shadow-sm overflow-hidden" padding="none">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 h-24"></div>
          <div className="px-6 pb-6 -mt-12 flex flex-col items-center">
            <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
              <div className="w-full h-full rounded-xl bg-gray-50 flex items-center justify-center">
                <User size={48} className="text-green-500" />
              </div>
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900 text-center">{originalData?.name || 'Employee'}</h2>
            <p className="text-gray-500 text-sm capitalize">{originalData?.role}</p>
            
            <div className="w-full mt-6 pt-6 border-t border-gray-100 flex flex-col gap-3">
               <button 
                onClick={() => navigate('/change-password')}
                className="flex items-center gap-3 text-sm text-gray-600 hover:text-green-600 transition-colors py-2 px-3 rounded-lg hover:bg-green-50"
               >
                 <Lock size={16} />
                 Change Password
               </button>
            </div>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="md:col-span-2 border-none shadow-sm" padding="lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4 sm:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Shield size={18} className="text-green-500" />
                Personal Information
              </h3>
            </div>

            <div className="sm:col-span-1">
              {isEditing ? (
                <Input
                  label="Full Name"
                  icon={User}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                  <div className="flex items-center gap-2 text-gray-900 font-medium bg-gray-50 p-3 rounded-xl border border-transparent">
                    <User size={16} className="text-gray-400" />
                    {originalData?.name || 'Not set'}
                  </div>
                </div>
              )}
            </div>

            <div className="sm:col-span-1">
              {isEditing ? (
                <Input
                  label="Email Address"
                  type="email"
                  icon={Mail}
                  value={formData.email}
                  disabled={true}
                  hint="Managed by administrator"
                />
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                  <div className="flex items-center gap-2 text-gray-900 font-medium bg-gray-50 p-3 rounded-xl border border-transparent">
                    <Mail size={16} className="text-gray-400" />
                    {originalData?.email}
                  </div>
                </div>
              )}
            </div>

            <div className="sm:col-span-1">
              {isEditing ? (
                <Input
                  label="Mobile Number"
                  icon={Phone}
                  placeholder="Enter mobile number"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mobile Number</label>
                  <div className="flex items-center gap-2 text-gray-900 font-medium bg-gray-50 p-3 rounded-xl border border-transparent">
                    <Phone size={16} className="text-gray-400" />
                    {originalData?.mobile || 'Not set'}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Employee ID</label>
              <div className="flex items-center gap-2 text-gray-500 font-medium bg-gray-100/50 p-3 rounded-xl border border-gray-200 cursor-not-allowed">
                <Shield size={16} className="text-gray-400" />
                {originalData?.employeeId || 'N/A'}
                <span className="ml-auto text-[10px] bg-gray-200 px-1.5 py-0.5 rounded text-gray-600 uppercase">ReadOnly</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Joining Date</label>
              <div className="flex items-center gap-2 text-gray-500 font-medium bg-gray-100/50 p-3 rounded-xl border border-gray-200 cursor-not-allowed">
                <Calendar size={16} className="text-gray-400" />
                {originalData?.joiningDate ? new Date(originalData.joiningDate).toLocaleDateString() : 'N/A'}
                <span className="ml-auto text-[10px] bg-gray-200 px-1.5 py-0.5 rounded text-gray-600 uppercase">ReadOnly</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Role</label>
              <div className="flex items-center gap-2 text-gray-500 font-medium bg-gray-100/50 p-3 rounded-xl border border-gray-200 cursor-not-allowed">
                <Shield size={16} className="text-gray-400" />
                <span className="capitalize">{originalData?.role}</span>
                <span className="ml-auto text-[10px] bg-gray-200 px-1.5 py-0.5 rounded text-gray-600 uppercase">ReadOnly</span>
              </div>
            </div>

          </div>
        </Card>
      </div>
    </div>
  );
}
