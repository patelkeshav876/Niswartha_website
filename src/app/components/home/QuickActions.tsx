import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Heart, Users, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollReveal } from '../ScrollReveal';

/* ───── Vertical Scroll-Up Subtitle Component for Mobile ───── */
function ScrollUpSubtitle({ text, phrases }: { text: string; phrases: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (phrases.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [phrases]);

  return (
    <div className="relative h-5 overflow-hidden">
      {/* Desktop / Tablet view: show full text on one line */}
      <p className="hidden sm:block text-sm text-muted-foreground truncate">{text}</p>

      {/* Mobile view: smooth vertical scroll-up transition so card height stays strictly uniform */}
      <div className="sm:hidden relative h-5">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="text-xs text-muted-foreground whitespace-nowrap absolute inset-0 flex items-center"
          >
            {phrases[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

interface QuickActionsProps {
  ashramId?: string;
}

export function QuickActions({ ashramId = 'ashram-1' }: QuickActionsProps) {
  const navigate = useNavigate();

  const actions = [
    {
      tint: 'bg-gradient-to-b from-primary-500/12 to-primary-500/5 ring-1 ring-primary-500/15',
      iconBg: 'text-primary-600',
      title: 'Support Our Mission',
      subtitle: 'Support our children with a contribution',
      phrases: ['Support our children', 'with a contribution'],
      icon: <Heart className="h-7 w-7" />,
      onClick: () => navigate(`/donate/${ashramId}`),
    },
    {
      tint: 'bg-gradient-to-b from-blue-500/12 to-blue-500/5 ring-1 ring-blue-500/15',
      iconBg: 'text-blue-600',
      title: 'About Us',
      subtitle: 'Our story, mission & impact',
      phrases: ['Our story & mission', 'and student impact'],
      icon: <Users className="h-7 w-7" />,
      onClick: () => navigate('/about'),
    },
    {
      tint: 'bg-gradient-to-b from-orange-500/12 to-orange-500/5 ring-1 ring-orange-500/15',
      iconBg: 'text-orange-600',
      title: 'Visit Us',
      subtitle: 'Book a visit to our campus',
      phrases: ['Book a visit', 'to our campus'],
      icon: <Calendar className="h-7 w-7" />,
      onClick: () => navigate(`/visit-book/${ashramId}`),
    },
  ];

  return (
    <section className="section-container py-16 lg:py-20">
      <ScrollReveal>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {actions.map((action, idx) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
              style={{ willChange: 'transform, opacity' }}
              className="h-full"
            >
              <Card
                role="button"
                tabIndex={0}
                className="h-full min-h-[96px] sm:min-h-[104px] cursor-pointer border-0 bg-card/95 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.12)] rounded-2xl ring-1 ring-border/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-16px_rgba(15,23,42,0.2)] active:scale-[0.98]"
                onClick={action.onClick}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') action.onClick();
                }}
              >
                <CardContent className="flex items-center gap-4 sm:gap-5 p-5 sm:p-6 lg:p-8 h-full">
                  <div
                    className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl ${action.tint} shadow-[inset_0_2px_8px_rgba(0,0,0,0.04)]`}
                  >
                    <span className={action.iconBg}>{action.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <h2 className="text-base font-bold lg:text-lg truncate sm:overflow-visible sm:whitespace-normal">
                      {action.title}
                    </h2>
                    <ScrollUpSubtitle text={action.subtitle} phrases={action.phrases} />
                  </div>
                  <ArrowRight className="ml-auto h-5 w-5 shrink-0 text-muted-foreground/40" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}

export default QuickActions;
