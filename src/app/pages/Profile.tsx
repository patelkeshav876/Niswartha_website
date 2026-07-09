import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from '../context/UserContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Heart, Activity, CheckCircle2, Clock, XCircle, IndianRupee } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { mockAshrams } from '../data/mock';
import { api } from '../lib/api';

export function Profile() {
  const { currentUser, token } = useUser();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalDonations: 0,
    donationCount: 0,
    livesImpacted: 0,
    ashramSupported: 0,
    recent: [] as any[],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!currentUser?.id || !token) return;
      setLoading(true);
      try {
        const donations = await api.getDonations(currentUser.id);
        const safeArr = Array.isArray(donations) ? donations : [];
        const total = safeArr.reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0);
        const uniqueAshrams = new Set(safeArr.map((d: any) => d.ashramId).filter(Boolean)).size;

        setStats({
          totalDonations: total,
          donationCount: safeArr.length,
          livesImpacted: Math.floor(total / 500) + safeArr.length * 2,
          ashramSupported: uniqueAshrams,
          recent: safeArr.slice(0, 5), // Show up to 5 recent donations
        });
      } catch (error) {
        console.error('Error fetching donations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [currentUser?.id, token]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="border-0 bg-emerald-100 text-emerald-800 text-[9px] font-bold">Completed</Badge>;
      case 'pending':
        return <Badge className="border-0 bg-amber-100 text-amber-800 text-[9px] font-bold">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="text-[9px] font-bold">Failed</Badge>;
      default:
        return null;
    }
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-8">
      {/* 2-Column Dashboard Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Left Column: Impact Metrics & Recent Donations (3/4 width) */}
        <div className="xl:col-span-3 space-y-8">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: 'Total Impact Donated',
                value: `₹${stats.totalDonations.toLocaleString()}`,
                desc: 'All-time donations',
                color: 'bg-emerald-50 text-[#0F6D4E]',
                icon: IndianRupee,
              },
              {
                label: 'Lives Supported',
                value: stats.livesImpacted,
                desc: 'Estimated educational/food reach',
                color: 'bg-indigo-50 text-indigo-600',
                icon: Heart,
              },
              {
                label: 'Ashrams Funded',
                value: stats.ashramSupported,
                desc: 'Different Ashram modules supported',
                color: 'bg-amber-50 text-amber-600',
                icon: Activity,
              },
            ].map((stat, i) => (
              <Card key={i} className="border-none shadow-sm rounded-3xl bg-white overflow-hidden p-5">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{stat.label}</p>
                    <p className="text-2xl font-bold text-zinc-950 mt-0.5">{stat.value}</p>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-400 mt-4 font-medium">{stat.desc}</p>
              </Card>
            ))}
          </div>

          {/* Recent Donations List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-md font-bold text-zinc-950 font-serif">Recent Donation Activities</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Your most recent contributions to Ashrams</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/donation-history')}
                className="rounded-full border-zinc-200 text-xs font-bold"
              >
                View Full Log
              </Button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((n) => (
                  <div key={n} className="h-16 rounded-2xl bg-zinc-100 animate-pulse" />
                ))}
              </div>
            ) : stats.recent.length === 0 ? (
              <Card className="border-none shadow-sm rounded-3xl bg-white p-8 text-center text-zinc-500">
                <p className="text-sm">No donations logged yet.</p>
                <Button
                  size="sm"
                  onClick={() => navigate('/needs')}
                  className="mt-4 rounded-full bg-[#0F6D4E] hover:bg-[#0c593f] text-white font-bold"
                >
                  Explore Needs
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {stats.recent.map((donation) => {
                  const ashram = mockAshrams.find((a) => a.id === donation.ashramId);
                  return (
                    <Card key={donation.id} className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-[#0F6D4E]`}>
                            <Heart className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-zinc-900 truncate text-sm">
                              {ashram?.name || 'General Donation'}
                            </h4>
                            <p className="text-[10px] text-zinc-400 mt-0.5">
                              {new Date(donation.date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <p className="text-sm font-bold text-zinc-950">₹{donation.amount.toLocaleString()}</p>
                            <div className="mt-0.5">{getStatusBadge(donation.status)}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Mini Bio card / Support goals (1/4 width) */}
        <div className="space-y-8">
          <Card className="border-none shadow-sm rounded-3xl bg-white p-6 h-full flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider border-b pb-3">
                Profile Information
              </h3>
              
              <div className="space-y-1">
                <p className="text-[10px] uppercase text-zinc-400 font-bold tracking-wider">Identified Name</p>
                <p className="text-sm font-semibold text-zinc-800">{currentUser.name}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] uppercase text-zinc-400 font-bold tracking-wider">Email Address</p>
                <p className="text-sm font-semibold text-zinc-800 truncate">{currentUser.email}</p>
              </div>

              {currentUser.phone && (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase text-zinc-400 font-bold tracking-wider">Contact Number</p>
                  <p className="text-sm font-semibold text-zinc-800">{currentUser.phone}</p>
                </div>
              )}

              {currentUser.location && (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase text-zinc-400 font-bold tracking-wider">Verified Location</p>
                  <p className="text-sm font-semibold text-zinc-800">{currentUser.location}</p>
                </div>
              )}

              {currentUser.bio && (
                <div className="space-y-1 pt-2">
                  <p className="text-[10px] uppercase text-zinc-400 font-bold tracking-wider">Personal Bio</p>
                  <p className="text-xs text-zinc-500 italic leading-relaxed">"{currentUser.bio}"</p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100">
              <Button
                variant="outline"
                className="w-full rounded-2xl text-xs font-bold border-zinc-200 hover:bg-zinc-50"
                onClick={() => navigate('/settings')}
              >
                Edit Profile Info
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}