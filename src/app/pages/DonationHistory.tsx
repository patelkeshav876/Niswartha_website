import { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Download, CheckCircle2, Clock, XCircle, IndianRupee, Activity, Calendar, Package, Truck, ShieldCheck, Check } from 'lucide-react';
import { mockAshrams } from '../data/mock';
import { useUser } from '../context/UserContext';
import { api } from '../lib/api';
import type { Donation, ItemDonation } from '../types';

export function DonationHistory() {
  const { currentUser } = useUser();
  const [activeTab, setActiveTab] = useState<'money' | 'items'>('money');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [itemDonations, setItemDonations] = useState<ItemDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    let alive = true;

    const loadData = async () => {
      try {
        const [mDonations, iDonations] = await Promise.all([
          api.getDonations(currentUser.id),
          api.getItemDonations({ userId: currentUser.id }),
        ]);
        if (!alive) return;
        setDonations(mDonations || []);
        setItemDonations(iDonations || []);
      } catch (err) {
        console.error(err);
        if (!alive) return;
        setDonations([]);
        setItemDonations([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadData();
    return () => {
      alive = false;
    };
  }, [currentUser]);

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
  const ashramCount = useMemo(
    () => new Set([...donations.map((d) => d.ashramId), ...itemDonations.map((i) => i.ashramId)]).size,
    [donations, itemDonations]
  );

  const filteredDonations = donations.filter((d) => {
    const ashramName = mockAshrams.find((a) => a.id === d.ashramId)?.name || 'Niswartha Ashram';
    const matchesSearch =
      ashramName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(d.amount).includes(searchTerm);
    const matchesFilter =
      statusFilter === 'all' ||
      (statusFilter === 'completed' && d.status === 'completed') ||
      (statusFilter === 'pending' && (d.status === 'pending' || !d.status));

    return matchesSearch && matchesFilter;
  });

  const filteredItems = itemDonations.filter((item) => {
    const ashramName = item.ashramName || mockAshrams.find((a) => a.id === item.ashramId)?.name || 'Ashram';
    const title = item.needTitle || 'Item';
    const matchesSearch =
      ashramName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.reference || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      statusFilter === 'all' ||
      (statusFilter === 'completed' && (item.status === 'received' || item.status === 'verified')) ||
      (statusFilter === 'pending' && (item.status === 'pending' || item.status === 'in_transit'));

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      {/* Header section */}
      <div className="border-b border-zinc-200/80 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-950">Donation History & Verified Proof</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Summary of your monetary support and physical item shipments</p>
        </div>

        {donations.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-zinc-200 text-xs font-bold gap-1.5 self-start sm:self-auto"
          >
            <Download className="h-3.5 w-3.5" />
            Export Receipts
          </Button>
        )}
      </div>

      {/* Summary grid tiles */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Total Donated', value: `₹${totalDonated.toLocaleString()}`, color: 'text-emerald-700 bg-emerald-50 border-emerald-100', icon: IndianRupee },
          { label: 'Items Shipped', value: itemDonations.length, color: 'text-violet-700 bg-violet-50 border-violet-100', icon: Package },
          { label: 'Ashrams Funded', value: ashramCount, color: 'text-amber-700 bg-amber-50 border-amber-100', icon: Calendar },
        ].map((stat, i) => (
          <Card key={i} className="border border-zinc-200/80 shadow-xs rounded-2xl bg-white p-3.5 sm:p-4 text-center">
            <stat.icon className={`mx-auto mb-1.5 h-5 w-5 ${stat.color.split(' ')[0]}`} />
            <p className="text-xl sm:text-2xl font-bold text-zinc-950 font-mono">{stat.value}</p>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Main Tab Switcher: Money vs Sent Items */}
      <div className="flex border-b border-zinc-200">
        <button
          onClick={() => setActiveTab('money')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
            activeTab === 'money'
              ? 'border-[#0F6D4E] text-[#0F6D4E]'
              : 'border-transparent text-muted-foreground hover:text-zinc-800'
          }`}
        >
          <IndianRupee className="h-4 w-4" /> Monetary Contributions ({donations.length})
        </button>
        <button
          onClick={() => setActiveTab('items')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
            activeTab === 'items'
              ? 'border-[#0F6D4E] text-[#0F6D4E]'
              : 'border-transparent text-muted-foreground hover:text-zinc-800'
          }`}
        >
          <Truck className="h-4 w-4" /> Sent Item Donations ({itemDonations.length})
        </button>
      </div>

      {/* Search & Filter pills */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder={activeTab === 'money' ? "Search by ashram or amount..." : "Search by item, ashram or reference code..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-xs rounded-full border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F6D4E]/30"
          />
          <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'completed', label: activeTab === 'money' ? 'Completed' : 'Received & Verified' },
              { id: 'pending', label: 'Pending' },
            ] as const
          ).map((tab) => (
            <Button
              key={tab.id}
              type="button"
              size="sm"
              variant={statusFilter === tab.id ? 'default' : 'outline'}
              onClick={() => setStatusFilter(tab.id)}
              className={`rounded-full h-8 text-xs font-bold px-3.5 ${
                statusFilter === tab.id ? 'bg-[#0F6D4E] hover:bg-[#0c593f] text-white' : 'border-zinc-200 text-zinc-700'
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Tab 1: Monetary Donations */}
      {activeTab === 'money' && (
        loading ? (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div key={n} className="h-20 rounded-2xl bg-zinc-100 animate-pulse" />
            ))}
          </div>
        ) : filteredDonations.length === 0 ? (
          <Card className="p-10 text-center border-dashed rounded-3xl bg-white space-y-2">
            <IndianRupee className="h-10 w-10 mx-auto text-zinc-300" />
            <h3 className="text-sm font-bold text-zinc-900">No Monetary Donations Recorded</h3>
            <p className="text-xs text-zinc-400">Support hearing-impaired children by making your first contribution</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredDonations.map((donation) => {
              const ashram = mockAshrams.find((a) => a.id === donation.ashramId);
              return (
                <Card key={donation.id} className="border border-zinc-200/80 shadow-xs rounded-2xl overflow-hidden bg-white hover:border-[#0F6D4E]/40 transition-all p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0F6D4E] font-bold text-sm shrink-0">
                        ₹
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-zinc-900 text-sm truncate">{ashram?.name || 'Niswartha Ashram'}</h4>
                        <p className="text-xs text-muted-foreground font-mono">
                          {donation.date ? new Date(donation.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="text-right">
                        <p className="text-base font-bold text-[#0F6D4E] font-mono">₹{donation.amount.toLocaleString()}</p>
                        <Badge className={`font-bold border-none uppercase text-[8px] px-2 py-0.5 ${
                          donation.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {donation.status ?? 'completed'}
                        </Badge>
                      </div>

                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-700 rounded-full">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      )}

      {/* Tab 2: Sent Item Donations with Verification Proof */}
      {activeTab === 'items' && (
        loading ? (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div key={n} className="h-24 rounded-2xl bg-zinc-100 animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="p-10 text-center border-dashed rounded-3xl bg-white space-y-2">
            <Package className="h-10 w-10 mx-auto text-zinc-300" />
            <h3 className="text-sm font-bold text-zinc-900">No Sent Item Donations Found</h3>
            <p className="text-xs text-zinc-400">When you ship physical items to an ashram, your courier status and admin acknowledgment proof appear here.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => {
              const isReceived = item.status === 'received' || item.status === 'verified';
              return (
                <Card key={item.id} className="border border-zinc-200/80 shadow-xs rounded-2xl overflow-hidden bg-white p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        isReceived ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900 text-sm sm:text-base">{item.needTitle || 'Donated Item'}</h4>
                        <p className="text-xs text-muted-foreground">
                          {item.ashramName || 'Ashram'} • Ref: <span className="font-mono font-bold text-zinc-800">{item.reference || item.id}</span>
                        </p>
                      </div>
                    </div>

                    <Badge className={`font-bold border-none uppercase text-[10px] px-3 py-1 rounded-full ${
                      isReceived
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'in_transit'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isReceived ? 'Received & Verified ✓' : item.status === 'in_transit' ? 'In Transit 🚚' : 'Pending Verification ⏳'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground block">Expected Delivery</span>
                      <span className="font-semibold text-zinc-800">{item.deliveryDate}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Donor Name & Phone</span>
                      <span className="font-semibold text-zinc-800">{item.fullName} ({item.phone})</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Category</span>
                      <span className="font-semibold text-zinc-800">{item.category || 'Direct Need'}</span>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-xs bg-zinc-50 p-2.5 rounded-xl text-zinc-600 border border-zinc-100">
                      <span className="font-bold text-zinc-700">Donor Note: </span>{item.notes}
                    </p>
                  )}

                  {/* Admin Receipt Acknowledgment & Proof Section */}
                  {isReceived ? (
                    <div className="mt-2 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50/40 p-3.5 text-xs text-emerald-900 flex items-start gap-3">
                      <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                          Admin Acknowledgment & Verification Proof
                          <Check className="h-3.5 w-3.5 text-emerald-600 inline" />
                        </p>
                        <p className="mt-0.5 text-emerald-800">
                          Verified by Ashram Admin on {item.receivedAt ? new Date(item.receivedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'recently'}.
                        </p>
                        {item.adminNotes && (
                          <p className="mt-1 font-medium bg-white/70 p-2 rounded-lg border border-emerald-200 text-emerald-900">
                            "{item.adminNotes}"
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 rounded-2xl border border-amber-200 bg-amber-50/50 p-3 text-xs text-amber-900 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>Waiting for ashram admin to receive courier package and confirm receipt.</span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

