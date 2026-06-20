import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { ImageSearchPicker } from '../../components/ImageSearchPicker';
import { ArrowLeft, Save, Calendar, MapPin, Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { api } from '../../lib/api';

const ASHRAM_ID = 'ashram-1';

function createEventErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const m = err.message;
    if (
      m === 'Failed to fetch' ||
      m.includes('Failed to fetch') ||
      m.includes('NetworkError') ||
      m.includes('Load failed')
    ) {
      return 'No API on port 4000. Another app may be using it: close that terminal or run Task Manager → end the old Node process, then run npm run server (or npm run dev:full).';
    }
    try {
      const parsed = JSON.parse(m) as { error?: string };
      if (parsed?.error) return parsed.error;
    } catch {
      /* plain text message */
    }
    if (m.length > 0 && m.length < 200) return m;
  }
  return 'Could not create event. Check the API and try again.';
}

export function CreateEvent() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    capacity: '',
    imageUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        id: `event-${Date.now()}`,
        ashramId: ASHRAM_ID,
        title: formData.title,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        description: formData.description,
        imageUrl: formData.imageUrl || '',
        capacity: formData.capacity || '',
        status: 'approved',
        createdAt: new Date().toISOString(),
      };
      await api.createEvent(payload);
      toast.success('Event created successfully!');
      navigate('/admin/events');
    } catch (err) {
      console.error(err);
      toast.error(createEventErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/events')}
            className="h-9 w-9"
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">Create Event</h1>
            <p className="text-xs text-muted-foreground">Schedule new event</p>
          </div>
        </div>
      </div>

      <main className="flex-1 p-6">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
          <Card className="border-none shadow-sm">
            <CardContent className="p-5 space-y-3">
              <Label className="text-sm font-bold block">Event banner</Label>
              <ImageSearchPicker
                value={formData.imageUrl}
                onChange={(url) => setFormData((f) => ({ ...f, imageUrl: url }))}
                searchQuery={formData.title}
              />
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="font-bold">Event Details</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm">
                  Event Title *
                </Label>
                <Input
                  id="title"
                  placeholder="Enter event name"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm">
                    Date *
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="date"
                      type="date"
                      className="pl-10"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time" className="text-sm">
                    Time *
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="time"
                      type="time"
                      className="pl-10"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm">
                  Location *
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="Event venue"
                    className="pl-10"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity" className="text-sm">
                  Max Attendees (Optional)
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="50"
                    className="pl-10"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Leave empty for unlimited registration</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the event, activities, what visitors can expect..."
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-5">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Registration Settings
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Allow registrations</span>
                  <span className="font-medium text-primary">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Registration deadline</span>
                  <span className="font-medium">Event date</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Send confirmation email</span>
                  <span className="font-medium text-primary">Yes</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/admin/events')}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2" disabled={submitting}>
              <Save className="h-4 w-4" />
              {submitting ? 'Creating…' : 'Create Event'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
