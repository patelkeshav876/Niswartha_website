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
  Share2,
} from 'lucide-react';
import { api } from '../lib/api';
import { mockAshrams } from '../data/mock';
import type { ItemDonation } from '../types';
import { toast } from 'sonner';

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
    <div className="section-container max-w-5xl mx-auto pt-4 sm:pt-6 pb-12 space-y-8 animate-fade-up">
      {/* User Profile Card (Matching User's Reference Design) */}
      <div className="bg-white border border-zinc-200/80 rounded-[32px] shadow-lg overflow-hidden transition-all">
        {/* Cover Photo Header with Soft Natural Landscape Overlay */}
        <div className="relative h-44 sm:h-56 w-full overflow-hidden bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-900">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
            alt="Profile Banner Cover"
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Floating Top-Right Share Button */}
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: `${currentUser.name}'s Profile`, url: window.location.href }).catch(() => { });
              } else {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Profile link copied to clipboard!');
              }
            }}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 border border-white/30 text-white flex items-center justify-center transition-all shadow-sm z-10"
            title="Share Profile"
          >
            <Share2 className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Card Body Section */}
        <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 relative">
          {/* Overlapping Avatar Profile Picture */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-100 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 sm:-mt-16">
              <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4 border-white shadow-md bg-zinc-100 overflow-hidden shrink-0 relative z-10 flex items-center justify-center font-serif text-3xl font-bold text-zinc-700">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-full w-full object-cover" />
                ) : (
                  currentUser.name?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>

              <div className="space-y-1 sm:mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{currentUser.name}</h1>
                  <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                    {currentUser.role === 'super_admin' ? 'Super Admin' : currentUser.role === 'admin' ? 'Ashram Admin' : 'Supporter'}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-500 font-medium">
                  {currentUser.bio || 'Niswartha Donor & Community Supporter'}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500 pt-0.5">
                  <span className="flex items-center gap-1"><Mail className="h-3 w-3 text-zinc-400" /> {currentUser.email}</span>
                  {currentUser.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-zinc-400" /> {currentUser.phone}</span>}
                  {currentUser.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-zinc-400" /> {currentUser.location}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: 3 Metrics Columns Divided by Vertical Lines + Rounded Pill Action Button */}
          <div className="pt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
            {/* Stat Metrics Divided by Vertical Lines */}
            <div className="flex items-center gap-4 sm:gap-8 text-left">
              {/* Stat 1 */}
              <div>
                <div className="flex items-center gap-1.5 text-zinc-900 font-bold text-sm sm:text-base">
                  <Package className="h-4 w-4 text-primary" />
                  <span>{itemDonations.length}</span>
                </div>
                <p className="text-[10px] sm:text-xs text-zinc-400 font-medium mt-0.5">Item Shipments</p>
              </div>

              {/* Vertical Divider */}
              <div className="h-8 w-px bg-zinc-200" />

              {/* Stat 2 */}
              <div>
                <div className="flex items-center gap-1.5 text-zinc-900 font-bold text-sm sm:text-base">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>{verifiedDonationsCount}</span>
                </div>
                <p className="text-[10px] sm:text-xs text-zinc-400 font-medium mt-0.5">Verified Receipts</p>
              </div>

              {/* Vertical Divider */}
              <div className="h-8 w-px bg-zinc-200" />

              {/* Stat 3 */}
              <div>
                <div className="flex items-center gap-1.5 text-zinc-900 font-bold text-sm sm:text-base">
                  <Users className="h-4 w-4 text-amber-600" />
                  <span>{visitBookings.length}</span>
                </div>
                <p className="text-[10px] sm:text-xs text-zinc-400 font-medium mt-0.5">Visit Bookings</p>
              </div>
            </div>

            {/* Prominent Action Pill Button (Matching "Get in touch" style from screenshot) */}
            <Button
              onClick={() => navigate('/settings')}
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm rounded-full px-7 py-3 shadow-md transition-all shrink-0 self-start sm:self-auto gap-2"
            >
              <Settings className="h-4 w-4" /> Account Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Content Navigation Tabs */}
      <div className="flex border-b border-zinc-200 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('itemDonations')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${activeTab === 'itemDonations'
            ? 'border-[#1E3A8A] text-[#1E3A8A]'
            : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
        >
          <Package className="h-4 w-4" /> My Item Donations and Proof Receipts ({itemDonations.length})
        </button>

        <button
          onClick={() => setActiveTab('visitBookings')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${activeTab === 'visitBookings'
            ? 'border-[#1E3A8A] text-[#1E3A8A]'
            : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
        >
          <Calendar className="h-4 w-4" /> My Visit Bookings ({visitBookings.length})
        </button>

        <button
          onClick={() => setActiveTab('details')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${activeTab === 'details'
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
                      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-1.5">
                        <div className="flex items-center gap-2 text-zinc-950 font-bold text-xs">
                          <ShieldCheck className="h-4 w-4 text-[#1E3A8A]" />
                          Official Acknowledgment Proof & Receipt
                        </div>
                        <p className="text-xs text-zinc-700">
                          {item.adminNotes || 'The ashram team has verified and physically received your donated items. Thank you for your support!'}
                        </p>
                        {item.acknowledgedAt && (
                          <p className="text-[10px] font-mono text-zinc-500 font-bold pt-1">
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
              onClick={() => navigate('/visit-book/ashram-1')}
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
                onClick={() => navigate('/visit-book/ashram-1')}
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