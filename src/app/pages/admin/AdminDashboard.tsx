import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Plus,
  Users,
  Gift,
  Calendar,
  Settings as SettingsIcon,
  MessageSquare,
  TrendingUp,
  Heart,
  IndianRupee,
  Clock3,
  ChevronRight,
  BookOpen,
  FileText,
  UserCheck,
} from 'lucide-react';
import { api } from '../../lib/api';
import { mockAshrams, mockNeeds } from '../../data/mock';

export function AdminDashboard() {
  const navigate = useNavigate();
  const ashram = mockAshrams[0];
  const [visitBookings, setVisitBookings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [visits, notifs, kids, plans, money, people] = await Promise.all([
          api.getVisitBookings({ ashramId: ashram.id }),
          api.getNotifications(),
          api.getChildren().catch(() => []),
          api.getSchemes().catch(() => []),
          api.getDonations().catch(() => []),
          api.getTeamMembers().catch(() => []),
        ]);
        setVisitBookings(visits);
        setNotifications(notifs);
        setChildren(kids);
        setSchemes(plans);
        setDonations(money);
        setTeam(people);
      } catch (err) {
        console.error('Error loading admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [ashram.id]);

  // Compute stats
  const totalDonations = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0) || 120000;
  const recentBookings = visitBookings.slice(-3).reverse();
  const activeNeedsCount = mockNeeds.length;
  const childCount = children.length || 24;
  const schemeCount = schemes.length || 5;

  return (
    <div className="space-y-8">
      {/* 2-Column Smartech Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left Column: Dashboard metrics and list cards (3/4 width) */}
        <div className="xl:col-span-3 space-y-8">
          
          {/* Top Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Donations', value: `₹${(totalDonations / 1000).toFixed(0)}k`, desc: 'All time managed', color: 'bg-emerald-50 text-[#0F6D4E]', icon: IndianRupee },
              { label: 'Registered Kids', value: childCount, desc: 'Secure student profiles', color: 'bg-indigo-50 text-indigo-600', icon: UserCheck },
              { label: 'Active Schemes', value: schemeCount, desc: 'Government programs', color: 'bg-amber-50 text-amber-600', icon: FileText },
              { label: 'Pending Bookings', value: visitBookings.filter(b => b.status !== 'cancelled').length, desc: 'Site visit scheduling', color: 'bg-purple-50 text-purple-600', icon: BookOpen },
            ].map((stat, i) => (
              <Card key={i} className="border-none shadow-sm rounded-3xl bg-white overflow-hidden p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{stat.label}</p>
                    <p className="text-xl font-bold text-zinc-900 mt-0.5">{stat.value}</p>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-400 mt-3 font-medium">{stat.desc}</p>
              </Card>
            ))}
          </div>

          {/* Quick Actions Row */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Add New Kid', icon: Plus, link: '/admin/children' },
                { label: 'Add Gov Scheme', icon: Plus, link: '/admin/schemes' },
                { label: 'Create Album', icon: Plus, link: '/admin/gallery' },
                { label: 'Create Event', icon: Plus, link: '/admin/events/create' },
              ].map((act, idx) => (
                <Link key={idx} to={act.link} className="block">
                  <Card className="hover:bg-zinc-50 border border-zinc-200/50 hover:border-zinc-300 transition-all cursor-pointer h-full rounded-2xl">
                    <CardContent className="p-3.5 flex flex-col items-center justify-center gap-2 text-center">
                      <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
                        <act.icon className="h-4.5 w-4.5" />
                      </div>
                      <span className="text-[11px] font-bold text-zinc-700 leading-tight">{act.label}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Linked Teachers & Upcoming Events Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Linked Teachers / Staff Card */}
            <Card className="border-none shadow-sm rounded-3xl bg-white p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b pb-3 mb-4">
                  <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#0F6D4E]" />
                    Linked Roster / Staff
                  </h3>
                  <Link to="/admin/team" className="text-xs font-bold text-[#0F6D4E] hover:underline">
                    Manage
                  </Link>
                </div>
                <div className="space-y-3">
                  {team.slice(0, 3).map((member) => (
                    <div key={member.id} className="flex items-center gap-3 bg-zinc-50 p-2.5 rounded-2xl border border-zinc-100/50">
                      <img src={member.imageUrl || 'https://i.pravatar.cc/150?u=staff'} alt="" className="h-9 w-9 rounded-full object-cover border border-zinc-200" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-zinc-900 truncate">{member.name}</p>
                        <p className="text-[10px] text-[#0F6D4E] font-medium truncate">{member.role}</p>
                      </div>
                      <Badge className="bg-zinc-200/50 text-zinc-700 hover:bg-zinc-200/50 text-[8px] font-bold border-none uppercase py-0.5 px-2">
                        {member.category}
                      </Badge>
                    </div>
                  ))}
                  {team.length === 0 && (
                    <p className="text-xs text-zinc-400 py-4 text-center">No staff roster registered.</p>
                  )}
                </div>
              </div>
              {team.length > 3 && (
                <Button variant="ghost" onClick={() => navigate('/admin/team')} className="w-full text-xs font-bold text-[#0F6D4E] mt-4 border border-zinc-100 rounded-xl hover:bg-zinc-50">
                  See {team.length - 3} more staff members
                </Button>
              )}
            </Card>

            {/* Recent Bookings List Card */}
            <Card className="border-none shadow-sm rounded-3xl bg-white p-5">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#0F6D4E]" />
                  Recent Visit Bookings
                </h3>
                <Link to="/admin/bookings" className="text-xs font-bold text-[#0F6D4E] hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {recentBookings.map((bk) => (
                  <div key={bk.id} className="flex items-start justify-between bg-zinc-50 p-2.5 rounded-2xl border border-zinc-100/50">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-900 truncate">{bk.name}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{bk.orgType || 'Individual'} • {bk.visitorCount || 1} visitors</p>
                      <p className="text-[9px] text-[#0F6D4E] font-bold mt-1 uppercase tracking-wide">
                        {bk.date} • {bk.time || bk.timeSlot}
                      </p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-800 text-[8px] font-bold border-none uppercase py-0.5 px-2">
                      {bk.status || 'Confirmed'}
                    </Badge>
                  </div>
                ))}
                {recentBookings.length === 0 && (
                  <p className="text-xs text-zinc-400 py-4 text-center">No bookings logged yet.</p>
                )}
              </div>
            </Card>

          </div>

        </div>

        {/* Right Column: Smartech-style Metrics & Goals Panel (1/4 width) */}
        <div className="space-y-8">
          <Card className="border-none shadow-sm rounded-3xl bg-white p-6 h-full flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider border-b pb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#0F6D4E]" />
                Analytics & Goals
              </h3>

              {/* Progress Metric 1 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-zinc-700">
                  <span>Pre-matric Scholarship Targets</span>
                  <span className="text-[#0F6D4E]">60%</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0F6D4E] rounded-full" style={{ width: '60%' }} />
                </div>
                <p className="text-[9px] text-zinc-400 font-semibold">12 of 20 eligible children enrolled</p>
              </div>

              {/* Progress Metric 2 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-zinc-700">
                  <span>Visit Booking Success Rate</span>
                  <span className="text-indigo-600">90%</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '90%' }} />
                </div>
                <p className="text-[9px] text-zinc-400 font-semibold">Bypass verification enabled</p>
              </div>

              {/* Progress Metric 3 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-zinc-700">
                  <span>Needs Target Fulfilled</span>
                  <span className="text-amber-600">75%</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '75%' }} />
                </div>
                <p className="text-[9px] text-zinc-400 font-semibold">₹90,000 raised of ₹1.2L total goal</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100 space-y-4">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Platform Info</h4>
              <div className="bg-zinc-50 border rounded-2xl p-3 text-[11px] text-zinc-500 leading-relaxed space-y-2">
                <p><strong>DB Schema:</strong> MongoDB Atlas (Loose Mongoose Models)</p>
                <p><strong>API Endpoint:</strong> Express Server Proxy (Port 4000)</p>
                <p><strong>Client Version:</strong> React 18 / Tailwind v4 Responsive</p>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}