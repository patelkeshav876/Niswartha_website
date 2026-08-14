import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Download, CheckCircle2, Clock, XCircle, IndianRupee, Activity, Calendar } from 'lucide-react';
import { mockAshrams } from '../data/mock';
import { useUser } from '../context/UserContext';
import { api } from '../lib/api';
import { Donation } from '../types';

export function DonationHistory() {
  const { currentUser } = useUser();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    let alive = true;

    const loadDonations = async () => {
      try {
        const data = await api.getDonations(currentUser.id);
        if (!alive) return;
        setDonations(data);
      } catch (err) {
        console.error(err);
        if (!alive) return;
        setDonations([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadDonations();
    return () => {
      alive = false;
    };
  }, [currentUser]);

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
  const ashramCount = useMemo(
    () => new Set(donations.map((d) => d.ashramId)).size,
    [donations]
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      {/* Header section */}
      <div className="border-b border-zinc-200/80 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-950">Donation History</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Summary of your financial support and contributions</p>
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

      {/* Summary grid tiles matching Screenshot 1 */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Total Donated', value: `₹${totalDonated.toLocaleString()}`, color: 'text-emerald-700 bg-emerald-50 border-emerald-100', icon: IndianRupee },
          { label: 'Transactions', value: donations.length, color: 'text-indigo-700 bg-indigo-50 border-indigo-100', icon: Activity },
          { label: 'Ashrams Funded', value: ashramCount, color: 'text-amber-700 bg-amber-50 border-amber-100', icon: Calendar },
        ].map((stat, i) => (
          <Card key={i} className="border border-zinc-200/80 shadow-xs rounded-2xl bg-white p-3.5 sm:p-4 text-center">
            <stat.icon className={`mx-auto mb-1.5 h-5 w-5 ${stat.color.split(' ')[0]}`} />
            <p className="text-xl sm:text-2xl font-bold text-zinc-950 font-mono">{stat.value}</p>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Search & Filter pills */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search donations by ashram or amount..."
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
              { id: 'completed', label: 'Completed' },
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

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-20 rounded-2xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : filteredDonations.length === 0 ? (
        <Card className="p-10 text-center border-dashed rounded-3xl bg-white space-y-2">
          <IndianRupee className="h-10 w-10 mx-auto text-zinc-300" />
          <h3 className="text-sm font-bold text-zinc-900">No Donations Recorded</h3>
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
                        {donation.category ? ` • Category: ${donation.category}` : ''}
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
      )}
    </div>
  );
}
