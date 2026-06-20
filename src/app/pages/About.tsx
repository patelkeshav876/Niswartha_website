import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Heart,
  Users,
  Award,
  BookOpen,
  Briefcase,
  Target,
  Facebook,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { mockAshrams } from '../data/mock';
import { ScrollReveal } from '../components/ScrollReveal';
import { PremiumHeroBackdrop } from '../components/home/PremiumHeroBackdrop';
import { motion } from 'motion/react';

export function About() {
  const navigate = useNavigate();
  const ashram = mockAshrams[0];

  const features = [
    {
      icon: BookOpen,
      title: 'Quality Education',
      description: 'A structured, inclusive environment from Grades 1 to 12 with modern digital classrooms.'
    },
    {
      icon: Users,
      title: 'Advanced Speech Therapy',
      description: 'Expert special educators and dedicated therapy rooms to enhance communication skills.'
    },
    {
      icon: Briefcase,
      title: 'Career & Life Skills',
      description: 'Mentoring for higher education, competitive exams, and job opportunities post-12th.'
    },
    {
      icon: Award,
      title: 'Holistic Development',
      description: 'Comprehensive sports facilities, modern fitness gear, and yoga for balanced growth.'
    }
  ];

  const milestones = [
    { year: 'Since 1946', title: 'Legacy of Care', description: 'Decades of dedicated educational service' },
    { year: 'Awarded', title: 'National Recognition', description: 'Honored by the Government of India' },
    { year: '100%', title: 'Academic Success', description: 'Consistent perfection in board exams' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ════════════ Hero Banner ════════════ */}
      <PremiumHeroBackdrop>
        <div className="relative py-24 lg:py-32">
          <div className="section-container text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-serif text-4xl font-bold text-white sm:text-5xl lg:text-6xl"
            >
              About Us
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mx-auto mt-4 max-w-2xl text-base text-white/60 lg:text-lg"
            >
              Empowering hearing-impaired children with quality education and a brighter future since 1946.
            </motion.p>
          </div>
        </div>
      </PremiumHeroBackdrop>

      <main className="flex-1">
        {/* ──── Institute Overview ──── */}
        <section className="section-container py-16 lg:py-20">
          <ScrollReveal>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
              <div className="relative h-64 rounded-2xl overflow-hidden lg:h-96">
                <img
                  src={ashram.imageUrl}
                  alt={ashram.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <h2 className="text-2xl font-serif font-bold text-white mb-1 lg:text-3xl">{ashram.name}</h2>
                  <div className="flex items-center gap-2 text-white/90">
                    <MapPin className="h-4 w-4" />
                    <p className="text-sm">{ashram.location}</p>
                  </div>
                </div>
              </div>

              <Card className="border-none shadow-lg bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl">
                <CardContent className="p-6 lg:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/25">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-3 lg:text-2xl">Our Mission</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        To provide every hearing-impaired student with quality education, unwavering confidence, and the practical skills needed for an independent, successful future in a supportive and inclusive environment.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollReveal>
        </section>

        {/* ──── What We Offer ──── */}
        <section className="bg-muted/30 py-16 lg:py-20">
          <div className="section-container">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="text-2xl font-bold lg:text-3xl">What We Offer</h2>
                <p className="mt-2 text-muted-foreground">Comprehensive support for every child's development</p>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, idx) => (
                <ScrollReveal key={idx} delay={idx * 0.08}>
                  <Card className="card-hover border-none shadow-sm h-full rounded-2xl">
                    <CardContent className="p-6 text-center lg:p-8">
                      <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <feature.icon className="h-7 w-7 text-primary" />
                      </div>
                      <h4 className="font-bold text-base mb-2">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ──── Milestones ──── */}
        <section className="section-container py-16 lg:py-20">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold lg:text-3xl">Our Impact</h2>
              <p className="mt-2 text-muted-foreground">Milestones that define our journey</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {milestones.map((milestone, idx) => (
              <ScrollReveal key={idx} delay={idx * 0.1}>
                <Card className="card-hover border-none shadow-sm rounded-2xl">
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex items-center gap-4 lg:flex-col lg:text-center">
                      <Badge className="bg-primary text-base px-4 py-1.5 lg:mb-2">
                        {milestone.year}
                      </Badge>
                      <div className="flex-1 lg:flex-none">
                        <h4 className="font-bold text-base mb-1">{milestone.title}</h4>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ──── Photo Gallery ──── */}
        <section className="bg-muted/30 py-16 lg:py-20">
          <div className="section-container">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="text-2xl font-bold lg:text-3xl">Photo Gallery</h2>
                <p className="mt-2 text-muted-foreground">Moments that capture our spirit</p>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
              {ashram.gallery?.map((image, idx) => (
                <ScrollReveal key={idx} delay={idx * 0.08}>
                  <div className="relative overflow-hidden rounded-2xl group aspect-video">
                    <img
                      src={image}
                      alt={`Gallery ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ──── Contact ──── */}
        <section className="section-container py-16 lg:py-20">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
            <ScrollReveal>
              <Card className="border-none shadow-lg rounded-2xl">
                <CardContent className="p-6 lg:p-8">
                  <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    {[
                      { icon: Phone, label: 'Phone', value: ashram.contact.phone, href: `tel:${ashram.contact.phone}` },
                      { icon: Mail, label: 'Email', value: ashram.contact.email, href: `mailto:${ashram.contact.email}` },
                      ...(ashram.contact.website ? [{ icon: Globe, label: 'Website', value: ashram.contact.website, href: `https://${ashram.contact.website}` }] : []),
                      ...(ashram.facebookUrl ? [{ icon: Facebook, label: 'Facebook', value: 'Deaf and Dumb Industrial Institute — Nagpur', href: ashram.facebookUrl }] : []),
                      { icon: MapPin, label: 'Address', value: ashram.location },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="h-11 w-11 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <item.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                          {item.href ? (
                            <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined} className="font-medium text-sm hover:text-primary transition-colors">
                              {item.value}
                            </a>
                          ) : (
                            <p className="font-medium text-sm">{item.value}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* Donate CTA */}
            <ScrollReveal delay={0.1}>
              <Card className="border-none shadow-lg bg-gradient-to-br from-primary to-primary/80 rounded-2xl">
                <CardContent className="p-8 text-center text-white lg:p-10">
                  <Heart className="h-14 w-14 mx-auto mb-4 opacity-80" />
                  <h3 className="font-bold text-2xl mb-3">Support Our Cause</h3>
                  <p className="text-sm text-white/90 mb-6 leading-relaxed max-w-md mx-auto">
                    Your generous contribution helps us provide better care, education, and opportunities to our children.
                  </p>
                  <Button
                    size="lg"
                    className="h-14 w-full max-w-xs rounded-full bg-white text-primary hover:bg-white/90 shadow-lg font-semibold"
                    onClick={() => navigate(`/donate/${ashram.id}`)}
                  >
                    Donate Now
                  </Button>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </section>
      </main>
    </div>
  );
}
