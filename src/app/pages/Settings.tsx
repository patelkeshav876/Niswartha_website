import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { ImageUploadWithCamera } from '../components/ImageUploadWithCamera';
import { useUser } from '../context/UserContext';
import { toast } from 'sonner';
import { Shield, Mail, Bell, Activity } from 'lucide-react';

export function Settings() {
  const { currentUser, token, updateProfile } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);

  const [editData, setEditData] = useState({
    name: currentUser?.name || '',
    bio: currentUser?.bio || '',
    phone: currentUser?.phone || '',
    location: currentUser?.location || '',
    avatarUrl: currentUser?.avatarUrl || '',
    notificationPreferences: currentUser?.notificationPreferences || {
      email: true,
      push: true,
      updates: true,
    },
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (currentUser) {
      setEditData({
        name: currentUser.name || '',
        bio: currentUser.bio || '',
        phone: currentUser.phone || '',
        location: currentUser.location || '',
        avatarUrl: currentUser.avatarUrl || '',
        notificationPreferences: currentUser.notificationPreferences || {
          email: true,
          push: true,
          updates: true,
        },
      });
    }
  }, [currentUser]);

  const handleProfileUpdate = async () => {
    if (!currentUser?.id || !token) {
      toast.error('Session expired. Please log in again.');
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
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      updateProfile(updatedUser);
      toast.success('Profile details saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b pb-4">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-950">Account Settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Customize your personal profile, notification streams, and secure credentials</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: General Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm rounded-3xl bg-white p-6">
            <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider mb-6">Profile Settings</h3>
            
            <div className="space-y-6">
              {/* Profile Avatar editor */}
              <div className="space-y-2 bg-zinc-50 border border-zinc-200/50 p-4 rounded-2xl border-dashed">
                <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wider block mb-1">Avatar / Profile Photo</Label>
                <ImageUploadWithCamera
                  value={editData.avatarUrl}
                  onChange={(base64) => setEditData({ ...editData, avatarUrl: base64 })}
                  aspectRatio="square"
                  maxSizeKB={200}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullname" className="text-zinc-700 font-semibold">Identified Full Name</Label>
                  <Input
                    id="fullname"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    placeholder="Your name"
                    className="rounded-xl border-zinc-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bio" className="text-zinc-700 font-semibold">Personal Bio</Label>
                  <Textarea
                    id="bio"
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    placeholder="Tell the community how you wish to support..."
                    className="rounded-xl border-zinc-200 min-h-[90px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="loc" className="text-zinc-700 font-semibold">Verified Location</Label>
                    <Input
                      id="loc"
                      value={editData.location}
                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                      placeholder="e.g. Shankar Nagar, Nagpur"
                      className="rounded-xl border-zinc-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="tel" className="text-zinc-700 font-semibold">Contact Phone</Label>
                    <Input
                      id="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      placeholder="e.g. +91 9876543210"
                      className="rounded-xl border-zinc-200"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleProfileUpdate}
                disabled={isUpdating}
                className="w-full rounded-full bg-[#0F6D4E] hover:bg-[#0c593f] text-white font-semibold text-xs tracking-wider uppercase py-3 shadow-md"
              >
                {isUpdating ? 'Saving...' : 'Save Profile Details'}
              </Button>
            </div>
          </Card>

          {/* Notifications Switches */}
          <Card className="border-none shadow-sm rounded-3xl bg-white p-6">
            <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider mb-6">Notification Streams</h3>
            
            <div className="space-y-4">
              {[
                { id: 'email', label: 'Email Alerts', desc: 'Campaign updates & monthly impact summaries', icon: Mail },
                { id: 'push', label: 'Push Direct', desc: 'Realtime transaction/booking confirmations', icon: Bell },
                { id: 'updates', label: 'General Updates', desc: 'NGO newsletters and program announcements', icon: Activity },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <div className="flex gap-3 items-center">
                    <div className="h-9 w-9 rounded-xl bg-white border flex items-center justify-center text-[#0F6D4E]">
                      <item.icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <Label className="font-bold text-xs text-zinc-900">{item.label}</Label>
                      <p className="text-[10px] text-zinc-400 font-medium">{item.desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={(editData.notificationPreferences as any)?.[item.id] ?? true}
                    onCheckedChange={(val) =>
                      setEditData({
                        ...editData,
                        notificationPreferences: {
                          ...editData.notificationPreferences,
                          [item.id]: val,
                        } as any,
                      })
                    }
                  />
                </div>
              ))}

              <Button
                onClick={handleProfileUpdate}
                disabled={isUpdating}
                className="w-full rounded-full bg-[#0F6D4E] hover:bg-[#0c593f] text-white font-semibold text-xs tracking-wider uppercase py-3 mt-4"
              >
                {isUpdating ? 'Saving...' : 'Save Notification Preferences'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Side: Security & Credentials */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm rounded-3xl bg-white p-6">
            <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider mb-6">Change Password</h3>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="oldpass" className="text-zinc-700 font-semibold">Current Password</Label>
                <Input
                  id="oldpass"
                  type="password"
                  value={securityData.currentPassword}
                  onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="rounded-xl border-zinc-200"
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t">
                <Label htmlFor="newpass" className="text-zinc-700 font-semibold">New Password</Label>
                <Input
                  id="newpass"
                  type="password"
                  value={securityData.newPassword}
                  onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                  placeholder="At least 6 characters"
                  className="rounded-xl border-zinc-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confpass" className="text-zinc-700 font-semibold">Confirm New Password</Label>
                <Input
                  id="confpass"
                  type="password"
                  value={securityData.confirmPassword}
                  onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                  placeholder="At least 6 characters"
                  className="rounded-xl border-zinc-200"
                />
              </div>

              <Button
                type="submit"
                disabled={isUpdating}
                className="w-full rounded-full bg-zinc-950 text-white hover:bg-zinc-800 font-semibold text-xs tracking-wider uppercase py-3 mt-4"
              >
                {isUpdating ? 'Validating...' : 'Refresh Password'}
              </Button>
            </form>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl bg-amber-50 border-amber-100 p-5">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Session Security</h4>
                <p className="text-[10px] text-amber-700 leading-relaxed mt-1">
                  Keep your password unique and long. Change your password immediately if you suspect any unauthorized access to your account.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
