import { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ArrowLeft, Download, CheckCircle2, Clock, XCircle, IndianRupee, Clock3 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { mockAshrams } from '../data/mock';
import { useUser } from '../context/UserContext';
import { api } from '../lib/api';
import { Donation } from '../types';

export function DonationHistory() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

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
        setLastUpdated(new Date());
      } catch {
        if (!alive) return;
        setDonations([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadDonations();
    const interval = window.setInterval(loadDonations, 30000);
    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, [currentUser]);

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
  const ashramCount = useMemo(
    () => new Set(donations.map((d) => d.ashramId)).size,
    [donations],
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
        return (
          <Badge className="border-0 bg-zinc-900/10 text-zinc-900 text-[10px]">Completed</Badge>
        );
      case 'pending':
        return (
          <Badge className="border-0 bg-zinc-900/10 text-zinc-800 text-[10px]">Pending</Badge>
        );
      case 'failed':
        return <Badge variant="destructive" className="text-[10px]">Failed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="bg-[#0d130f] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(163,230,53,0.14),transparent_55%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.1),transparent_45%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:22px_22px] opacity-25" />

        <div className="relative p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 text-white hover:bg-white/10 shrink-0"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-xs text-white/70">Your impact</p>
              <h1 className="font-semibold text-lg leading-tight">Donation History</h1>
            </div>
          </div>

          <Card className="bg-[#c5e54d] text-zinc-900 border-0 shadow-2xl rounded-3xl">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium opacity-80">Total Donated</p>
                <Badge className="bg-zinc-900 text-white border-0">LIVE</Badge>
              </div>
              <div className="mt-1 flex items-end gap-1">
                <IndianRupee className="h-6 w-6" />
                <p className="text-4xl font-bold tracking-tight">
                  {loading ? '...' : totalDonated.toLocaleString()}
                </p>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs opacity-80">
                <Clock3 className="h-3.5 w-3.5" />
                <span>
                  Updated {lastUpdated ? lastUpdated.toLocaleTimeString() : 'just now'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-zinc-900 text-white rounded-xl py-3 px-3 text-center">
                  <p className="text-xl font-bold">{loading ? '...' : donations.length}</p>
                  <p className="text-[10px] font-medium opacity-80 mt-0.5">Donations</p>
                </div>
                <div className="bg-zinc-900 text-white rounded-xl py-3 px-3 text-center">
                  <p className="text-xl font-bold">{loading ? '...' : ashramCount}</p>
                  <p className="text-[10px] font-medium opacity-80 mt-0.5">Ashrams</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  className="bg-zinc-900 text-white rounded-xl py-2 text-[11px] font-medium"
                  onClick={() => navigate('/needs')}
                >
                  Browse Needs
                </button>
                <button
                  type="button"
                  className="bg-zinc-900 text-white rounded-xl py-2 text-[11px] font-medium"
                  onClick={() => navigate('/profile')}
                >
                  Back to Profile
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <main className="flex-1 p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold">All donations</h3>
          <Button variant="ghost" size="sm" className="text-xs gap-1 h-auto p-0 text-muted-foreground">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>

        {loading && (
          <p className="text-center py-8 text-sm text-muted-foreground">Loading donations…</p>
        )}

        {!loading &&
          donations.map((donation) => {
            const ashram = mockAshrams.find((a) => a.id === donation.ashramId);
            const name = ashram?.name ?? 'Ashram';

            return (
              <Card key={donation.id} className="overflow-hidden rounded-2xl border shadow-sm">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(donation.status)}
                        <h4 className="font-semibold text-sm truncate">{name}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">General donation</p>
                    </div>
                    {getStatusBadge(donation.status)}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-border/60">
                    <div>
                      <p className="text-lg font-bold">₹{donation.amount.toLocaleString()}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(donation.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs rounded-xl">
                      Receipt
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}

        {!loading && donations.length === 0 && (
          <div className="rounded-2xl bg-muted/40 px-4 py-10 text-center text-muted-foreground">
            <p className="text-sm font-medium text-foreground mb-1">No donations yet</p>
            <p className="text-xs mb-4">Support a need to see your history here.</p>
            <Button size="sm" className="rounded-xl" onClick={() => navigate('/needs')}>
              Explore needs
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
