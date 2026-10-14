import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Mail,
  Heart,
  Users,
  Award,
  BookOpen,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Bus,
  Home,
  Tv,
  Volume2,
  Trophy,
  Dumbbell,
  Smile,
  Calendar,
  IndianRupee,
  FileCheck,
  Compass,
  UserCheck,
  Rocket,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { mockAshrams } from '../data/mock';
import {
  ScrollReveal,
  BlurReveal,
  TextRevealGroup,
  TextRevealItem,
  ImageReveal,
  SectionTransition,
} from '../components/ScrollReveal';
import { PremiumHeroBackdrop } from '../components/home/PremiumHeroBackdrop';
import { AdBanner } from '../components/AdBanner';
import { api } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const DEFAULT_STAFF: any[] = [];

/**
 * Compact Single-Spot Member Showcase:
 * Displays staff members one by one in the same place
 * with smooth auto-cycle and manual prev/next navigation.
 */
function RotatingMemberCard({
  label,
  desc,
  members,
}: {
  label: string;
  desc: string;
  members: any[];
}) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (members.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % members.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [members.length, isPaused]);

  const current = members.length > 0 ? members[index % members.length] : null;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="border border-zinc-200/90 rounded-3xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
    >
      <div>
        {/* Category Header */}
        <div className="flex items-start gap-3.5 mb-5 pb-4 border-b border-zinc-100">
          <div className="h-11 w-11 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="font-serif font-bold text-base text-zinc-900 leading-snug">{label}</h3>
              <Badge className="bg-primary/10 text-primary border-none font-bold text-[10px] px-2 py-0.5">
                {members.length} Members
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{desc}</p>
          </div>
        </div>

        {/* Member Spot (Cycles in the exact same place) */}
        <div className="relative min-h-[92px] flex items-center">
          <AnimatePresence mode="wait">
            {current ? (
              <motion.div
                key={current.id || index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="w-full p-3.5 rounded-2xl bg-zinc-50/80 border border-zinc-200/70 flex items-center gap-3.5"
              >
                {current.imageUrl ? (
                  <img
                    src={current.imageUrl}
                    alt={current.name}
                    className="h-12 w-12 rounded-xl object-cover border border-primary/20 shrink-0 shadow-xs"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/25 text-primary flex items-center justify-center font-bold text-sm font-serif shrink-0 shadow-xs">
                    {current.name?.charAt(0)?.toUpperCase() || 'T'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-zinc-900 truncate">{current.name}</h4>
                    {current.since && (
                      <span className="text-[10px] font-mono text-zinc-500 bg-zinc-200/60 px-1.5 py-0.5 rounded-md shrink-0">
                        {current.since}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-primary font-semibold truncate mt-0.5">{current.role}</p>
                </div>
              </motion.div>
            ) : (
              <div className="text-xs text-zinc-400 italic p-4 text-center w-full">
                No members registered yet
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation & Indicator Bar */}
      {members.length > 1 && (
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-zinc-100 text-xs text-zinc-500">
          <span className="text-[11px] font-medium text-zinc-400">
            {index + 1} of {members.length}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIndex((prev) => (prev - 1 + members.length) % members.length)}
              className="h-7 w-7 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-600 transition-colors"
              title="Previous Member"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-1">
              {members.slice(0, 6).map((_, i) => (
                <span
                  key={i}
                  onClick={() => setIndex(i)}
                  className={cn(
                    'h-1.5 rounded-full transition-all cursor-pointer',
                    index === i ? 'w-4 bg-primary' : 'w-1.5 bg-zinc-200 hover:bg-zinc-300'
                  )}
                />
              ))}
            </div>
            <button
              onClick={() => setIndex((prev) => (prev + 1) % members.length)}
              className="h-7 w-7 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-600 transition-colors"
              title="Next Member"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function About() {
  const navigate = useNavigate();
  const ashram = mockAshrams[0];
  const [team, setTeam] = useState<any[]>(DEFAULT_STAFF);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamData, configData] = await Promise.all([
          api.getTeamMembers().catch(() => []),
          api.getConfig().catch(() => null),
        ]);
        if (teamData && teamData.length > 0) {
          setTeam(teamData);
        }
        if (configData) {
          setConfig(configData);
        }
      } catch {
        // fallback
      }
    };
    fetchData();
  }, []);

  const heroImage = config?.aboutHeroImgUrl || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80';
  const assemblyImage = config?.aboutAssemblyImgUrl || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80';
  const awardImage = config?.aboutAwardImgUrl || 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=1200&q=80';
  const principalImage = config?.aboutPrincipalImgUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80';

  const corePillars = [
    {
      title: 'Inclusive Education',
      description: 'We provide an inclusive learning environment where every hearing-impaired student is valued, supported, and given equal opportunities to succeed.',
      icon: Users,
    },
    {
      title: 'Student-Centered Approach',
      description: 'Our teaching methods focus on the individual needs, abilities, and overall development of each student.',
      icon: UserCheck,
    },
    {
      title: 'Respect and Dignity',
      description: 'We foster a culture of respect, empathy, and dignity for all students, parents, and staff members.',
      icon: Heart,
    },
    {
      title: 'Skill and Independence',
      description: 'We emphasize communication skills, vocational readiness, and life skills that help students become confident and independent.',
      icon: Rocket,
    },
  ];

  const facilities = [
    {
      title: 'Experienced Special Educators',
      description: 'Our Institute has qualified and specially trained teachers dedicated to the education and development of hearing-impaired students.',
      icon: GraduationCap,
    },
    {
      title: 'Outstanding Board Results',
      description: 'We proudly maintain a consistent record of 100% success in board examinations.',
      icon: Trophy,
    },
    {
      title: 'Free Uniforms & Textbooks',
      description: 'Students receive free uniforms and textbooks to support uninterrupted learning.',
      icon: BookOpen,
    },
    {
      title: 'Free Transportation & Disability Guidance',
      description: 'Free bus transportation is provided along with guidance for obtaining disability certification cards.',
      icon: Bus,
    },
    {
      title: 'Well-Equipped Academic Campus',
      description: 'The Institute offers a fully equipped building and learning environment aligned with the prescribed curriculum.',
      icon: Home,
    },
    {
      title: 'Separate Residential Facilities',
      description: 'Safe hostel accommodation is available for hearing-impaired boys and girls up to the age of 14 years.',
      icon: ShieldCheck,
    },
    {
      title: 'Digital Classrooms',
      description: 'Modern digital classrooms enhance interactive and effective learning experiences.',
      icon: Tv,
    },
    {
      title: 'Advanced Speech Therapy Support',
      description: 'Our updated speech therapy room helps improve communication and speech development.',
      icon: Volume2,
    },
    {
      title: 'Sports & Physical Activities',
      description: 'A well-developed playground and regular sports competitions promote physical fitness and teamwork.',
      icon: Dumbbell,
    },
    {
      title: 'Fitness & Yoga Training',
      description: 'Students benefit from modern exercise equipment and regular yoga sessions for holistic development.',
      icon: Smile,
    },
    {
      title: 'Hostel Recreation Facilities',
      description: 'Hostel students are provided with recreational facilities for balanced growth and relaxation.',
      icon: Sparkles,
    },
    {
      title: 'Regular Parent Engagement',
      description: 'Parent meetings are conducted twice a year along with proper guidance sessions.',
      icon: Calendar,
    },
    {
      title: 'Financial Aid & Scholarships',
      description: 'Needy and deserving students receive financial aid along with support from Social Welfare Department scholarship schemes.',
      icon: IndianRupee,
    },
    {
      title: 'Savitribai Phule Scholarship Support',
      description: 'Eligible students are guided and supported under the Savitribai Phule Scholarship Scheme.',
      icon: FileCheck,
    },
    {
      title: 'Higher Education Guidance',
      description: 'We provide dedicated guidance for hearing-impaired students pursuing higher education opportunities.',
      icon: Compass,
    },
    {
      title: 'Parent Counseling',
      description: 'Special counseling and structured guidance services are available for parents of children with disabilities.',
      icon: Heart,
    },
    {
      title: 'Competition & Career Guidance',
      description: 'Students receive mentoring for various competitions as well as career and job opportunities.',
      icon: Lightbulb,
    },
    {
      title: 'Post-Grade 12 Career Support',
      description: 'We provide continued guidance and support for students pursuing higher education after Grade 12.',
      icon: Award,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ════════════ Hero Section ════════════ */}
      <PremiumHeroBackdrop pageKey="about">
        <div className="section-container relative py-20 lg:py-28 text-left max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: staggered text reveal */}
            <TextRevealGroup className="lg:col-span-6 space-y-4" baseDelay={0.1} stagger={0.15}>
              <TextRevealItem>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-widest text-emerald-300 border border-white/15">
                  Play. Educate. Inspire. Empower
                </span>
              </TextRevealItem>
              <TextRevealItem>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  A safe and joyful place for your lovely children
                </h1>
              </TextRevealItem>
              <TextRevealItem>
                <p className="text-sm sm:text-base text-white/85 leading-relaxed max-w-xl">
                  The Deaf and Dumb Industrial Institute, established in 1946 in Nagpur, is dedicated to providing quality education, skill development, and holistic growth for hearing-impaired children from Grades 1 to 12 in a supportive and inclusive environment.
                </p>
              </TextRevealItem>
              <TextRevealItem>
                <div className="pt-2 flex items-center gap-3">
                  <a
                    href="mailto:ddingp1@gmail.com"
                    className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all"
                  >
                    <Mail className="h-4 w-4 text-emerald-400" /> ddingp1@gmail.com
                  </a>
                </div>
              </TextRevealItem>
            </TextRevealGroup>

            {/* Right: Wide, Clean Hero Image (Matching Screenshot 2 layout) */}
            <div className="lg:col-span-6">
              <ImageReveal
                src={heroImage}
                alt="Deaf and Dumb Industrial Institute Nagpur"
                from="right"
                delay={0.25}
                parallax={true}
                wrapperClassName="w-full aspect-[16/10] sm:aspect-[4/3] rounded-3xl shadow-2xl overflow-hidden"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </PremiumHeroBackdrop>

      <main className="flex-1 space-y-20 py-12">
        {/* ──── Why Families Choose Us (Clean 2-Column Like Screenshot 2) ──── */}
        <SectionTransition>
          <section className="section-container">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Column: Heading, Rich Content, and Stat Counters */}
              <div className="lg:col-span-6 space-y-6">
                <TextRevealGroup baseDelay={0} stagger={0.14}>
                  <TextRevealItem>
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">Why Families Choose Us</span>
                  </TextRevealItem>
                  <TextRevealItem>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-zinc-900 leading-tight">
                      Empowering hearing-impaired students with quality education and skills for an independent future
                    </h2>
                  </TextRevealItem>
                  <TextRevealItem blur={false}>
                    <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                      The Deaf and Dumb Industrial Institute, Nagpur, provides a structured and inclusive educational environment designed specifically for hearing-impaired students. Our experienced and specially trained teachers ensure that every child receives personalized attention and the opportunity to develop academic, communication, and life skills.
                    </p>
                  </TextRevealItem>
                </TextRevealGroup>

                {/* Stat counters */}
                <ScrollReveal delay={0.2} direction="up">
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-100">
                    {[
                      { val: '100%', label: 'Board Results' },
                      { val: '78+', label: 'Years Legacy' },
                      { val: '1 - 12', label: 'Grades Taught' },
                    ].map((s, i) => (
                      <motion.div
                        key={i}
                        className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/70 text-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <p className="font-serif font-bold text-2xl sm:text-3xl text-primary">{s.val}</p>
                        <p className="text-[11px] font-semibold text-zinc-600 mt-0.5">{s.label}</p>
                      </motion.div>
                    ))}
                  </div>
                </ScrollReveal>
              </div>

              {/* Right Column: Wide, Clean Assembly Image (No boxed borders, normal & simple like Screenshot 2) */}
              <div className="lg:col-span-6">
                <ImageReveal
                  src={assemblyImage}
                  alt="School Assembly and Ground Activities"
                  from="right"
                  delay={0.2}
                  parallax={true}
                  wrapperClassName="w-full aspect-[16/10] sm:aspect-[4/3] rounded-3xl shadow-xl overflow-hidden"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </section>
        </SectionTransition>

        {/* ──── Key Academic Highlights ──── */}
        <section className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Specialized Special Educators',
                description: 'Qualified and specially trained teachers who provide sign-language and speech-therapy personalized development.',
                icon: GraduationCap,
                tag: 'Academics',
              },
              {
                title: 'Free Uniforms, Textbooks & Hostels',
                description: 'Full residential accommodation for hearing-impaired boys and girls with free school resources and bus transport.',
                icon: ShieldCheck,
                tag: 'Campus Care',
              },
              {
                title: 'Digital Classrooms & Speech Labs',
                description: 'State-of-the-art speech therapy rooms, audio testing equipment, and digital interactive visual displays.',
                icon: Volume2,
                tag: 'Facilities',
              },
            ].map((feat, i) => (
              <ScrollReveal key={i} delay={i * 0.12} direction="up" blur>
                <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 hover:border-primary/40 shadow-xs hover:shadow-md transition-all duration-300 flex items-start gap-4 group h-full">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <feat.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-base text-zinc-900 group-hover:text-primary transition-colors">
                        {feat.title}
                      </h4>
                      <Badge className="bg-primary/10 text-primary border-none text-[9px] uppercase font-bold px-2 py-0.5">
                        {feat.tag}
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ──── National Award Recognition (Wide & Clean, No Boxed Borders) ──── */}
        <SectionTransition delay={0.05}>
          <section className="section-container">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Award Image Reveal (Left, Wide Aspect Ratio, Normal & Simple) */}
              <div className="lg:col-span-6">
                <ImageReveal
                  src={awardImage}
                  alt="National Award Certificate"
                  from="left"
                  delay={0.1}
                  parallax={true}
                  wrapperClassName="w-full aspect-[16/10] sm:aspect-[4/3] rounded-3xl shadow-xl overflow-hidden"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Text Stagger (Right) */}
              <TextRevealGroup className="lg:col-span-6 space-y-5" baseDelay={0.15} stagger={0.14}>
                <TextRevealItem>
                  <Badge className="bg-primary text-primary-foreground border-none uppercase font-bold text-xs tracking-wider px-3.5 py-1 shadow-sm">
                    Government Recognition
                  </Badge>
                </TextRevealItem>
                <TextRevealItem>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-zinc-900 leading-tight">
                    National Award for Welfare of Persons with Disabilities
                  </h2>
                </TextRevealItem>
                <TextRevealItem blur={false}>
                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                    The Deaf and Dumb Industrial Institute has been honored with the prestigious National Award by the Government of India, Ministry of Welfare, in recognition of its dedicated service and outstanding contribution towards the education and empowerment of hearing-impaired students.
                  </p>
                </TextRevealItem>
              </TextRevealGroup>
            </div>
          </section>
        </SectionTransition>

        {/* ──── Principal's Message ──── */}
        <SectionTransition delay={0.05}>
          <section className="section-container">
            <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-zinc-50 via-secondary/20 to-zinc-50 border border-zinc-200/80 shadow-xs">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Principal Photo */}
                <div className="lg:col-span-4 flex justify-center">
                  <ImageReveal
                    src={principalImage}
                    alt="Dr. Meenal Sudhir Sangole"
                    from="down"
                    delay={0.1}
                    wrapperClassName="relative h-44 w-44 sm:h-56 sm:w-56 rounded-full border-4 border-primary shadow-xl mx-auto overflow-hidden"
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                {/* Quote Stagger */}
                <TextRevealGroup className="lg:col-span-8 space-y-4 text-center lg:text-left" baseDelay={0.2} stagger={0.15}>
                  <TextRevealItem>
                    <span className="text-4xl font-serif text-primary">"</span>
                  </TextRevealItem>
                  <TextRevealItem blur={false}>
                    <blockquote className="text-base sm:text-lg font-serif italic text-zinc-800 leading-relaxed">
                      At the Deaf and Dumb Industrial Institute, our mission is to provide every hearing-impaired student with quality education, confidence, and the skills needed for an independent future. We are committed to creating a supportive and inclusive environment where each student is encouraged to achieve their fullest potential.
                    </blockquote>
                  </TextRevealItem>
                  <TextRevealItem>
                    <div>
                      <h4 className="font-bold text-lg text-zinc-900">Dr. Meenal Sudhir Sangole (Principal - Since 1993)</h4>
                      <p className="text-xs text-primary font-bold uppercase tracking-wider mt-0.5">School Principal and Academic Lead</p>
                    </div>
                  </TextRevealItem>
                </TextRevealGroup>
              </div>
            </div>
          </section>
        </SectionTransition>

        {/* ──── Dedicated Team Section (Compact One-by-One Showcase) ──── */}
        <section className="bg-gradient-to-b from-white via-secondary/20 to-zinc-50/80 py-16 border-y border-primary/10 overflow-hidden">
          <div className="space-y-10">
            <TextRevealGroup className="section-container text-center max-w-3xl mx-auto space-y-3" stagger={0.14}>
              <TextRevealItem>
                <div className="flex items-center justify-center">
                  <Badge className="bg-primary/10 text-primary border border-primary/20 uppercase font-bold text-xs tracking-wider px-3.5 py-1">
                    Our Dedicated Team
                  </Badge>
                </div>
              </TextRevealItem>
              <TextRevealItem>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-zinc-900">
                  Meet the Staff Guiding Our Children
                </h2>
              </TextRevealItem>
              <TextRevealItem blur={false}>
                <p className="text-xs text-zinc-500">
                  Special Educators, Art Instructors, Hostel Superintendents, Caretakers, and Support Staff serving since 1989.
                </p>
              </TextRevealItem>
            </TextRevealGroup>

            {/* Continuous Marquee Banner */}
            <ScrollReveal direction="up" delay={0.1}>
              <div className="relative w-full overflow-hidden py-4 bg-white border-y border-primary/10 shadow-xs">
                <div
                  className="flex gap-6 animate-marquee whitespace-nowrap"
                  style={{ animationDuration: `${config?.marqueeSpeed || 35}s` }}
                >
                  {[...team, ...team, ...team].map((m, idx) => (
                    <div
                      key={`${m.id}-${idx}`}
                      className="inline-flex items-center gap-3 bg-zinc-50/80 border border-primary/20 px-4 py-2.5 rounded-2xl min-w-[230px] shadow-xs hover:border-primary/40 transition-colors shrink-0"
                    >
                      {m.imageUrl ? (
                        <img
                          src={m.imageUrl}
                          alt={m.name}
                          className="h-10 w-10 rounded-full object-cover border border-primary/40 shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/30 text-primary flex items-center justify-center font-bold text-xs font-serif shrink-0">
                          {m.name?.charAt(0)?.toUpperCase() || 'T'}
                        </div>
                      )}
                      <div className="text-left">
                        <p className="text-xs font-bold text-zinc-900 truncate max-w-[140px]">{m.name}</p>
                        <p className="text-[10px] text-primary font-semibold">{m.role} {m.since ? `(${m.since})` : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Team Category Cards — Rotating One by One in the Same Place */}
            <div className="section-container max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { key: 'Management', label: 'Management & Leadership', desc: 'School Principal & Academic Leads' },
                  { key: 'Faculty', label: 'Special Educators & Faculty', desc: 'Qualified Special Teachers & Art Instructors' },
                  { key: 'Staff', label: 'Support Staff & Caretakers', desc: 'Hostel Superintendents & Administrative Staff' },
                ].map((cat, ci) => {
                  const members = team.filter((m) => m.category === cat.key);
                  return (
                    <ScrollReveal key={cat.key} delay={ci * 0.12} direction="up" blur>
                      <RotatingMemberCard
                        label={cat.label}
                        desc={cat.desc}
                        members={members}
                      />
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ──── Core Pillars ──── */}
        <section className="bg-zinc-50 py-16">
          <div className="section-container space-y-10">
            <TextRevealGroup className="text-center max-w-3xl mx-auto space-y-3" stagger={0.14}>
              <TextRevealItem>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900">
                  We Are Committed to Empowering Hearing-Impaired Students
                </h2>
              </TextRevealItem>
              <TextRevealItem>
                <p className="text-sm font-bold text-primary">
                  Every student deserves the right support during their most important learning years.
                </p>
              </TextRevealItem>
              <TextRevealItem blur={false}>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  The Deaf and Dumb Industrial Institute, Nagpur, is dedicated to providing inclusive and specialized education for hearing-impaired students from Grades 1 to 12. With a legacy dating back to 1946, the Institute focuses on academic excellence, communication development, and skill-based learning in a safe and supportive environment.
                </p>
              </TextRevealItem>
            </TextRevealGroup>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {corePillars.map((pillar, idx) => (
                <ScrollReveal key={idx} delay={idx * 0.1} direction="up" blur>
                  <Card className="border border-zinc-200/80 shadow-sm hover:shadow-md transition-shadow h-full rounded-2xl bg-white">
                    <CardContent className="p-6 space-y-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <pillar.icon className="h-5 w-5" />
                      </div>
                      <h4 className="font-bold text-sm text-zinc-900">{pillar.title}</h4>
                      <p className="text-xs text-zinc-500 leading-relaxed">{pillar.description}</p>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ──── Vision and Mission ──── */}
        <section className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ScrollReveal direction="left" blur delay={0}>
              <Card className="border border-primary/20 shadow-md bg-gradient-to-br from-white to-secondary/40 rounded-3xl p-8">
                <CardContent className="p-0 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/20">
                      V
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary uppercase tracking-widest">Vision Statement</p>
                      <h3 className="text-lg font-serif font-bold text-zinc-900">Our Vision</h3>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-zinc-700 font-serif leading-relaxed">
                    To empower hearing-impaired students through quality education and holistic development, enabling them to lead confident and independent lives.
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal direction="right" blur delay={0.1}>
              <Card className="border border-primary/20 shadow-md bg-gradient-to-br from-white to-secondary/40 rounded-3xl p-8">
                <CardContent className="p-0 space-y-4 min-h-[167px]">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/20">
                      M
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary uppercase tracking-widest">Mission Statement</p>
                      <h3 className="text-lg font-serif font-bold text-zinc-900">Our Mission</h3>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-zinc-700 font-serif leading-relaxed">
                    To deliver accessible, student-centered education and skill development that empowers hearing-impaired learners to reach their full potential.
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </section>

        {/* ──── Admission 1-2-3 ──── */}
        <SectionTransition delay={0.05}>
          <section className="section-container">
            <div className="rounded-3xl p-8 sm:p-12 bg-white border border-zinc-200/80 shadow-xs space-y-8">
              <TextRevealGroup className="text-center max-w-2xl mx-auto space-y-2" stagger={0.14}>
                <TextRevealItem>
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">Admission & Community</span>
                </TextRevealItem>
                <TextRevealItem>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900">
                    Connecting with Our Institute as Easy as 1-2-3
                  </h2>
                </TextRevealItem>
                <TextRevealItem blur={false}>
                  <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                    We welcome parents, donors, and volunteers to participate in the growth and empowerment of our hearing-impaired students.
                  </p>
                </TextRevealItem>
              </TextRevealGroup>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    step: '01',
                    title: 'Schedule Visit or Inquire',
                    description: 'Book an ashram visit online or call our team to learn about admissions and our educational curriculum.',
                  },
                  {
                    step: '02',
                    title: 'Campus Tour & Child Evaluation',
                    description: 'Meet our experienced educators and speech therapists for a tailored assessment of the child\'s learning needs.',
                  },
                  {
                    step: '03',
                    title: 'Empowerment & Growth',
                    description: 'Students join an uplifting, inclusive family environment with free lodging, books, and career guidance.',
                  },
                ].map((item, idx) => (
                  <ScrollReveal key={idx} delay={idx * 0.1} direction="up" blur>
                    <div className="p-6 rounded-2xl bg-zinc-50/70 border border-zinc-200/70 relative space-y-3 hover:bg-white hover:border-primary/30 transition-all shadow-xs">
                      <span className="font-serif font-bold text-3xl text-primary/40 block">
                        {item.step}
                      </span>
                      <h3 className="font-serif font-bold text-base text-zinc-900">
                        {item.title}
                      </h3>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        </SectionTransition>

        {/* ──── Key Facilities and Student Support (With in-place hover popup) ──── */}
        <section className="bg-zinc-50 py-16 border-y border-zinc-200/80 overflow-hidden">
          <div className="space-y-8">
            <TextRevealGroup className="section-container text-center space-y-2" stagger={0.14}>
              <TextRevealItem>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900">
                  Key Facilities and Student Support
                </h2>
              </TextRevealItem>
              <TextRevealItem blur={false}>
                <p className="text-xs text-zinc-500">Comprehensive resources empowering hearing-impaired learners • Hover to read complete details</p>
              </TextRevealItem>
            </TextRevealGroup>

            {/* Marquee Wrapper with Edge Fade Masks */}
            <div className="relative w-full overflow-hidden py-2 space-y-4">
              <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-zinc-50 via-zinc-50/80 to-transparent z-10 pointer-events-none" />
              <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-zinc-50 via-zinc-50/80 to-transparent z-10 pointer-events-none" />

              {/* Row 1: Moves Left */}
              <div className="flex overflow-hidden group/row1">
                <div
                  className="flex gap-4 animate-marquee whitespace-nowrap group-hover/row1:[animation-play-state:paused] hover:[animation-play-state:paused]"
                  style={{ animationDuration: '28s' }}
                >
                  {[...facilities.slice(0, 6), ...facilities.slice(0, 6), ...facilities.slice(0, 6), ...facilities.slice(0, 6)].map((fac, idx) => (
                    <div
                      key={`row1-${idx}`}
                      className="inline-flex items-start gap-3 bg-white border border-zinc-200/80 hover:border-primary/40 p-4 rounded-2xl min-w-[280px] max-w-[340px] sm:min-w-[320px] shadow-xs hover:shadow-md transition-all duration-300 group/card shrink-0 relative"
                    >
                      <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 group-hover/card:bg-primary group-hover/card:text-primary-foreground transition-colors mt-0.5">
                        <fac.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <h4 className="font-bold text-xs text-zinc-900 group-hover/card:text-primary transition-colors leading-snug">{fac.title}</h4>
                        <p className="text-[11px] text-zinc-500 leading-relaxed mt-1 line-clamp-2">{fac.description}</p>
                      </div>

                      {/* Hover pop-up in same place displaying complete text */}
                      <div className="absolute inset-0 bg-white border-2 border-primary/80 p-3.5 rounded-2xl shadow-xl z-20 opacity-0 pointer-events-none group-hover/card:opacity-100 group-hover/card:pointer-events-auto transition-all duration-200 flex items-start gap-3 whitespace-normal">
                        <div className="h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          <fac.icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1 text-left overflow-y-auto max-h-[85px] scrollbar-hide">
                          <h4 className="font-bold text-xs text-primary leading-tight">{fac.title}</h4>
                          <p className="text-[11px] text-zinc-700 leading-snug mt-1 font-medium">{fac.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 2: Moves Right */}
              <div className="flex overflow-hidden group/row2">
                <div
                  className="flex gap-4 animate-marquee-reverse whitespace-nowrap group-hover/row2:[animation-play-state:paused] hover:[animation-play-state:paused]"
                  style={{ animationDuration: '34s' }}
                >
                  {[...facilities.slice(6, 12), ...facilities.slice(6, 12), ...facilities.slice(6, 12), ...facilities.slice(6, 12)].map((fac, idx) => (
                    <div
                      key={`row2-${idx}`}
                      className="inline-flex items-start gap-3 bg-white border border-zinc-200/80 hover:border-primary/40 p-4 rounded-2xl min-w-[280px] max-w-[340px] sm:min-w-[320px] shadow-xs hover:shadow-md transition-all duration-300 group/card shrink-0 relative"
                    >
                      <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 group-hover/card:bg-primary group-hover/card:text-primary-foreground transition-colors mt-0.5">
                        <fac.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <h4 className="font-bold text-xs text-zinc-900 group-hover/card:text-primary transition-colors leading-snug">{fac.title}</h4>
                        <p className="text-[11px] text-zinc-500 leading-relaxed mt-1 line-clamp-2">{fac.description}</p>
                      </div>

                      {/* Hover pop-up in same place displaying complete text */}
                      <div className="absolute inset-0 bg-white border-2 border-primary/80 p-3.5 rounded-2xl shadow-xl z-20 opacity-0 pointer-events-none group-hover/card:opacity-100 group-hover/card:pointer-events-auto transition-all duration-200 flex items-start gap-3 whitespace-normal">
                        <div className="h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          <fac.icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1 text-left overflow-y-auto max-h-[85px] scrollbar-hide">
                          <h4 className="font-bold text-xs text-primary leading-tight">{fac.title}</h4>
                          <p className="text-[11px] text-zinc-700 leading-snug mt-1 font-medium">{fac.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 3: Moves Left */}
              <div className="flex overflow-hidden group/row3">
                <div
                  className="flex gap-4 animate-marquee whitespace-nowrap group-hover/row3:[animation-play-state:paused] hover:[animation-play-state:paused]"
                  style={{ animationDuration: '26s' }}
                >
                  {[...facilities.slice(12, 18), ...facilities.slice(12, 18), ...facilities.slice(12, 18), ...facilities.slice(12, 18)].map((fac, idx) => (
                    <div
                      key={`row3-${idx}`}
                      className="inline-flex items-start gap-3 bg-white border border-zinc-200/80 hover:border-primary/40 p-4 rounded-2xl min-w-[280px] max-w-[340px] sm:min-w-[320px] shadow-xs hover:shadow-md transition-all duration-300 group/card shrink-0 relative"
                    >
                      <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 group-hover/card:bg-primary group-hover/card:text-primary-foreground transition-colors mt-0.5">
                        <fac.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <h4 className="font-bold text-xs text-zinc-900 group-hover/card:text-primary transition-colors leading-snug">{fac.title}</h4>
                        <p className="text-[11px] text-zinc-500 leading-relaxed mt-1 line-clamp-2">{fac.description}</p>
                      </div>

                      {/* Hover pop-up in same place displaying complete text */}
                      <div className="absolute inset-0 bg-white border-2 border-primary/80 p-3.5 rounded-2xl shadow-xl z-20 opacity-0 pointer-events-none group-hover/card:opacity-100 group-hover/card:pointer-events-auto transition-all duration-200 flex items-start gap-3 whitespace-normal">
                        <div className="h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          <fac.icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1 text-left overflow-y-auto max-h-[85px] scrollbar-hide">
                          <h4 className="font-bold text-xs text-primary leading-tight">{fac.title}</h4>
                          <p className="text-[11px] text-zinc-700 leading-snug mt-1 font-medium">{fac.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="section-container text-center text-[11px] text-zinc-400 pt-2">
              We admit hearing-impaired students from Grades 1 to 12 based on age eligibility and educational assessment.
            </p>
          </div>
        </section>

        <div className="section-container">
          <AdBanner placement="about_bottom" />
        </div>
      </main>
    </div>
  );
}
