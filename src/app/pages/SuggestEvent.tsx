import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { motion } from 'motion/react';

const EVENT_TYPES = [
  'Fundraiser',
  'Volunteer Day',
  'Cultural',
  'Workshop',
  'Sports',
  'Medical Camp',
  'Educational',
  'Other',
] as const;

const ASHRAM_ID = 'ashram-1';

function tomorrowISODate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function SuggestEvent() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<string>(EVENT_TYPES[0]);
  const [prefDate, setPrefDate] = useState(tomorrowISODate());
  const [prefTime, setPrefTime] = useState('10:00');
  const [attendees, setAttendees] = useState(20);
  const [description, setDescription] = useState('');
  const [yourName, setYourName] = useState(currentUser?.name ?? '');
  const [contact, setContact] = useState('');
  const [whyChildren, setWhyChildren] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) {
      toast.error('Please sign in to suggest an event.');
      return;
    }
    if (description.trim().length < 50) {
      toast.error('Description must be at least 50 characters.');
      return;
    }
    if (attendees < 5 || attendees > 200) {
      toast.error('Expected attendees must be between 5 and 200.');
      return;
    }
    if (!whyChildren.trim()) {
      toast.error('Please explain how this event will help the children.');
      return;
    }

    setSubmitting(true);
    try {
      await api.createEvent({
        id: `suggested-${Date.now()}`,
        ashramId: ASHRAM_ID,
        title: title.trim(),
        date: prefDate,
        time: prefTime,
        location: 'To be confirmed with ashram',
        description: `${description.trim()}\n\n— Expected attendees: ${attendees}\n— Organizer contact: ${contact.trim()}`,
        eventType,
        status: 'pending_approval',
        suggestedBy: currentUser.id,
        suggestedByName: currentUser.name,
        isUserSuggested: true,
        createdAt: new Date().toISOString(),
        expectedAttendees: attendees,
        whyChildren: whyChildren.trim(),
        suggestedContactPhone: contact.trim(),
        suggestedByDisplayName: yourName.trim(),
      });
      setDone(true);
      toast.success('Suggestion submitted!');
      window.setTimeout(() => navigate('/events'), 2000);
    } catch (err) {
      console.error(err);
      toast.error('Could not submit. Try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto flex min-h-screen max-w-[480px] flex-col items-center justify-center bg-background px-6 pb-24">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
            <CheckCircle2 className="h-9 w-9 text-primary" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-primary mb-2">Suggestion Submitted!</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The ashram admin will review your suggestion within 2–3 days. You&apos;ll be notified on
            approval.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">Redirecting to events…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-[480px] bg-background pb-28">
      <div className="sticky top-0 z-20 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" type="button" onClick={() => navigate('/events')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="font-serif text-lg font-bold">Suggest an Event</h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <Card className="border-none shadow-sm">
          <CardContent className="space-y-4 p-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Weekend art camp"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Event type *</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="pdate">Preferred date *</Label>
                <Input
                  id="pdate"
                  type="date"
                  min={tomorrowISODate()}
                  value={prefDate}
                  onChange={(e) => setPrefDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ptime">Preferred time *</Label>
                <Input
                  id="ptime"
                  type="time"
                  value={prefTime}
                  onChange={(e) => setPrefTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="att">Expected attendees (5–200) *</Label>
              <Input
                id="att"
                type="number"
                min={5}
                max={200}
                value={attendees}
                onChange={(e) => setAttendees(Number(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Description / purpose * (min 50 characters)</Label>
              <Textarea
                id="desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will happen at this event?"
                required
                minLength={50}
              />
              <p className="text-[11px] text-muted-foreground">{description.trim().length}/50+</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="yname">Your name *</Label>
              <Input
                id="yname"
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Your contact (phone) *</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+91 …"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="why">Why this event? *</Label>
              <Textarea
                id="why"
                rows={3}
                value={whyChildren}
                onChange={(e) => setWhyChildren(e.target.value)}
                placeholder="How will this help the children?"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="h-12 w-full rounded-xl" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit suggestion'}
        </Button>
      </form>
    </div>
  );
}
