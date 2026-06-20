import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs } from '../components/CustomTabs';
import { Card, CardContent } from '../components/ui/card';
import { MapPin, Phone, Globe, Calendar, Share2, Heart, Facebook } from 'lucide-react';
import { mockAshrams, mockNeeds, mockEvents, mockPosts } from '../data/mock';
import { api } from '../lib/api';
import type { Ashram, Need, Post, Event as EventItem } from '../types';
import { ScrollReveal } from '../components/ScrollReveal';
import { FloatingQuickContact } from '../components/FloatingQuickContact';

export function AshramDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('about');
  const [ashram, setAshram] = useState<Ashram | undefined>(() => mockAshrams.find((a) => a.id === id));
  const [needs, setNeeds] = useState<Need[]>(() => mockNeeds.filter((n) => n.ashramId === id));
  const [events, setEvents] = useState<EventItem[]>(() => mockEvents.filter((e) => e.ashramId === id));
  const [posts, setPosts] = useState<Post[]>(() => mockPosts.filter((p) => p.ashramId === id));

  useEffect(() => {
    if (!id) return;
    const fallbackAshram = mockAshrams.find((a) => a.id === id);
    if (fallbackAshram) {
      setAshram(fallbackAshram);
      setNeeds(mockNeeds.filter((n) => n.ashramId === id));
      setEvents(mockEvents.filter((e) => e.ashramId === id));
      setPosts(mockPosts.filter((p) => p.ashramId === id));
    }
    let cancelled = false;
    (async () => {
      try {
        const [a, n, e, p] = await Promise.all([
          api.getAshram(id),
          api.getNeeds(id),
          api.getEvents(id),
          api.getPosts(id),
        ]);
        if (cancelled) return;
        setAshram(a);
        setNeeds(n);
        if (Array.isArray(e)) setEvents(e);
        setPosts(p);
      } catch {
        /* mock already applied */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!ashram) {
    return <div className="p-8 text-center">Ashram not found</div>;
  }

  const handleDonate = () => {
    navigate(`/donate/${id}`);
  };

  const AboutContent = (
    <ScrollReveal>
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h3 className="text-lg font-serif font-semibold mb-2">Our Mission</h3>
        <p className="text-muted-foreground leading-relaxed">{ashram.description}</p>
      </div>
      
      <div>
        <h3 className="text-lg font-serif font-semibold mb-3">Gallery</h3>
        <div className="grid grid-cols-2 gap-3">
          {ashram.gallery.map((img, idx) => (
            <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-muted">
              <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-secondary/30 p-4 rounded-xl space-y-3">
        <h3 className="text-base font-semibold text-primary">Contact Information</h3>
        <div className="space-y-2 text-sm text-foreground">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            <span>{ashram.contact.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <span>{ashram.contact.website}</span>
          </div>
          {ashram.facebookUrl ? (
            <a
              href={ashram.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <Facebook className="h-4 w-4" />
              <span>Facebook</span>
            </a>
          ) : null}
        </div>
      </div>
    </div>
    </ScrollReveal>
  );

  const NeedsContent = (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['All', 'Food', 'Education', 'Health'].map((cat) => (
          <Badge key={cat} variant="outline" className="whitespace-nowrap cursor-pointer hover:bg-muted">
            {cat}
          </Badge>
        ))}
      </div>
      
      {needs.map((need) => (
        <Card key={need.id} className="overflow-hidden border-none shadow-sm bg-card">
          <div className="flex p-4 gap-4">
            <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <img src={need.imageUrl} alt={need.title} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-start">
                <Badge variant={need.urgency === 'high' ? 'destructive' : 'secondary'} className="text-[10px] px-1.5 py-0">
                  {need.urgency === 'high' ? 'Urgent' : need.category}
                </Badge>
              </div>
              <h4 className="font-semibold text-sm line-clamp-1">{need.title}</h4>
              <div className="mt-2 h-1.5 w-full bg-secondary/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500" 
                  style={{ width: `${(need.quantityFulfilled / need.quantityRequired) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>Raised: ₹{need.quantityFulfilled}</span>
                <span>Goal: ₹{need.quantityRequired}</span>
              </div>
            </div>
          </div>
          <div className="px-4 pb-4">
             <Button
               size="sm"
               className="w-full text-xs h-8"
               onClick={() => navigate(`/donate-flow/${need.ashramId}/${need.id}`)}
             >
               Donate Now
             </Button>
          </div>
        </Card>
      ))}
    </div>
  );

  const EventsContent = (
    <div className="space-y-4 animate-in fade-in duration-300">
      {events.map((event) => (
        <Card key={event.id} className="overflow-hidden border-none shadow-sm bg-card hover:bg-muted/50 transition-colors">
          <div className="flex">
             <div className="bg-primary/10 w-16 flex flex-col items-center justify-center text-primary p-2">
                <span className="text-xs font-bold uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                <span className="text-xl font-bold">{new Date(event.date).getDate()}</span>
             </div>
             <div className="p-4 flex-1">
                <h4 className="font-semibold text-sm">{event.title}</h4>
                <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1">
                   <Calendar className="h-3 w-3" />
                   {event.time} • {event.location}
                </div>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{event.description}</p>
             </div>
          </div>
        </Card>
      ))}
      {events.length === 0 && <p className="text-center text-muted-foreground py-8">No upcoming events.</p>}
    </div>
  );

  const FeedContent = (
    <div className="space-y-6 animate-in fade-in duration-300">
      {posts.map((post) => (
        <div key={post.id} className="bg-card rounded-xl overflow-hidden shadow-sm border border-border">
          <div className="p-3 flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 overflow-hidden">
               <img src={ashram.imageUrl} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1">
               <p className="text-xs font-bold">{ashram.name}</p>
               <p className="text-[10px] text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="aspect-square bg-muted">
            <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover" />
          </div>
          <div className="p-3 space-y-2">
             <div className="flex gap-4">
                <Heart className="h-5 w-5 text-destructive" />
                <Share2 className="h-5 w-5 text-muted-foreground" />
             </div>
             <p className="text-sm font-medium">{post.likes} likes</p>
             <p className="text-sm text-muted-foreground">
               <span className="font-semibold text-foreground mr-1">{ashram.name}</span>
               {post.caption}
             </p>
          </div>
        </div>
      ))}
      {posts.length === 0 && <p className="text-center text-muted-foreground py-8">No posts yet.</p>}
    </div>
  );

  return (
    <>
    <div className="bg-background min-h-screen pb-24 relative">
      <div className="h-64 relative">
        <img src={ashram.imageUrl} alt={ashram.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-white">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={() => navigate(-1)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          </Button>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" type="button">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="absolute bottom-4 left-6 right-6 text-white">
          <h1 className="text-2xl font-serif font-bold">{ashram.name}</h1>
          <div className="flex items-center text-sm text-gray-200 mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            {ashram.location}
          </div>
        </div>
      </div>

      <div className="bg-background rounded-t-3xl -mt-6 relative px-6 pt-8">
        <div className="flex justify-between items-center mb-6">
           <div>
              <p className="text-sm text-muted-foreground">Helped 50+ children</p>
              <div className="flex -space-x-2 mt-1">
                 {[1,2,3].map(i => (
                    <div key={i} className="h-6 w-6 rounded-full border-2 border-background bg-gray-300" />
                 ))}
                 <div className="h-6 w-6 rounded-full border-2 border-background bg-muted text-[8px] flex items-center justify-center font-bold text-muted-foreground">+2k</div>
              </div>
           </div>
           <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:justify-end">
              <Button
                variant="outline"
                className="rounded-full border-primary/50"
                type="button"
                onClick={() => id && navigate(`/visit-book/${id}`)}
              >
                Book a visit
              </Button>
              <Button onClick={handleDonate} className="rounded-full px-6 shadow-lg shadow-primary/20">
                Donate
              </Button>
           </div>
        </div>

        <Tabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={[
            { id: 'about', label: 'About', content: AboutContent },
            { id: 'needs', label: 'Needs', content: NeedsContent },
            { id: 'events', label: 'Events', content: EventsContent },
            { id: 'feed', label: 'Feed', content: FeedContent },
          ]}
        />
      </div>
    </div>
    <FloatingQuickContact ashram={ashram} />
    </>
  );
}