import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Bell, Check, CheckCheck, Clock } from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'sonner';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      // Ensure data is array
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      toast.success('Notification marked as read');
    } catch (err) {
      console.error('Error marking notification as read:', err);
      toast.error('Could not mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;

    try {
      await Promise.all(unread.map((n) => api.markNotificationRead(n.id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Error marking all as read:', err);
      toast.error('Failed to mark all as read');
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-zinc-950">Notifications</h2>
          <p className="text-xs text-muted-foreground mt-1">Keep track of your bookings, donations, and Ashram updates</p>
        </div>
        
        {notifications.some(n => !n.read) && (
          <Button
            onClick={handleMarkAllAsRead}
            variant="outline"
            size="sm"
            className="rounded-full border-zinc-200 hover:bg-zinc-100 text-xs font-semibold self-start sm:self-auto gap-1.5"
          >
            <CheckCheck className="h-4 w-4 text-[#0F6D4E]" />
            Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="border-none shadow-sm animate-pulse rounded-2xl bg-white p-5">
              <div className="h-4 bg-zinc-100 rounded w-1/4 mb-2" />
              <div className="h-3 bg-zinc-100 rounded w-3/4" />
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card className="border-none shadow-sm rounded-3xl bg-white p-12 text-center">
          <div className="h-12 w-12 rounded-full bg-zinc-50 border flex items-center justify-center mx-auto mb-4">
            <Bell className="h-6 w-6 text-zinc-400" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900">No Notifications</h3>
          <p className="text-xs text-zinc-400 mt-1">You're all caught up! Updates will appear here.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`border-none shadow-sm rounded-2xl overflow-hidden transition-all bg-white relative ${
                !notif.read ? 'ring-1 ring-[#0F6D4E]/25' : ''
              }`}
            >
              <CardContent className="p-5 flex items-start gap-4">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    !notif.read
                      ? 'bg-emerald-50 text-[#0F6D4E] border-emerald-100'
                      : 'bg-zinc-50 text-zinc-400 border-zinc-100'
                  }`}
                >
                  <Bell className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className={`text-sm font-bold text-zinc-900 ${!notif.read ? 'font-extrabold' : ''}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1 shrink-0 font-medium">
                      <Clock className="h-3 w-3" />
                      {formatTime(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                {!notif.read && (
                  <Button
                    onClick={() => handleMarkAsRead(notif.id)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-zinc-100 shrink-0 text-zinc-400 hover:text-zinc-900"
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
