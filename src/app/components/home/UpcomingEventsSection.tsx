import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { type Event as EventType } from '../../types';
import { TextRevealGroup, TextRevealItem, BlurReveal } from '../ScrollReveal';
import { optimizeUnsplashUrl } from '../../lib/unsplash';

interface UpcomingEventsSectionProps {
  upcomingEvents: EventType[];
}

export function UpcomingEventsSection({ upcomingEvents }: UpcomingEventsSectionProps) {
  const navigate = useNavigate();

  return (
    <section className="section-container py-16 lg:py-20">
      <div className="mb-8 flex items-end justify-between">
        <TextRevealGroup stagger={0.1}>
          <TextRevealItem>
            <div className="mb-2 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                Upcoming
              </span>
            </div>
          </TextRevealItem>
          <TextRevealItem>
            <h2 className="text-2xl font-bold lg:text-3xl font-serif">Community Events</h2>
          </TextRevealItem>
          <TextRevealItem blur={false}>
            <p className="mt-1 text-muted-foreground">Join us and make lasting memories</p>
          </TextRevealItem>
        </TextRevealGroup>
        <BlurReveal delay={0.2} direction="left">
          <Link to="/events">
            <Button variant="ghost" className="group text-primary">
              View All{' '}
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </BlurReveal>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {upcomingEvents.map((event, idx) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ willChange: 'transform, opacity' }}
          >
            <Card
              className="card-hover cursor-pointer overflow-hidden border-0 bg-card shadow-[0_8px_30px_-10px_rgba(15,23,42,0.1)] rounded-2xl ring-1 ring-border/50"
              onClick={() => navigate('/events')}
            >
              <div className="relative aspect-[16/10] sm:h-48 w-full overflow-hidden">
                <img
                  src={optimizeUnsplashUrl(
                    event.imageUrl ||
                      'https://images.unsplash.com/photo-1512341689857-198e7e2f3ca8',
                    600,
                    400,
                  )}
                  alt={event.title}
                  width={600}
                  height={400}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute left-3 top-3">
                  <div className="rounded-lg bg-background/90 px-2.5 py-1.5 text-center shadow-sm backdrop-blur-sm">
                    <span className="block text-[10px] font-bold uppercase text-primary">
                      {new Date(event.date).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="block text-lg font-bold leading-none text-foreground">
                      {new Date(event.date).getDate()}
                    </span>
                  </div>
                </div>
              </div>
              <CardContent className="p-5">
                <h3 className="mb-2 text-lg font-bold text-foreground">{event.title}</h3>
                <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>
                    {new Date(event.date).toLocaleDateString()} • {event.time}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default UpcomingEventsSection;
