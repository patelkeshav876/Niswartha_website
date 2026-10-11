import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Save, Calendar, MapPin, Clock, Users, Upload, Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { fetchAutoImage } from '../../lib/unsplash';

const ASHRAM_ID = 'ashram-1';

function matchEventImage(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('diwali') || t.includes('festival') || t.includes('light') || t.includes('celebrat')) {
    return 'https://images.unsplash.com/photo-1512341689857-198e7e2f3ca8?auto=format&fit=crop&q=80&w=800';
  }
  if (t.includes('art') || t.includes('paint') || t.includes('draw') || t.includes('craft') || t.includes('workshop')) {
    return 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=800';
  }
  if (t.includes('sport') || t.includes('race') || t.includes('cricket') || t.includes('athletic') || t.includes('game') || t.includes('match')) {
    return 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=800';
  }
  if (t.includes('music') || t.includes('dance') || t.includes('sing') || t.includes('recital') || t.includes('cultur')) {
    return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800';
  }
  if (t.includes('volunt') || t.includes('orient') || t.includes('meet') || t.includes('gathering')) {
    return 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=800';
  }
  if (t.includes('christmas') || t.includes('gift') || t.includes('new year') || t.includes('holiday')) {
    return 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&q=80&w=800';
  }
  if (t.includes('food') || t.includes('dinner') || t.includes('lunch') || t.includes('meal') || t.includes('feast')) {
    return 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800';
  }
  return 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800';
}

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
  const [isCustomImage, setIsCustomImage] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    capacity: '',
    imageUrl: matchEventImage(''),
  });

  // Debounced auto-match background photo search as the user types Title
  useEffect(() => {
    if (isCustomImage) return;
    const query = formData.title.trim();
    if (!query) {
      setFormData((prev) => ({ ...prev, imageUrl: matchEventImage('') }));
      return;
    }

    // Immediate instant keyword match
    setFormData((prev) => ({ ...prev, imageUrl: matchEventImage(query) }));

    setImageLoading(true);
    const timer = setTimeout(async () => {
      try {
        const autoUrl = await fetchAutoImage(query);
        if (autoUrl) {
          setFormData((prev) => ({ ...prev, imageUrl: autoUrl }));
        }
      } finally {
        setImageLoading(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [formData.title, isCustomImage]);

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
      setIsCustomImage(true);
      toast.success('Custom banner uploaded!');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const finalBanner = formData.imageUrl || matchEventImage(formData.title);
      const payload = {
        id: `event-${Date.now()}`,
        ashramId: ASHRAM_ID,
        title: formData.title,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        description: formData.description,
        imageUrl: finalBanner,
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
              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block">Event Banner (Auto-Matched)</Label>
              <div className="relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50 aspect-video flex items-center justify-center group shadow-sm">
                <img
                  src={formData.imageUrl || matchEventImage(formData.title)}
                  alt="Event banner preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 flex items-center gap-2">
                  <Badge className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold border-none flex items-center gap-1.5">
                    {imageLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin text-cyan-300" />
                    ) : (
                      <Sparkles className="h-3 w-3 text-emerald-400" />
                    )}
                    {isCustomImage ? 'Custom Photo' : imageLoading ? 'Searching matching photo…' : 'Auto-matched to event'}
                  </Badge>
                </div>
                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black text-white text-xs font-semibold backdrop-blur-md shadow-md transition-all">
                    <Upload className="h-3.5 w-3.5" />
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleBannerUpload}
                    />
                  </label>
                  {isCustomImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomImage(false);
                        setFormData((prev) => ({ ...prev, imageUrl: matchEventImage(prev.title) }));
                      }}
                      className="px-2.5 py-1.5 rounded-full bg-black/75 hover:bg-black text-white text-[11px] font-medium backdrop-blur-md"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
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
                  placeholder="Enter event name (e.g. Annual Sports Day, Diwali Celebration)"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
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
