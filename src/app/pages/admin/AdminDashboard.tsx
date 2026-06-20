import { Link } from 'react-router';
import { Card, CardContent } from '../../components/ui/card';
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
  Home,
  Heart,
  IndianRupee,
  Activity,
  Clock3,
} from 'lucide-react';
import { mockNeeds, mockAshrams } from '../../data/mock';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export function AdminDashboard() {
  const ashram = mockAshrams[0]; 
  const [visitBookings, setVisitBookings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [visits, notifs] = await Promise.all([
          api.getVisitBookings({ ashramId: ashram.id }),
          api.getNotifications()
        ]);
        setVisitBookings(visits);
        setNotifications(notifs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [ashram.id]);

  const stats = [
    { label: 'Total Donations', value: '₹1.2L', icon: IndianRupee, color: 'bg-green-100 text-green-600' },
    { label: 'This Month', value: '₹12.5k', icon: TrendingUp, color: 'bg-blue-100 text-blue-600' },
    { label: 'Active Needs', value: '8', icon: Gift, color: 'bg-orange-100 text-orange-600' },
    { label: 'Total Donors', value: '142', icon: Users, color: 'bg-purple-100 text-purple-600' },
  ];

  const quickActions = [
    { label: 'Manage Needs', icon: Gift, color: 'bg-blue-100 text-blue-600', link: '/admin/needs' },
    { label: 'Events', icon: Calendar, color: 'bg-purple-100 text-purple-600', link: '/admin/events' },
    { label: 'Feed Posts', icon: MessageSquare, color: 'bg-green-100 text-green-600', link: '/admin/feed' },
    { label: 'Profile', icon: Home, color: 'bg-orange-100 text-orange-600', link: '/profile' },
  ];

  const activities = [
    ...visitBookings.map(v => ({
      type: 'visit',
      icon: Users,
      title: 'New Visit Booking',
      description: `${v.name} for ${v.date}`,
      time: new Date(v.createdAt).toLocaleTimeString(),
      color: 'bg-orange-500/10 text-orange-600',
    })),
    ...notifications.filter(n => n.type === 'admin_visit').map(n => ({
      type: 'notification',
      icon: MessageSquare,
      title: n.title,
      description: n.message,
      time: new Date(n.createdAt).toLocaleTimeString(),
      color: 'bg-blue-500/10 text-blue-600',
    }))
  ].slice(0, 5);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="bg-[#0d130f] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(163,230,53,0.14),transparent_55%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.1),transparent_45%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:22px_22px] opacity-25" />

        <div className="section-container relative py-8 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-serif font-bold">Admin Dashboard</h1>
              <p className="text-sm text-white/80">{ashram.name}</p>
            </div>
            <Link to="/admin/settings">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-white">
                <SettingsIcon className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Premium admin balance card */}
          <Card className="bg-[#c5e54d] text-zinc-900 border-0 shadow-2xl rounded-3xl">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium opacity-80">Total Donations Managed</p>
                <Badge className="bg-zinc-900 text-white border-0">LIVE</Badge>
              </div>
              <div className="mt-1 flex items-end gap-1">
                <IndianRupee className="h-6 w-6" />
                <p className="text-4xl font-bold tracking-tight">{stats[0].value.replace('₹', '')}</p>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs opacity-80">
                <Clock3 className="h-3.5 w-3.5" />
                <span>Updated just now</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Link to="/admin/needs">
                  <button type="button" className="w-full bg-zinc-900 text-white rounded-xl py-2 text-[11px] font-medium">Needs</button>
                </Link>
                <Link to="/admin/events">
                  <button type="button" className="w-full bg-zinc-900 text-white rounded-xl py-2 text-[11px] font-medium">Events</button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="section-container py-8 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span className="text-xs">Active Needs</span>
            </div>
            <p className="text-2xl font-bold">{mockNeeds.length}</p>
          </Card>
          <Card className="p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-xs">Total Donors</span>
            </div>
            <p className="text-2xl font-bold">{stats[3].value}</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Quick Actions</h2>
          <Badge className="bg-primary/10 text-primary border-primary/20">Super Admin</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, idx) => (
            <Link key={idx} to={action.link}>
              <Card className="hover:bg-muted/50 active:scale-95 transition-all cursor-pointer h-full">
                <CardContent className="p-3 flex flex-col items-center gap-2">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${action.color}`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-medium text-center">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="p-4 rounded-2xl">
          <h2 className="text-sm font-semibold mb-3">Recent Admin Activity</h2>
          <div className="space-y-2">
            {activities.length === 0 && !loading && (
              <p className="text-xs text-muted-foreground text-center py-4">No recent activity</p>
            )}
            {activities.map((activity, idx) => (
              <div key={idx} className="rounded-xl bg-muted/50 px-3 py-2 flex items-start gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${activity.color}`}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium">{activity.title}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{activity.description}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Create */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/admin/needs/create">
            <Button className="w-full h-12 gap-2" variant="default">
              <Plus className="h-4 w-4" />
              Add Need
            </Button>
          </Link>
          <Link to="/admin/events/create">
            <Button className="w-full h-12 gap-2" variant="outline">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}