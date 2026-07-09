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

  return (
    <div className="space-y-6">
      <div className="border-b pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-950">Donation History</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Summary of your financial support and contributions</p>
        </div>

        {donations.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-zinc-200 text-xs font-semibold gap-1.5 self-start sm:self-auto"
          >
            <Download className="h-3.5 w-3.5" />
            Export Receipts
          </Button>
        )}
      </div>

      {/* Summary Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Donated', value: `₹${totalDonated.toLocaleString()}`, color: 'bg-emerald-50 text-[#0F6D4E]', icon: IndianRupee },
          { label: 'Total Transactions', value: donations.length, color: 'bg-indigo-50 text-indigo-600', icon: Activity },
          { label: 'Ashrams Supported', value: ashramCount, color: 'bg-amber-50 text-amber-600', icon: Calendar },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm rounded-3xl bg-white overflow-hidden p-5">
            <div className="flex items-center gap-4">
              <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-5.5 w-5.5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{stat.label}</p>
                <p className="text-2xl font-bold text-zinc-950 mt-0.5">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest pl-1">All Transactions</h3>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-16 rounded-2xl bg-zinc-100 animate-pulse" />
            ))}
          </div>
        ) : donations.length === 0 ? (
          <Card className="p-12 text-center border-dashed rounded-3xl bg-white text-zinc-500">
            <p className="text-sm">No donations logged yet.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {donations.map((donation) => {
              const ashram = mockAshrams.find((a) => a.id === donation.ashramId);
              const name = ashram?.name ?? 'General Ashram Support';

              return (
                <Card key={donation.id} className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-[#0F6D4E]">
                        {getStatusIcon(donation.status)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-zinc-900 truncate text-sm">{name}</h4>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          Date:{' '}
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
                      
                      <Button variant="outline" size="sm" className="h-8 rounded-xl text-xs border-zinc-200 hidden sm:inline-flex">
                        Receipt
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
