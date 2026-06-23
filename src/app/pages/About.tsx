import { useState, useEffect } from 'react';
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
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { mockAshrams } from '../data/mock';
import { ScrollReveal } from '../components/ScrollReveal';
import { PremiumHeroBackdrop } from '../components/home/PremiumHeroBackdrop';
import { motion } from 'motion/react';
import { api } from '../lib/api';

export function About() {
  const navigate = useNavigate();
  const ashram = mockAshrams[0];
  const [team, setTeam] = useState<any[]>([]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const data = await api.getTeamMembers();
        if (data.length > 0) {
          setTeam(data);
        } else {
          // Fallback default team
          setTeam([
            {
              id: 'member-1',
              name: 'Dr. Keshav Patel',
              role: 'Director / Founder',
              imageUrl: 'https://i.pravatar.cc/150?u=director',
              description: 'Dr. Patel leads Niswartha with a vision of holistic rehabilitation and empowerment for deaf children.',
              category: 'Management',
            },
            {
              id: 'member-2',
              name: 'Mrs. Olivia Miller',
              role: 'Principal',
              imageUrl: 'https://i.pravatar.cc/150?u=principal',
              description: 'Olivia guides the academic staff and special education programs with over 15 years of deaf-school teaching experience.',
              category: 'Management',
            },
            {
              id: 'member-3',
              name: 'Mr. Liam Garcia',
              role: 'Speech Therapy Specialist',
              imageUrl: 'https://i.pravatar.cc/150?u=therapist',
              description: 'Liam works one-on-one with children using modern audiology rehabilitation therapies.',
              category: 'Faculty',
            },
            {
              id: 'member-4',
              name: 'Mrs. Jackson Lopez',
              role: 'Vocational Trainer',
              imageUrl: 'https://i.pravatar.cc/150?u=trainer',
              description: 'Jackson provides digital classroom instruction and vocational training in computers, arts, and crafts.',
              category: 'Staff',
            }
          ]);
        }
      } catch {
        setTeam([
          {
            id: 'member-1',
            name: 'Dr. Keshav Patel',
            role: 'Director / Founder',
            imageUrl: 'https://i.pravatar.cc/150?u=director',
            description: 'Dr. Patel leads Niswartha with a vision of holistic rehabilitation and empowerment for deaf children.',
            category: 'Management',
          },
          {
            id: 'member-2',
            name: 'Mrs. Olivia Miller',
            role: 'Principal',
            imageUrl: 'https://i.pravatar.cc/150?u=principal',
            description: 'Olivia guides the academic staff and special education programs with over 15 years of deaf-school teaching experience.',
            category: 'Management',
          },
          {
            id: 'member-3',
            name: 'Mr. Liam Garcia',
            role: 'Speech Therapy Specialist',
            imageUrl: 'https://i.pravatar.cc/150?u=therapist',
            description: 'Liam works one-on-one with children using modern audiology rehabilitation therapies.',
            category: 'Faculty',
          },
          {
            id: 'member-4',
            name: 'Mrs. Jackson Lopez',
            role: 'Vocational Trainer',
            imageUrl: 'https://i.pravatar.cc/150?u=trainer',
            description: 'Jackson provides digital classroom instruction and vocational training in computers, arts, and crafts.',
            category: 'Staff',
          }
        ]);
      }
    };
    fetchTeam();
  }, []);

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

        {/* ──── Leadership / Team Section ──── */}
        <section className="bg-muted/30 py-16 lg:py-20">
          <div className="section-container space-y-12">
            <ScrollReveal>
              <div className="text-center">
                <h2 className="text-2xl font-bold lg:text-3xl font-serif text-zinc-950">Our Leadership & Team</h2>
                <p className="mt-2 text-muted-foreground">Meet the dedicated educators and leaders guiding our children</p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, idx) => (
                <ScrollReveal key={member.id} delay={idx * 0.08}>
                  <Card className="card-hover border-none shadow-sm rounded-3xl overflow-hidden h-full bg-white flex flex-col justify-between">
                    <div>
                      <div className="relative aspect-square w-full bg-muted">
                        <img
                          src={member.imageUrl}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-primary text-white border-none uppercase font-bold text-[9px] tracking-wider px-2.5 py-1">
                            {member.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-5 space-y-2">
                        <h4 className="font-bold text-zinc-900 text-md">{member.name}</h4>
                        <p className="text-xs text-[#0F6D4E] font-bold tracking-wide">{member.role}</p>
                        <p className="text-xs text-zinc-500 leading-relaxed mt-2">{member.description}</p>
                      </div>
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ──── Photo Gallery Preview ──── */}
        <section className="section-container py-16 lg:py-20">
          <div className="space-y-12">
            <ScrollReveal>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold lg:text-3xl font-serif text-zinc-950">Photo Gallery</h2>
                  <p className="mt-2 text-muted-foreground">Moments that capture our spirit</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate('/gallery')}
                  className="rounded-full border-[#0F6D4E] text-[#0F6D4E] hover:bg-[#0F6D4E]/5 font-bold text-xs self-start sm:self-auto"
                >
                  View Full Gallery
                </Button>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
              {ashram.gallery?.slice(0, 3).map((image, idx) => (
                <ScrollReveal key={idx} delay={idx * 0.08}>
                  <div className="relative overflow-hidden rounded-2xl group aspect-video cursor-pointer" onClick={() => navigate('/gallery')}>
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

        {/* ──── Contact & Google Maps ──── */}
        <section className="bg-muted/30 py-16 lg:py-20">
          <div className="section-container space-y-12">
            <ScrollReveal>
              <div className="text-center">
                <h2 className="text-2xl font-bold lg:text-3xl font-serif text-zinc-950">Visit Us & Location</h2>
                <p className="mt-2 text-muted-foreground">Find directions to our school in Nagpur</p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:items-stretch">
              <ScrollReveal>
                <Card className="border-none shadow-sm rounded-3xl bg-white h-full flex flex-col justify-between">
                  <CardContent className="p-6 lg:p-8 space-y-6">
                    <h3 className="font-bold text-lg text-zinc-900 flex items-center gap-2 border-b pb-4">
                      <Phone className="h-5 w-5 text-[#0F6D4E]" />
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
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground font-semibold">{item.label}</p>
                            {item.href ? (
                              <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined} className="font-bold text-sm text-zinc-800 hover:text-primary transition-colors truncate block">
                                {item.value}
                              </a>
                            ) : (
                              <p className="font-bold text-sm text-zinc-800 leading-relaxed">{item.value}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>

              {/* Google Maps embed and Directions Button */}
              <ScrollReveal delay={0.1}>
                <Card className="border-none shadow-sm rounded-3xl bg-white p-4 flex flex-col justify-between gap-4 h-full">
                  <div className="relative overflow-hidden rounded-2xl bg-zinc-100 aspect-video flex-1 min-h-[220px]">
                    <iframe
                      title="Niswartha Location Map"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d119066.52982230485!2d79.00247348981146!3d21.139300975253805!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd4c0a5a3d0f0d5%3A0x2c64115049cfad7a!2sNagpur%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1719114751480!5m2!1sen!2sin"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <div className="flex gap-4">
                    <a
                      href="https://maps.google.com/?q=Deaf+and+Dumb+Industrial+Institute+Nagpur"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button className="w-full rounded-full bg-[#0F6D4E] hover:bg-[#0c593f] font-bold text-xs gap-1.5 h-11 text-white border-none shadow-sm">
                        Get Directions
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/donate/${ashram.id}`)}
                      className="flex-1 rounded-full border-primary text-primary hover:bg-primary/5 font-bold text-xs h-11"
                    >
                      Donate to Ashram
                    </Button>
                  </div>
                </Card>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
