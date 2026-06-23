import { useState } from 'react';
import { FiUser, FiLock, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/Badge';
import { getImageUrl } from '../utils/helpers';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', profileForm);
      updateUser(res.data.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await api.put('/auth/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(res.data.data);
      toast.success('Avatar updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success('Password changed');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card">
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-2xl font-bold text-primary-600 overflow-hidden">
              {user?.avatar ? <img src={getImageUrl(user.avatar)} alt="" className="w-full h-full object-cover" /> : user?.name?.[0]}
            </div>
            <label className="absolute -bottom-1 -right-1 p-1.5 bg-primary-600 text-white rounded-full cursor-pointer hover:bg-primary-700">
              <FiUpload size={12} />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <div className="mt-1"><RoleBadge role={user?.role} /></div>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2"><FiUser size={16} /> Profile Information</h3>
          <div><label className="block text-sm font-medium mb-1">Name</label><input className="input-field" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" className="input-field" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} /></div>
          <button type="submit" disabled={loading} className="btn-primary">Save Changes</button>
        </form>
      </div>

      <div className="card">
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2"><FiLock size={16} /> Change Password</h3>
          <div><label className="block text-sm font-medium mb-1">Current Password</label><input type="password" className="input-field" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required /></div>
          <div><label className="block text-sm font-medium mb-1">New Password</label><input type="password" className="input-field" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required minLength={6} /></div>
          <div><label className="block text-sm font-medium mb-1">Confirm Password</label><input type="password" className="input-field" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required /></div>
          <button type="submit" disabled={loading} className="btn-primary">Change Password</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
