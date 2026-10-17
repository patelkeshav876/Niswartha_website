import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Need } from '../../types';
import { TextRevealGroup, TextRevealItem, BlurReveal } from '../ScrollReveal';
import { optimizeUnsplashUrl } from '../../lib/unsplash';

interface UrgentNeedsSectionProps {
  urgentNeeds: Need[];
}

export function UrgentNeedsSection({ urgentNeeds }: UrgentNeedsSectionProps) {
  const navigate = useNavigate();

  if (!urgentNeeds || urgentNeeds.length === 0) {
    return null;
  }

  return (
    <section className="bg-muted/30 py-16 lg:py-20">
      <div className="section-container">
        <div className="mb-8 flex items-end justify-between">
          <TextRevealGroup stagger={0.1}>
            <TextRevealItem>
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                  Urgent
                </span>
              </div>
            </TextRevealItem>
            <TextRevealItem>
              <h2 className="text-2xl font-bold lg:text-3xl font-serif">Help Us Reach Our Goals</h2>
            </TextRevealItem>
            <TextRevealItem blur={false}>
              <p className="mt-1 text-muted-foreground">These needs require immediate attention</p>
            </TextRevealItem>
          </TextRevealGroup>
          <BlurReveal delay={0.2} direction="left">
            <Link to="/needs">
              <Button variant="ghost" className="group text-primary">
                View All{' '}
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </BlurReveal>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {urgentNeeds.slice(0, 3).map((need, i) => (
            <motion.div
              key={need.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-5%' }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              style={{ willChange: 'transform, opacity' }}
            >
              <Card
                className="card-hover cursor-pointer overflow-hidden border-0 bg-card shadow-[0_8px_30px_-10px_rgba(15,23,42,0.1)] rounded-2xl ring-1 ring-border/50"
                onClick={() => navigate(`/donate-flow/${need.ashramId}/${need.id}`)}
              >
                <CardContent className="p-5 lg:p-6">
                  <div className="flex gap-4">
                    <img
                      src={optimizeUnsplashUrl(
                        need.imageUrl ||
                          'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c',
                        80,
                        80,
                        65,
                      )}
                      srcSet={`
                        ${optimizeUnsplashUrl(need.imageUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c', 80, 80, 65)} 1x,
                        ${optimizeUnsplashUrl(need.imageUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c', 160, 160, 65)} 2x
                      `}
                      alt={need.title}
                      width={80}
                      height={80}
                      loading="lazy"
                      decoding="async"
                      className="h-20 w-20 min-h-20 min-w-20 shrink-0 rounded-xl object-cover shadow-inner ring-1 ring-black/5"
                      style={{ width: '80px', height: '80px', aspectRatio: '1 / 1' }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-start justify-between">
                        <h3 className="line-clamp-1 text-sm font-bold lg:text-base">{need.title}</h3>
                        <Badge variant="destructive" className="ml-2 text-[10px]">
                          Urgent
                        </Badge>
                      </div>
                      <Badge variant="secondary" className="mb-3 text-[10px]">
                        {need.category}
                      </Badge>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium text-emerald-800">
                            {need.quantityFulfilled.toLocaleString()} /{' '}
                            {need.quantityRequired.toLocaleString()} Units
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary shadow-inner">
                          <div
                            className="h-full rounded-full bg-primary shadow-sm transition-all"
                            style={{
                              width: `${(need.quantityFulfilled / need.quantityRequired) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default UrgentNeedsSection;
