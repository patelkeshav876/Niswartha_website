import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from '../context/UserContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  Settings, 
  LogOut, 
  Heart, 
  Calendar, 
  MapPin, 
  Pencil, 
  ChevronRight, 
  Bell, 
  Shield, 
  HelpCircle,
  Camera,
  Loader2,
  Activity,
  UserCircle,
  Mail,
  Check,
  Sparkles,
  ArrowRight,
  Clock3,
  Users,
  LayoutDashboard
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { ScrollArea } from '../components/ui/scroll-area';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface ProfileStats {
  totalDonations: number;
  donationCount: number;
  livesImpacted: number;
  ashramSupported: number;
  recent: any[];
}

export function Profile() {
  const { currentUser, logout, updateProfile, isAdmin, token } = useUser();
  const navigate = useNavigate();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
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
      updates: true
    }
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [stats, setStats] = useState<ProfileStats>({
    totalDonations: 0,
    donationCount: 0,
    livesImpacted: 0,
    ashramSupported: 0,
    recent: []
  });

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  // Sync state when currentUser changes
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
          updates: true
        }
      });
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!currentUser?.id || !token) return;
      
      setLoading(true);
      setNotificationsLoading(true);

      try {
        // ✅ Correct endpoint: /api/donations?userId=xxx
        const dRes = await fetch(`/api/donations?userId=${encodeURIComponent(currentUser.id)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (dRes.ok) {
          const donations = await dRes.json();
          const safeArr = Array.isArray(donations) ? donations : [];
          const total = safeArr.reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0);
          const uniqueAshrams = new Set(safeArr.map((d: any) => d.ashramId).filter(Boolean)).size;
          setStats({
            totalDonations: total,
            donationCount: safeArr.length,
            livesImpacted: Math.floor(total / 500) + (safeArr.length * 2),
            ashramSupported: uniqueAshrams,
            recent: safeArr.slice(0, 3)
          });
        }
      } catch (error) {
        console.error('Error fetching donations:', error);
      } finally {
        setLoading(false);
      }

      try {
        // ✅ Correct endpoint: /api/notifications (JWT carries the user)
        const nRes = await fetch(`/api/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (nRes.ok) {
          const data = await nRes.json();
          setNotifications(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchProfileData();
  }, [currentUser?.id, token]);

  const handleProfileUpdate = async () => {
    if (!currentUser?.id || !token) {
      toast.error('Session error: Please re-login.');
      return;
    }
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      updateProfile(updatedUser);
      toast.success('Profile updated successfully');
      setIsEditModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/users/${currentUser.id}/change-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: securityData.currentPassword,
          newPassword: securityData.newPassword
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update password');
      }

      toast.success('Password changed successfully');
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for safety
        toast.error('Image size must be under 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData({ ...editData, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  if (!currentUser) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Profile Header */}
      <div className="bg-[#0b110e] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(163,230,53,0.12),transparent_60%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:18px_18px] opacity-20" />

        <div className="relative p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Avatar className="h-16 w-16 border-2 border-white/10 shadow-2xl transition-transform group-hover:scale-105 duration-300">
                  <AvatarImage src={currentUser?.avatarUrl} alt={currentUser?.name} className="object-cover" />
                  <AvatarFallback className="bg-white/5 text-white font-black text-xl">
                    {getInitials(currentUser?.name || '')}
                  </AvatarFallback>
                </Avatar>
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute -bottom-1 -right-1 bg-[#a3e635] text-black p-1.5 rounded-full border-2 border-[#0b110e] shadow-lg hover:scale-110 transition-transform"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] text-[#a3e635] font-black uppercase tracking-[0.2em]">Member Dashboard</p>
                <h1 className="font-black text-2xl tracking-tight leading-none">{currentUser?.name || 'User Name'}</h1>
                <p className="flex items-center gap-1.5 text-xs text-white/50 font-medium pt-1">
                  <MapPin className="h-3.5 w-3.5 text-[#a3e635]/60" />
                  {currentUser?.location || 'Add location'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 h-11 w-11 rounded-2xl bg-white/5 backdrop-blur-sm"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
          
          {currentUser?.bio ? (
            <div className="relative">
              <p className="text-sm text-white/70 font-medium leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10 border-dashed italic">
                "{currentUser.bio}"
              </p>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="text-xs text-[#a3e635]/80 hover:text-[#a3e635] font-bold transition-colors underline underline-offset-4"
            >
              + Add a personal bio
            </button>
          )}

          {!isAdmin && (
            <Card className="bg-gradient-to-br from-[#c6e54d] to-[#8eb31e] text-[#0b110e] border-0 shadow-2xl rounded-[32px] overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4">
                <div className="bg-[#0b110e]/10 backdrop-blur-md rounded-full px-3 py-1 border border-[#0b110e]/10">
                  <span className="text-[10px] font-black tracking-widest uppercase italic">Impact v2</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-[11px] font-black uppercase tracking-widest opacity-60 mb-1">Total Impact Balance</p>
                <div className="flex items-end gap-1.5">
                  <span className="text-2xl font-black mb-1 opacity-80">₹</span>
                  <p className="text-5xl font-black tracking-tighter leading-none">
                    {loading ? '...' : stats.totalDonations.toLocaleString()}
                  </p>
                </div>
                
                <div className="mt-6 pt-5 border-t border-[#0b110e]/10 flex justify-between gap-6">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black opacity-50 uppercase tracking-widest">Lives Impacted</p>
                    <p className="text-lg font-black">{stats.livesImpacted}</p>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <p className="text-[10px] font-black opacity-50 uppercase tracking-widest">Ashrams Funded</p>
                    <p className="text-lg font-black">{stats.ashramSupported}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <div className="section-container py-10 space-y-8">
        {/* Quick Actions Grid */}
        {!isAdmin && (
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-auto py-5 flex-col gap-3 rounded-3xl border-2 border-primary/5 bg-card hover:bg-muted active:scale-95 transition-all outline-none"
              onClick={() => navigate('/donation-history')}
            >
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-rose-500/10 text-rose-500">
                <Heart className="h-6 w-6" />
              </div>
              <span className="font-black text-sm tracking-tight text-foreground">Donations</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-5 flex-col gap-3 rounded-3xl border-2 border-primary/5 bg-card hover:bg-muted active:scale-95 transition-all outline-none"
              onClick={() => navigate('/my-bookings')}
            >
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-blue-500/10 text-blue-500">
                <Calendar className="h-6 w-6" />
              </div>
              <span className="font-black text-sm tracking-tight text-foreground">Bookings</span>
            </Button>
          </div>
        )}

        {/* Feature List */}
        <div className="space-y-2">
          <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 px-2 mb-4">Account & Preferences</h2>
          {[
            { icon: UserCircle, label: 'Profile Details', action: () => setIsEditModalOpen(true) },
            { 
              icon: Bell, 
              label: 'Notification Center', 
              hasBadge: notifications.some(n => !n.read), 
              action: () => setIsNotificationsOpen(true),
              sub: notifications.filter(n => !n.read).length + ' unread alerts'
            },
            { icon: Shield, label: 'Security Settings', action: () => setIsEditModalOpen(true) },
            { icon: HelpCircle, label: 'Help & Support', action: () => navigate('/help') },
            // Specialized Switch for Keshav Patel
            (() => {
              const isKeshav = 
                currentUser?.email?.toLowerCase().trim() === 'keshavpaterl3690@gmail.com' ||
                currentUser?.name?.toLowerCase().trim() === 'keshav patel';
              
              if (!isKeshav) return null;

              return !isAdmin ? {
                icon: Shield,
                label: 'Switch to Admin Mode',
                sub: 'Access administrative features',
                action: () => updateProfile({ role: 'admin' })
              } : {
                icon: UserCircle,
                label: 'Switch to Donor Mode',
                sub: 'Return to donor experience',
                action: () => updateProfile({ role: 'donor' })
              };
            })(),
            ...(isAdmin ? [{ 
              icon: LayoutDashboard, 
              label: 'Admin Panel', 
              sub: 'Manage platform content',
              action: () => navigate('/admin') 
            }] : []),
          ].filter(Boolean).map((item, idx) => {
            const data = item as { icon: any; label: string; sub?: string; hasBadge?: boolean; action: () => void };
            return (
              <Button
                key={idx}
                variant="ghost"
                className="w-full justify-between h-20 rounded-[28px] hover:bg-muted/50 transition-all px-5 group outline-none"
                onClick={data.action}
              >
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-2xl border border-muted-foreground/10 bg-muted/30 flex items-center justify-center transition-transform group-hover:scale-110">
                    <data.icon className="h-5 w-5 text-foreground/80" />
                  </div>
                  <div className="text-left">
                    <span className="font-black text-[15px] block leading-tight">{data.label}</span>
                    {data.sub && <span className="text-[10px] font-bold text-primary tracking-widest uppercase">{data.sub}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {data.hasBadge && (
                    <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(163,230,53,0.8)] animate-pulse" />
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:translate-x-1 transition-transform" />
                </div>
              </Button>
            );
          })}
        </div>

        <Button
          variant="ghost"
          className="w-full h-16 rounded-[28px] text-destructive hover:bg-destructive/5 justify-start px-5 gap-4 group outline-none"
          onClick={logout}
        >
          <div className="h-11 w-11 rounded-2xl bg-destructive/10 flex items-center justify-center transition-transform group-hover:rotate-12 group-active:scale-95">
            <LogOut className="h-5 w-5" />
          </div>
          <span className="font-bold text-sm tracking-tight text-destructive">Sign Out Securely</span>
        </Button>

        <p className="text-center text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest pb-4">
          Niswartha Platform • v2.4.0
        </p>
      </div>

      {/* PREMIUM TABBED EDIT MODAL */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden rounded-[40px] border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)]">
          <Tabs defaultValue="general" className="w-full flex flex-col">
            <div className="bg-[#0b110e] text-white p-8 pb-4 relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Settings className="h-20 w-20" />
              </div>
              <DialogTitle className="text-3xl font-black tracking-tighter mb-4">Settings</DialogTitle>
              <DialogDescription className="hidden">Profile and security settings</DialogDescription>
              <TabsList className="bg-white/5 border border-white/10 rounded-2xl p-1 h-12 w-full max-w-[340px]">
                <TabsTrigger value="general" className="rounded-xl flex-1 font-bold data-[state=active]:bg-white data-[state=active]:text-black transition-all">Common</TabsTrigger>
                <TabsTrigger value="security" className="rounded-xl flex-1 font-bold data-[state=active]:bg-white data-[state=active]:text-black transition-all">Security</TabsTrigger>
                <TabsTrigger value="alerts" className="rounded-xl flex-1 font-bold data-[state=active]:bg-white data-[state=active]:text-black transition-all">Alerts</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="max-h-[70vh]">
              <div className="p-8">
                <TabsContent value="general" className="space-y-8 mt-0 outline-none">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                      <Avatar className="h-28 w-28 border-4 border-muted rounded-[36px] shadow-2xl transition-all group-hover:scale-[1.02]">
                        <AvatarImage src={editData.avatarUrl} className="object-cover" />
                        <AvatarFallback className="text-3xl font-black bg-muted text-muted-foreground">{getInitials(editData.name)}</AvatarFallback>
                      </Avatar>
                      <label className="absolute inset-0 flex items-center justify-center bg-black/60 text-white rounded-[36px] opacity-0 group-hover:opacity-100 cursor-pointer transition-all backdrop-blur-[2px]">
                        <Camera className="h-8 w-8 mb-1" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                      </label>
                    </div>
                    <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em] animate-pulse">Tap Photo to Edit</p>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-black uppercase text-muted-foreground/70 ml-1 tracking-widest pl-1">Identified Name</Label>
                      <Input
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="rounded-2xl h-14 bg-muted/30 border-transparent focus-visible:ring-primary shadow-sm font-bold px-5"
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[11px] font-black uppercase text-muted-foreground/70 ml-1 tracking-widest pl-1">User Bio</Label>
                      <Textarea
                        value={editData.bio}
                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                        placeholder="Tell the community about your mission..."
                        className="rounded-2xl bg-muted/30 border-transparent min-h-[120px] resize-none font-medium p-5 focus-visible:ring-primary"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase text-muted-foreground/70 ml-1 tracking-widest pl-1">Verified Loc</Label>
                        <Input
                          value={editData.location}
                          onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                          placeholder="City, India"
                          className="rounded-2xl h-14 bg-muted/30 border-transparent font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase text-muted-foreground/70 ml-1 tracking-widest pl-1">Contact Phone</Label>
                        <Input
                          value={editData.phone}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                          placeholder="+91..."
                          className="rounded-2xl h-14 bg-muted/30 border-transparent font-bold"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button onClick={handleProfileUpdate} disabled={isUpdating} className="w-full h-16 rounded-3xl font-black text-sm uppercase tracking-widest bg-[#a3e635] text-black shadow-xl hover:shadow-[#a3e635]/20 hover:scale-[1.01] transition-all border-none">
                      {isUpdating ? 'Synchronizing...' : 'Update Records'}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-8 mt-0 outline-none">
                  <div className="bg-primary/5 p-5 rounded-3xl border border-primary/10 mb-2">
                    <p className="text-xs font-bold text-primary leading-snug flex items-start gap-2">
                      <Shield className="h-4 w-4 shrink-0" />
                      Ensure your account uses a long, random password to stay secure.
                    </p>
                  </div>
                  
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-black uppercase text-muted-foreground/60 pl-1">Old Passcode</Label>
                      <Input
                        type="password"
                        value={securityData.currentPassword}
                        onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                        className="rounded-2xl h-14 bg-muted/30 font-bold px-5"
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="relative space-y-2 pt-2">
                      <div className="absolute top-0 right-0 h-px w-full bg-border opacity-30" />
                      <Label className="text-[11px] font-black uppercase text-muted-foreground/60 pl-1">New Secure Key</Label>
                      <Input
                        type="password"
                        value={securityData.newPassword}
                        onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                        className="rounded-2xl h-14 bg-muted/30 font-bold px-5"
                        placeholder="Min 8 characters"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[11px] font-black uppercase text-muted-foreground/60 pl-1">Confirm Secret</Label>
                      <Input
                        type="password"
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                        className="rounded-2xl h-14 bg-muted/30 font-bold px-5"
                        placeholder="Re-type new password"
                      />
                    </div>

                    <Button type="submit" disabled={isUpdating} className="w-full h-16 rounded-3xl font-black uppercase tracking-widest mt-4 bg-foreground text-background shadow-xl">
                      {isUpdating ? 'Validating...' : 'Refresh Passcode'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="alerts" className="space-y-8 mt-0 outline-none">
                  <div className="space-y-5">
                    <h4 className="text-[11px] font-black uppercase text-muted-foreground/50 tracking-[0.3em] pl-1 mb-2">Notification Streams</h4>
                    
                    {[
                      { id: 'email', label: 'Email Stream', desc: 'Campaigns & monthly impact reports', icon: Mail },
                      { id: 'push', label: 'Push Direct', desc: 'Urgent task alerts & booking shifts', icon: Bell },
                      { id: 'updates', label: 'Beta Feedback', desc: 'Development logs and new feature teasers', icon: Activity },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-5 rounded-[28px] bg-muted/30 border border-primary/5 hover:bg-muted/50 transition-colors">
                        <div className="flex gap-4 items-center">
                          <div className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-muted flex items-center justify-center shrink-0">
                            <item.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <Label className="font-black text-[15px]">{item.label}</Label>
                            <p className="text-[10px] text-muted-foreground font-bold tracking-tight">{item.desc}</p>
                          </div>
                        </div>
                        <Switch
                          checked={(editData.notificationPreferences as any)?.[item.id] ?? true}
                          onCheckedChange={(val) => setEditData({
                            ...editData,
                            notificationPreferences: {
                              ...editData.notificationPreferences,
                              [item.id]: val
                            } as any
                          })}
                          className="data-[state=checked]:bg-[#a3e635]"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="p-6 rounded-3xl bg-[#0b110e]/5 border-2 border-dashed border-[#0b110e]/10">
                    <div className="flex gap-4 items-center">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-[11px] font-black text-foreground/40 leading-snug uppercase tracking-tight">Sync preferences across all your active sessions.</p>
                    </div>
                  </div>

                  <Button onClick={() => setIsEditModalOpen(false)} variant="outline" className="w-full h-14 rounded-3xl font-black uppercase text-[10px] tracking-widest border-2">
                    Dismiss Selection
                  </Button>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* NOTIFICATIONS CENTER */}
      <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <DialogContent className="sm:max-w-[440px] h-[85vh] flex flex-col p-0 rounded-[40px] overflow-hidden border-none shadow-3xl">
          <div className="bg-[#0b110e] text-white p-8 space-y-2">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-3xl font-black tracking-tighter">Inbound</DialogTitle>
              <Button variant="ghost" className="text-[10px] text-primary font-black uppercase tracking-widest h-8 px-3 rounded-xl bg-white/5 outline-none hover:bg-white/10">Clear All</Button>
            </div>
            <DialogDescription className="text-white/50 font-medium tracking-tight">Stay updated with community impact</DialogDescription>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-4">
              {notificationsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-24 w-full animate-pulse rounded-3xl bg-muted/60" />
                ))
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-20 w-20 rounded-[32px] bg-muted flex items-center justify-center mb-6">
                    <Check className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                  <p className="font-black text-xl tracking-tight">Quiet channel</p>
                  <p className="text-xs text-muted-foreground font-bold mt-1 tracking-tight">You've responded to all system alerts.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => !notif.read && markAsRead(notif.id)}
                    className={cn(
                      "group p-5 rounded-[32px] border transition-all cursor-pointer relative overflow-hidden",
                      notif.read 
                        ? "bg-muted/10 border-transparent grayscale-[0.5] opacity-60" 
                        : "bg-primary/5 border-primary/20 shadow-[0_4px_12px_rgba(163,230,53,0.06)] ring-1 ring-primary/10"
                    )}
                  >
                    {!notif.read && (
                      <div className="absolute top-0 left-0 h-full w-1.5 bg-[#a3e635]" />
                    )}
                    <div className="flex gap-4">
                      <div className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105",
                        notif.read ? "bg-muted" : "bg-white border border-primary/10"
                      )}>
                        <Bell className={cn("h-5 w-5", notif.read ? "text-muted-foreground/50" : "text-primary")} />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{notif.type || 'Alert'}</p>
                          <p className="text-[10px] font-bold text-muted-foreground/60">{new Date(notif.createdAt).toLocaleDateString()}</p>
                        </div>
                        <p className={cn("text-sm font-black leading-tight tracking-tight", notif.read ? "text-foreground/70" : "text-foreground")}>{notif.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">{notif.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          
          <div className="p-6 border-t bg-muted/20">
            <Button onClick={() => setIsNotificationsOpen(false)} className="w-full h-14 rounded-2xl font-bold bg-foreground text-background outline-none">
              Dismiss Activity Center
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}