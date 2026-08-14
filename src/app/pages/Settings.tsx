import { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useUser } from '../context/UserContext';
import { toast } from 'sonner';
import {
  User,
  Lock,
  LogOut,
  Camera,
  CheckCircle2,
  Edit2,
  Calendar,
  MapPin,
  Mail,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { ImageUploadWithCamera } from '../components/ImageUploadWithCamera';

type SettingsTab = 'personal' | 'security';

export function Settings() {
  const { currentUser, token, updateProfile, logout } = useUser();
  const [activeTab, setActiveTab] = useState<SettingsTab>('personal');
  const [isUpdating, setIsUpdating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Split name into first and last name for exact match with Screenshot 1
  const nameParts = (currentUser?.name || '').trim().split(' ');
  const initialFirstName = nameParts[0] || '';
  const initialLastName = nameParts.slice(1).join(' ') || '';

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [gender, setGender] = useState<'Male' | 'Female'>((currentUser as any)?.gender || 'Male');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [location, setLocation] = useState(currentUser?.location || 'Nagpur, Maharashtra');
  const [dateOfBirth, setDateOfBirth] = useState(currentUser?.dateOfBirth || '1996-12-15');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (currentUser) {
      const parts = (currentUser.name || '').trim().split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setGender((currentUser as any)?.gender || 'Male');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      setLocation(currentUser.location || 'Nagpur, Maharashtra');
      setDateOfBirth(currentUser.dateOfBirth || '1996-12-15');
      setAvatarUrl(currentUser.avatarUrl || '');
    }
  }, [currentUser]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        toast.success('Avatar selected! Click "Save Personal Information" to apply.');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveProfile = async () => {
    if (!currentUser?.id || !token) {
      toast.error('Session expired. Please log in again.');
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullName) {
      toast.error('First name is required');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: fullName,
          phone,
          location,
          avatarUrl,
          dateOfBirth,
          gender,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      updateProfile(updatedUser);
      toast.success('Personal Information saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update settings');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !token) return;

    if (!securityData.currentPassword) {
      toast.error('Current password is required');
      return;
    }

    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (securityData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/users/${currentUser.id}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: securityData.currentPassword,
          newPassword: securityData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update password');
      }

      toast.success('Password changed successfully!');
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-up">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarChange}
        accept="image/*"
        className="hidden"
      />

      {/* Main Settings Wrapper matching Screenshot 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Avatar & Sub-Nav (Exact Layout from Screenshot 1 & 2) */}
        <Card className="border border-zinc-200/80 shadow-sm rounded-[32px] bg-white p-6 flex flex-col items-center text-center space-y-6">
          {/* Squircle Avatar with Floating Camera Pencil Overlay in Corner */}
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="h-32 w-32 rounded-[32px] overflow-hidden border-4 border-amber-500/20 bg-zinc-100 shadow-md transition-all group-hover:scale-105 relative">
              <img
                src={avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name || 'User')}`}
                alt={currentUser.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                Click to change
              </div>
            </div>

            {/* Corner Orange Pencil Edit Badge Overlay (Matching Screenshot 1 & 2) */}
            <div
              className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-[#F97316] text-white flex items-center justify-center border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
              title="Click to edit profile photo"
            >
              <Camera className="h-4 w-4" />
            </div>
          </div>

          {/* User Name & Role */}
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-serif text-zinc-900">{firstName} {lastName}</h3>
            <p className="text-xs font-semibold text-zinc-500 capitalize">
              {currentUser.role === 'super_admin' ? 'Super Admin' : currentUser.role === 'admin' ? 'Admin' : 'Donor / Supporter'}
            </p>
          </div>

          {/* Sub Navigation List (Exact Style from Screenshot 1) */}
          <div className="w-full space-y-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('personal')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'personal'
                  ? 'bg-[#FFF2E8] text-[#F97316] shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <User className="h-4 w-4 text-[#F97316]" />
              <span>Personal Information</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'security'
                  ? 'bg-[#FFF2E8] text-[#F97316] shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <Lock className="h-4 w-4 text-zinc-500" />
              <span>Login And Password</span>
            </button>

            <button
              type="button"
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4 text-red-500" />
              <span>Log Out</span>
            </button>
          </div>
        </Card>

        {/* Right Column: Central Element Form (Exact Layout from Screenshot 1 & 2) */}
        <div className="md:col-span-2 space-y-6">
          {activeTab === 'personal' && (
            <Card className="border border-zinc-200/80 shadow-sm rounded-[32px] bg-white p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <h2 className="text-xl font-bold font-serif text-zinc-950">Personal Information</h2>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isUpdating}
                  className="rounded-full bg-[#0F6D4E] hover:bg-[#0c593f] text-white font-bold text-xs px-5 h-9 shadow-md"
                >
                  {isUpdating ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>

              <div className="space-y-6">
                {/* Gender Radio Pill Selector (Matching Screenshot 1) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500">Gender</label>
                  <div className="flex items-center gap-6">
                    <label
                      onClick={() => setGender('Male')}
                      className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-800"
                    >
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        gender === 'Male' ? 'border-[#F97316] bg-white' : 'border-zinc-300'
                      }`}>
                        {gender === 'Male' && <div className="h-2.5 w-2.5 rounded-full bg-[#F97316]" />}
                      </div>
                      <span>Male</span>
                    </label>

                    <label
                      onClick={() => setGender('Female')}
                      className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-800"
                    >
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        gender === 'Female' ? 'border-[#F97316] bg-white' : 'border-zinc-300'
                      }`}>
                        {gender === 'Female' && <div className="h-2.5 w-2.5 rounded-full bg-[#F97316]" />}
                      </div>
                      <span>Female</span>
                    </label>
                  </div>
                </div>

                {/* First Name & Last Name Side by Side (Matching Screenshot 1) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-500">First Name</Label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First Name"
                      className="w-full h-11 px-4 text-xs font-bold rounded-2xl bg-zinc-100/70 border-none text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-500">Last Name</Label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last Name"
                      className="w-full h-11 px-4 text-xs font-bold rounded-2xl bg-zinc-100/70 border-none text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30"
                    />
                  </div>
                </div>

                {/* Email with Verified Badge (Matching Screenshot 1) */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-500">Email</Label>
                  <div className="relative flex items-center">
                    <input
                      type="email"
                      value={email}
                      readOnly
                      className="w-full h-11 pl-4 pr-24 text-xs font-bold rounded-2xl bg-zinc-100/70 border-none text-zinc-900 cursor-not-allowed"
                    />
                    <div className="absolute right-3 flex items-center gap-1 bg-emerald-100/80 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      <span>Verified</span>
                    </div>
                  </div>
                </div>

                {/* Address / Location Soft Input (Matching Screenshot 1) */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-500">Address / Location</Label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. 3605 Parker Rd., Nagpur"
                    className="w-full h-11 px-4 text-xs font-bold rounded-2xl bg-zinc-100/70 border-none text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30"
                  />
                </div>

                {/* Date of Birth */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-500">Date of Birth</Label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full h-11 px-4 text-xs font-bold rounded-2xl bg-zinc-100/70 border-none text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30"
                  />
                </div>

                {/* Contact Phone */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-500">Contact Phone</Label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full h-11 px-4 text-xs font-bold rounded-2xl bg-zinc-100/70 border-none text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30"
                  />
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="border border-zinc-200/80 shadow-sm rounded-[32px] bg-white p-6 sm:p-8 space-y-6">
              <div className="border-b border-zinc-100 pb-4">
                <h2 className="text-xl font-bold font-serif text-zinc-950">Login And Password</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Manage your credentials and security preferences</p>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-500">Current Password</Label>
                  <input
                    type="password"
                    value={securityData.currentPassword}
                    onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full h-11 px-4 text-xs font-bold rounded-2xl bg-zinc-100/70 border-none text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-500">New Password</Label>
                  <input
                    type="password"
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full h-11 px-4 text-xs font-bold rounded-2xl bg-zinc-100/70 border-none text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-500">Confirm New Password</Label>
                  <input
                    type="password"
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full h-11 px-4 text-xs font-bold rounded-2xl bg-zinc-100/70 border-none text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full rounded-full bg-zinc-950 text-white hover:bg-zinc-800 font-bold text-xs py-3 mt-4 shadow-md"
                >
                  {isUpdating ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
