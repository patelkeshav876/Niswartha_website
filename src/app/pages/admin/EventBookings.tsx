import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { 
  ArrowLeft, 
  Search,
  Users,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { mockEvents } from '../../data/mock';

export function EventBookings() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');

  const event = mockEvents.find(e => e.id === id);

  // Mock booking data
  const bookings = [
    {
      id: '1',
      userName: 'Ravi Kumar',
      email: 'ravi.kumar@example.com',
      phone: '+91 9876543210',
      registeredAt: '2024-03-15T10:30:00',
      status: 'confirmed',
      guests: 2
    },
    {
      id: '2',
      userName: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+91 9876543211',
      registeredAt: '2024-03-15T14:20:00',
      status: 'confirmed',
      guests: 3
    },
    {
      id: '3',
      userName: 'Amit Patel',
      email: 'amit.patel@example.com',
      phone: '+91 9876543212',
      registeredAt: '2024-03-16T09:15:00',
      status: 'pending',
      guests: 1
    },
    {
      id: '4',
      userName: 'Sonia Gupta',
      email: 'sonia.gupta@example.com',
      phone: '+91 9876543213',
      registeredAt: '2024-03-14T16:45:00',
      status: 'cancelled',
      guests: 4
    }
  ];

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || booking.status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    totalGuests: bookings.reduce((sum, b) => sum + b.guests, 0)
  };

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b px-6 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/admin/events')}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold line-clamp-1">Event Bookings</h1>
            <p className="text-xs text-muted-foreground line-clamp-1">{event.title}</p>
          </div>
          <Button size="icon" variant="ghost" className="h-9 w-9">
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Input
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-none"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'confirmed', 'pending', 'cancelled'].map((status) => (
            <Badge
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              className="cursor-pointer capitalize whitespace-nowrap"
              onClick={() => setFilter(status as any)}
            >
              {status}
            </Badge>
          ))}
        </div>
      </div>

      <main className="flex-1 p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Bookings</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-5 w-5 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">{stats.confirmed}</p>
              <p className="text-xs text-muted-foreground">Confirmed</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 mx-auto mb-2 text-orange-600" />
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">{stats.totalGuests}</p>
              <p className="text-xs text-muted-foreground">Total Guests</p>
            </CardContent>
          </Card>
        </div>

        {/* Event Info Card */}
        <Card className="mb-6 border-none shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{new Date(event.date).toLocaleDateString()}</p>
                <p className="text-xs text-muted-foreground">{event.time}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Capacity: {stats.confirmed + stats.pending} / 50 slots
            </p>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <div className="space-y-3">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="border-none shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-sm mb-1">{booking.userName}</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{booking.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{booking.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{booking.guests} guest{booking.guests > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      booking.status === 'confirmed' ? 'default' : 
                      booking.status === 'pending' ? 'secondary' : 
                      'destructive'
                    }
                    className="text-[10px]"
                  >
                    {booking.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Clock className="h-3 w-3" />
                  <span>Registered: {new Date(booking.registeredAt).toLocaleString()}</span>
                </div>

                {/* Actions */}
                {booking.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="h-7 text-xs flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Confirm
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 text-xs flex-1 text-destructive"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Decline
                    </Button>
                  </div>
                )}
                {booking.status === 'confirmed' && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full h-7 text-xs text-destructive"
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Cancel Booking
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredBookings.length === 0 && (
          <Card className="p-8 text-center border-dashed">
            <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">No bookings found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search or filter</p>
          </Card>
        )}
      </main>
    </div>
  );
}
