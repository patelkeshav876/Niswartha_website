import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Phone, Mail, MapPin, Facebook, Sparkles, Heart } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Ashram } from '../../types';
import { ScrollReveal, TextRevealGroup, TextRevealItem } from '../ScrollReveal';
import { optimizeUnsplashUrl } from '../../lib/unsplash';
import { useConfig } from '../../context/ConfigContext';

interface ContactCtaSectionProps {
  ashram: Ashram;
}

export function ContactCtaSection({ ashram }: ContactCtaSectionProps) {
  const navigate = useNavigate();
  const { config } = useConfig();

  const contactItems = [
    { icon: Phone, content: ashram.contact.phone, href: `tel:${ashram.contact.phone}` },
    { icon: Mail, content: ashram.contact.email, href: `mailto:${ashram.contact.email}` },
    { icon: MapPin, content: ashram.location },
    ...(ashram.facebookUrl
      ? [{ icon: Facebook, content: 'Follow us on Facebook', href: ashram.facebookUrl }]
      : []),
  ];

  return (
    <section className="bg-gradient-to-br from-primary/[0.06] via-background to-primary/[0.04] py-12 lg:py-20">
      <div className="section-container px-4 sm:px-6">
        <ScrollReveal>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <TextRevealGroup stagger={0.1}>
                <TextRevealItem>
                  <h2 className="text-2xl font-bold lg:text-3xl font-serif">Get in Touch</h2>
                </TextRevealItem>
                <TextRevealItem blur={false}>
                  <p className="mt-2 text-muted-foreground">
                    Reach out to us for visits, volunteering, or any inquiries.
                  </p>
                </TextRevealItem>
              </TextRevealGroup>
              <div className="mt-6 space-y-3">
                {contactItems.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    style={{ willChange: 'transform, opacity' }}
                    className="flex items-center gap-4 rounded-xl bg-card/80 px-4 py-3 shadow-sm ring-1 ring-border/40 backdrop-blur-sm"
                  >
                    <item.icon className="h-5 w-5 shrink-0 text-primary" />
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href?.startsWith('http') ? '_blank' : undefined}
                        rel={item.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {item.content}
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">{item.content}</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Donate CTA Card with Custom Admin Image Support */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              style={{ willChange: 'transform, opacity' }}
              className="w-[92%] sm:w-full max-w-md lg:max-w-none mx-auto"
            >
              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/80 shadow-xl shadow-primary/15 rounded-3xl">
                {config?.supportCauseBgUrl && (
                  <>
                    <img
                      src={optimizeUnsplashUrl(config.supportCauseBgUrl, 800, 500)}
                      alt="Support Our Cause"
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
                  </>
                )}

                <CardContent className="relative z-10 p-6 sm:p-10 text-center text-white">
                  <Sparkles className="mx-auto mb-3 h-10 w-10 opacity-80" />
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 lg:text-3xl">
                    {config?.supportCauseTitle || 'Support Our Cause'}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/90 mb-5 leading-relaxed max-w-md mx-auto font-medium">
                    {config?.supportCauseSubtitle ||
                      'Your generous contribution helps us provide better care, education, and opportunities to our children.'}
                  </p>
                  <Button
                    size="lg"
                    className="h-12 sm:h-14 w-full max-w-xs rounded-full bg-white text-primary font-bold hover:bg-white/90 shadow-xl transition-transform hover:scale-105 text-sm sm:text-base"
                    onClick={() => navigate(`/donate/${ashram.id}`)}
                  >
                    {config?.donationWording || 'Support Our Mission'}{' '}
                    <Heart className="ml-2 h-4 w-4 sm:h-5 sm:w-5 fill-primary" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default ContactCtaSection;
