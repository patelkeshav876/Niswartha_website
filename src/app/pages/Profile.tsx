import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from '../context/UserContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  Building2,
  ExternalLink,
  Settings,
  Heart,
  Users,
  Award,
} from 'lucide-react';
import { api } from '../lib/api';
import { mockAshrams } from '../data/mock';
import type { ItemDonation } from '../types';

export function Profile() {
  const { currentUser } = useUser();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'itemDonations' | 'visitBookings' | 'details'>('itemDonations');
  const [itemDonations, setItemDonations] = useState<ItemDonation[]>([]);
  const [visitBookings, setVisitBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const [items, visits] = await Promise.all([
          api.getItemDonations({ userId: currentUser.id }),
          api.getVisitBookings({ userId: currentUser.id }),
        ]);

        setItemDonations(Array.isArray(items) ? items : []);
        setVisitBookings(Array.isArray(visits) ? visits : []);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="section-container max-w-xl mx-auto pt-32 pb-16 text-center space-y-4">
        <h2 className="text-xl font-bold font-serif text-zinc-900">Please Sign In</h2>
        <p className="text-sm text-zinc-600">You must be logged in to view your profile and donation receipts.</p>
        <Button onClick={() => navigate('/login')} className="bg-[#1E3A8A] hover:bg-[#0c593f] text-white font-bold rounded-full px-6">
          Sign In
        </Button>
      </div>
    );
  }

  const verifiedDonationsCount = itemDonations.filter((d) => d.status === 'received' || d.status === 'verified').length;

  const getItemStatusBadge = (status: ItemDonation['status']) => {
    switch (status) {
      case 'verified':
      case 'received':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold gap-1 px-2.5 py-0.5">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Acknowledged & Received ✓
          </Badge>
        );
      case 'in_transit':
        return (
          <Badge className="bg-blue-100 text-blue-800 border border-blue-300 text-[10px] font-bold gap-1 px-2.5 py-0.5">
            <Truck className="h-3 w-3 text-blue-600" /> In Transit
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold gap-1 px-2.5 py-0.5">
            <Clock className="h-3 w-3 text-amber-600" /> Pending Verification
          </Badge>
        );
    }
  };

  return (
    <div className="section-container max-w-5xl mx-auto pt-24 lg:pt-28 pb-12 space-y-8 animate-fade-up">
      {/* User Header Profile Card */}
      <Card className="border border-emerald-800/20 bg-gradient-to-br from-[#1E3A8A] to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Heart className="h-48 w-48 text-white" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* User Avatar */}
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-emerald-300/40 flex items-center justify-center text-3xl font-serif font-bold text-white shadow-lg overflow-hidden shrink-0">
            {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-full w-full object-cover" />
            ) : (
              currentUser.name?.charAt(0)?.toUpperCase() || 'U'
            )}
          </div>

          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">{currentUser.name}</h1>
              <Badge className="bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-[10px] font-mono tracking-wider px-2.5 py-0.5 font-bold uppercase">
                {currentUser.role === 'super_admin' ? 'Super Admin' : currentUser.role === 'admin' ? 'Ashram Admin' : 'Supporter'}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-emerald-100/90 font-medium">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-emerald-300" /> {currentUser.email}
              </span>
              {currentUser.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-emerald-300" /> {currentUser.phone}
                </span>
              )}
              {currentUser.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-300" /> {currentUser.location}
                </span>
              )}
            </div>

            {currentUser.bio && (
              <p className="text-xs text-emerald-100/80 italic max-w-xl pt-1 leading-relaxed">
                "{currentUser.bio}"
              </p>
            )}
          </div>

          <Button
            onClick={() => navigate('/settings')}
            variant="outline"
            size="sm"
            className="rounded-full bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold gap-1.5 shrink-0"
          >
            <Settings className="h-3.5 w-3.5" /> Account Settings
          </Button>
        </div>
      </Card>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-zinc-200/80 shadow-xs rounded-2xl bg-white p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-[#1E3A8A] flex items-center justify-center shrink-0">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Sent Item Shipments</p>
            <p className="text-xl font-bold text-zinc-900 mt-0.5">{itemDonations.length}</p>
          </div>
        </Card>

        <Card className="border border-zinc-200/80 shadow-xs rounded-2xl bg-white p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Verified Proof Receipts</p>
            <p className="text-xl font-bold text-zinc-900 mt-0.5">{verifiedDonationsCount}</p>
          </div>
        </Card>

        <Card className="border border-zinc-200/80 shadow-xs rounded-2xl bg-white p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Ashram Visit Bookings</p>
            <p className="text-xl font-bold text-zinc-900 mt-0.5">{visitBookings.length}</p>
          </div>
        </Card>
      </div>

      {/* Content Navigation Tabs */}
      <div className="flex border-b border-zinc-200 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('itemDonations')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'itemDonations'
              ? 'border-[#1E3A8A] text-[#1E3A8A]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Package className="h-4 w-4" /> My Item Donations & Proof Receipts ({itemDonations.length})
        </button>

        <button
          onClick={() => setActiveTab('visitBookings')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'visitBookings'
              ? 'border-[#1E3A8A] text-[#1E3A8A]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Calendar className="h-4 w-4" /> My Visit Bookings ({visitBookings.length})
        </button>

        <button
          onClick={() => setActiveTab('details')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'details'
              ? 'border-[#1E3A8A] text-[#1E3A8A]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <User className="h-4 w-4" /> Account Information
        </button>
      </div>

      {/* Tab 1: Item Donations & Proof Receipts */}
      {activeTab === 'itemDonations' && (
        <div className="space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div>
              <h3 className="text-base font-serif font-bold text-zinc-900">Sent Item Shipment History</h3>
              <p className="text-xs text-zinc-500">Track shipment status and view official acknowledgment proof from ashram administrators.</p>
            </div>
            <Button
              onClick={() => navigate('/needs')}
              size="sm"
              className="bg-[#1E3A8A] hover:bg-[#0c593f] text-white font-bold text-xs rounded-full px-5"
            >
              + Send More Items
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div key={n} className="h-24 rounded-2xl bg-zinc-100 animate-pulse" />
              ))}
            </div>
          ) : itemDonations.length === 0 ? (
            <Card className="border border-dashed border-zinc-300 rounded-2xl p-8 text-center space-y-3 bg-zinc-50/50">
              <Package className="h-10 w-10 text-zinc-400 mx-auto" />
              <p className="text-sm font-bold text-zinc-700">No Item Shipments Found</p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                You haven't submitted any physical item donation details yet. Select an urgent need to contribute directly.
              </p>
              <Button
                onClick={() => navigate('/needs')}
                className="bg-[#1E3A8A] hover:bg-[#0c593f] text-white text-xs font-bold rounded-full px-6"
              >
                Browse Ashram Needs
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {itemDonations.map((item) => {
                const ashram = mockAshrams.find((a) => a.id === item.ashramId);
                return (
                  <Card key={item.id} className="border border-zinc-200/80 rounded-2xl bg-white p-5 shadow-xs hover:border-emerald-300 transition-all space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-zinc-900 text-base">{item.needTitle || 'Physical Item Support'}</h4>
                          {getItemStatusBadge(item.status)}
                        </div>
                        <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-1">
                          <Building2 className="h-3.5 w-3.5 text-[#1E3A8A]" />
                          {ashram?.name || 'Niswartha Ashram Partner'} • Ref: <span className="font-mono text-zinc-700 font-bold">{item.referenceNumber || item.id}</span>
                        </p>
                      </div>

                      <div className="text-right text-xs">
                        <span className="text-zinc-400">Date:</span>{' '}
                        <span className="font-bold text-zinc-700">
                          {new Date(item.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-50/80 p-3.5 rounded-xl text-xs">
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase">Quantity Sent</p>
                        <p className="font-bold text-zinc-900 mt-0.5">{item.quantity} Units</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase">Expected Delivery</p>
                        <p className="font-bold text-zinc-900 mt-0.5">{item.expectedDeliveryDate || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase">Courier / Transport</p>
                        <p className="font-bold text-zinc-900 mt-0.5">{item.courierName || 'Hand Delivered / Direct'}</p>
                      </div>
                    </div>

                    {/* Official Acknowledgment & Proof Box if received/verified */}
                    {(item.status === 'received' || item.status === 'verified') && (
                      <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3.5 space-y-1.5">
                        <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                          <ShieldCheck className="h-4 w-4 text-emerald-600" />
                          Official Acknowledgment Proof & Receipt
                        </div>
                        <p className="text-xs text-emerald-800">
                          {item.adminNotes || 'The ashram team has verified and physically received your donated items. Thank you for your support!'}
                        </p>
                        {item.acknowledgedAt && (
                          <p className="text-[10px] font-mono text-emerald-700 font-bold pt-1">
                            Verified on: {new Date(item.acknowledgedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Visit Bookings */}
      {activeTab === 'visitBookings' && (
        <div className="space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div>
              <h3 className="text-base font-serif font-bold text-zinc-900">Booked Ashram Visits</h3>
              <p className="text-xs text-zinc-500">Your scheduled visits to spend time with ashram children and staff.</p>
            </div>
            <Button
              onClick={() => navigate('/visit-booking')}
              size="sm"
              className="bg-[#1E3A8A] hover:bg-[#0c593f] text-white font-bold text-xs rounded-full px-5"
            >
              + Schedule New Visit
            </Button>
          </div>

          {visitBookings.length === 0 ? (
            <Card className="border border-dashed border-zinc-300 rounded-2xl p-8 text-center space-y-3 bg-zinc-50/50">
              <Calendar className="h-10 w-10 text-zinc-400 mx-auto" />
              <p className="text-sm font-bold text-zinc-700">No Scheduled Visits</p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                You don't have any upcoming or past ashram visit bookings recorded.
              </p>
              <Button
                onClick={() => navigate('/visit-booking')}
                className="bg-[#1E3A8A] hover:bg-[#0c593f] text-white text-xs font-bold rounded-full px-6"
              >
                Book an Ashram Visit
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {visitBookings.map((visit) => {
                const ashram = mockAshrams.find((a) => a.id === visit.ashramId);
                return (
                  <Card key={visit.id} className="border border-zinc-200/80 rounded-2xl bg-white p-5 shadow-xs space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                      <div>
                        <h4 className="font-serif font-bold text-zinc-900 text-base">{ashram?.name || 'Niswartha Ashram Visit'}</h4>
                        <p className="text-xs text-zinc-500">{visit.purpose || 'General Visit & Greeting'}</p>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold text-xs">
                        Confirmed
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 p-3 rounded-xl text-xs">
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase">Visit Date</p>
                        <p className="font-bold text-zinc-800 mt-0.5">{visit.visitDate || visit.date || 'Scheduled'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase">Time Slot</p>
                        <p className="font-bold text-zinc-800 mt-0.5">{visit.timeSlot || '10:00 AM'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase">Visitors</p>
                        <p className="font-bold text-zinc-800 mt-0.5">{visit.visitorCount || 1} People</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase">Primary Contact</p>
                        <p className="font-bold text-zinc-800 mt-0.5">{visit.primaryPhone || currentUser.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Details & Settings */}
      {activeTab === 'details' && (
        <Card className="border border-zinc-200/80 rounded-2xl bg-white p-6 space-y-6">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-serif font-bold text-base text-zinc-900">Personal Details</h3>
            <Button
              onClick={() => navigate('/settings')}
              size="sm"
              variant="outline"
              className="rounded-full text-xs font-bold border-zinc-300"
            >
              Edit Account Info
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-xs font-bold uppercase text-zinc-400">Full Name</p>
              <p className="font-bold text-zinc-900 mt-1">{currentUser.name}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-zinc-400">Email Address</p>
              <p className="font-bold text-zinc-900 mt-1">{currentUser.email}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-zinc-400">Mobile Phone</p>
              <p className="font-bold text-zinc-900 mt-1">{currentUser.phone || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-zinc-400">Location / City</p>
              <p className="font-bold text-zinc-900 mt-1">{currentUser.location || 'Not specified'}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}