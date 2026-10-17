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
  Palette,
  Music,
  CheckCircle2,
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
import { SchoolDoodleArt } from '../components/SchoolDoodleArt';
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
              <h3 className="font-poppins font-bold text-base text-zinc-900 leading-snug">{label}</h3>
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
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/25 text-primary flex items-center justify-center font-bold text-sm font-poppins shrink-0 shadow-xs">
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

import { useConfig } from '../context/ConfigContext';

export function About() {
  const navigate = useNavigate();
  const ashram = mockAshrams[0];
  const [team, setTeam] = useState<any[]>(DEFAULT_STAFF);
  const { config } = useConfig();

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const teamData = await api.getTeamMembers().catch(() => []);
        if (active && teamData && teamData.length > 0) {
          setTeam(teamData);
        }
      } catch {
        // fallback
      }
    };
    fetchData();
    return () => {
      active = false;
    };
  }, []);

  const heroImage = config?.aboutHeroImgUrl || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=75&fm=webp';
  const assemblyImage = config?.aboutAssemblyImgUrl || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=900&q=75&fm=webp';
  const awardImage = config?.aboutAwardImgUrl || 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=900&q=75&fm=webp';
  const principalImage = config?.aboutPrincipalImgUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=75&fm=webp';
  const principalName = config?.aboutPrincipalName || 'Dr. Meenal Sudhir Sangole';
  const principalRole = config?.aboutPrincipalRole || 'Principal (Deaf and Dumb Industrial Institute, Nagpur)';
  const principalBio = config?.aboutPrincipalBio || 'Serving as Principal since 1993, Dr. Sangole has led the institution with immense dedication, maintaining a consistent 100% board examination record and empowering every student with self-reliance, academic excellence, and joyful socialization.';

  // Alternating Education Section Images (Matching Screenshot 3) - Optimized WebP
  const sportsImage = config?.aboutSportsImgUrl || 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800&q=75&fm=webp';
  const culturalImage = config?.aboutCulturalImgUrl || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=75&fm=webp';
  const artImage = config?.aboutArtImgUrl || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=75&fm=webp';
  const digitalImage = config?.aboutDigitalImgUrl || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=75&fm=webp';

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
    <div className="flex flex-col min-h-screen bg-background font-sans">
      {/* ════════════ Hero Section ════════════ */}
      <PremiumHeroBackdrop pageKey="about">
        <div className="section-container relative py-20 lg:py-28 text-left max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: staggered text reveal sliding upward */}
            <TextRevealGroup className="lg:col-span-6 space-y-4" baseDelay={0.1} stagger={0.15}>
              <TextRevealItem>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-widest text-emerald-300 border border-white/15">
                  Play. Educate. Inspire. Empower
                </span>
              </TextRevealItem>
              <TextRevealItem>
                <h1 className="font-poppins text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
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

            {/* Right: Corner-Sliding Hero Image */}
            <div className="lg:col-span-6">
              <ImageReveal
                src={heroImage}
                alt="Deaf and Dumb Industrial Institute Nagpur"
                from="corner-right"
                delay={0.25}
                parallax={true}
                wrapperClassName="w-full aspect-[16/10] sm:aspect-[4/3] rounded-3xl shadow-2xl overflow-hidden"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </PremiumHeroBackdrop>

      <main className="flex-1 space-y-24 py-12">
        {/* ════════════ Screenshot 2: "About Our School" with Doodle Art ════════════ */}
        <SectionTransition>
          <section className="section-container">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Title & 4 Quick Facts with cute colored badges */}
              <div className="lg:col-span-6 space-y-8">
                <TextRevealGroup baseDelay={0} stagger={0.14}>
                  <TextRevealItem>
                    <h2 className="font-poppins text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 tracking-tight">
                      About Our School
                    </h2>
                  </TextRevealItem>
                </TextRevealGroup>

                {/* 4 School Highlights List (Matching Screenshot 2 layout) */}
                <div className="relative pl-2 space-y-7">
                  {/* Subtle connecting vertical line */}
                  <div className="absolute left-[29px] top-4 bottom-6 w-0.5 bg-zinc-200" />

                  {[
                    {
                      label: 'Establishment',
                      val: '1st September 1946 (78+ Years Legacy)',
                      icon: Home,
                      iconBg: 'bg-amber-100 text-amber-700 border-amber-200',
                    },
                    {
                      label: 'Manage by',
                      val: 'The Deaf and Dumb Industrial Institute, Nagpur',
                      icon: Users,
                      iconBg: 'bg-blue-100 text-blue-700 border-blue-200',
                    },
                    {
                      label: 'No. of Students',
                      val: '150+ Hearing-Impaired Students (Grades 1 to 12)',
                      icon: GraduationCap,
                      iconBg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                    },
                    {
                      label: 'Teachers & Staff',
                      val: '18 specially trained Teachers, Special Educators, Physical Trainers & Support Staff',
                      icon: Heart,
                      iconBg: 'bg-rose-100 text-rose-700 border-rose-200',
                    },
                  ].map((item, i) => (
                    <ScrollReveal key={i} delay={i * 0.12} direction="up" blur>
                      <div className="relative flex items-start gap-4 group">
                        <div className={cn(
                          'h-11 w-11 rounded-2xl border flex items-center justify-center shrink-0 z-10 transition-transform duration-300 group-hover:scale-110 shadow-xs',
                          item.iconBg
                        )}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 pt-0.5">
                          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{item.label}</p>
                          <p className="font-poppins font-medium text-sm sm:text-base text-zinc-900 mt-0.5 leading-snug">
                            {item.val}
                          </p>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>

              {/* Right Column: Doodle Art (Students studying at desk with window, books & plant) */}
              <div className="lg:col-span-6 flex justify-center">
                <ScrollReveal delay={0.2} direction="corner-right">
                  <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-zinc-50/70 border border-zinc-200/70 shadow-xs hover:shadow-md transition-shadow">
                    <SchoolDoodleArt className="w-full h-auto max-w-md mx-auto" />
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </section>
        </SectionTransition>

        {/* ════════════ Screenshot 3: Alternating Visual Education Modules ════════════ */}
        {/* Module 1: Sports Education (Soft Mint Tint) */}
        <section className="bg-[#f0fbf7] py-16 border-y border-emerald-900/5 overflow-hidden">
          <div className="section-container">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
              {/* Image sliding from bottom-left corner */}
              <div className="lg:col-span-6 order-2 lg:order-1">
                <ImageReveal
                  src={sportsImage}
                  alt="Sports Education & Playground"
                  from="corner-left"
                  delay={0.1}
                  parallax={true}
                  wrapperClassName="w-full aspect-[16/10] sm:aspect-[4/3] rounded-3xl shadow-xl overflow-hidden"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Text sliding upward */}
              <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
                <TextRevealGroup baseDelay={0.1} stagger={0.16}>
                  <TextRevealItem>
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">Fitness & Teamwork</span>
                  </TextRevealItem>
                  <TextRevealItem>
                    <h3 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 leading-tight">
                      Sports Education
                    </h3>
                  </TextRevealItem>
                  <TextRevealItem blur={false}>
                    <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                      Physical & sports education are an essential part of teaching our children.
                    </p>
                  </TextRevealItem>
                  <TextRevealItem blur={false}>
                    <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                      Children are taught yoga, pranayam, and various indoor & outdoor games, which helps them maintain their physical health, develop athletic discipline, and build strong camaraderie.
                    </p>
                  </TextRevealItem>
                </TextRevealGroup>
              </div>
            </div>
          </div>
        </section>

        {/* Module 2: Cultural Education (Pure Clean White) */}
        <section className="bg-white py-16 overflow-hidden">
          <div className="section-container">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
              {/* Text sliding upward */}
              <div className="lg:col-span-6 space-y-4">
                <TextRevealGroup baseDelay={0.1} stagger={0.16}>
                  <TextRevealItem>
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">Creative Expression</span>
                  </TextRevealItem>
                  <TextRevealItem>
                    <h3 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 leading-tight">
                      Cultural Education
                    </h3>
                  </TextRevealItem>
                  <TextRevealItem blur={false}>
                    <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                      Children are taught various cultural programmes like dance, drama, and mimicry to increase their self-confidence & knowledge about various cultures.
                    </p>
                  </TextRevealItem>
                  <TextRevealItem blur={false}>
                    <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                      Annual cultural gatherings and stage performances give every hearing-impaired child a voice, encouraging stage presence, joyful rhythm, and pride in our rich cultural heritage.
                    </p>
                  </TextRevealItem>
                </TextRevealGroup>
              </div>

              {/* Image sliding from bottom-right corner */}
              <div className="lg:col-span-6">
                <ImageReveal
                  src={culturalImage}
                  alt="Cultural Education & Dance"
                  from="corner-right"
                  delay={0.1}
                  parallax={true}
                  wrapperClassName="w-full aspect-[16/10] sm:aspect-[4/3] rounded-3xl shadow-xl overflow-hidden"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Module 3: Art & Craft Education (Soft Lavender Tint) */}
        <section className="bg-[#f5f3ff] py-16 border-y border-indigo-900/5 overflow-hidden">
          <div className="section-container">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
              {/* Image sliding from bottom-left corner */}
              <div className="lg:col-span-6 order-2 lg:order-1">
                <ImageReveal
                  src={artImage}
                  alt="Art & Craft Education"
                  from="corner-left"
                  delay={0.1}
                  parallax={true}
                  wrapperClassName="w-full aspect-[16/10] sm:aspect-[4/3] rounded-3xl shadow-xl overflow-hidden"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Text sliding upward */}
              <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
                <TextRevealGroup baseDelay={0.1} stagger={0.16}>
                  <TextRevealItem>
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-700">Vocational Skills</span>
                  </TextRevealItem>
                  <TextRevealItem>
                    <h3 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 leading-tight">
                      Art & Craft Education
                    </h3>
                  </TextRevealItem>
                  <TextRevealItem blur={false}>
                    <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                      Children are taught various art & craft items like greetings, paintings, candles, files, ceramic items, and bead work to improve their creativity.
                    </p>
                  </TextRevealItem>
                  <TextRevealItem blur={false}>
                    <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                      Handmade items created by our students are proudly showcased during school exhibitions, fostering practical craftsmanship that helps them become self-independent.
                    </p>
                  </TextRevealItem>
                </TextRevealGroup>
              </div>
            </div>
          </div>
        </section>

        {/* Module 4: Speech Therapy & Digital Classrooms (Clean Off-White) */}
        <section className="bg-white py-16 overflow-hidden">
          <div className="section-container">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
              {/* Text sliding upward */}
              <div className="lg:col-span-6 space-y-4">
                <TextRevealGroup baseDelay={0.1} stagger={0.16}>
                  <TextRevealItem>
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">Modern Learning</span>
                  </TextRevealItem>
                  <TextRevealItem>
                    <h3 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 leading-tight">
                      Speech & Digital Education
                    </h3>
                  </TextRevealItem>
                  <TextRevealItem blur={false}>
                    <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                      Our updated speech therapy rooms and specialized audiometric trainers help children develop lip-reading, articulation, and residual hearing abilities.
                    </p>
                  </TextRevealItem>
                  <TextRevealItem blur={false}>
                    <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                      Interactive digital projectors and computer labs provide visual learning experiences, enabling students to master digital literacy and modern technology tools.
                    </p>
                  </TextRevealItem>
                </TextRevealGroup>
              </div>

              {/* Image sliding from bottom-right corner */}
              <div className="lg:col-span-6">
                <ImageReveal
                  src={digitalImage}
                  alt="Speech Therapy & Digital Classrooms"
                  from="corner-right"
                  delay={0.1}
                  parallax={true}
                  wrapperClassName="w-full aspect-[16/10] sm:aspect-[4/3] rounded-3xl shadow-xl overflow-hidden"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ════════════ Screenshot 1: Principal Intro & Inspiring Quote ════════════ */}
        <section className="bg-[#0b110e] text-white py-20 lg:py-28 overflow-hidden relative" style={{ contain: 'paint' }}>
          {/* Ambient subtle light glows with GPU acceleration */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none will-change-transform" aria-hidden="true" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none will-change-transform" aria-hidden="true" />

          <div className="section-container relative z-10 space-y-16 max-w-6xl mx-auto">
            {/* Top Full-Width Underlined Quote (Matching Screenshot 1 exactly) */}
            <TextRevealGroup baseDelay={0.05} stagger={0.15}>
              <TextRevealItem>
                <div className="max-w-4xl mx-auto text-left sm:text-center">
                  <h2 className="font-poppins font-medium text-xl sm:text-2xl lg:text-3xl text-white leading-relaxed tracking-tight underline decoration-white/20 underline-offset-8">
                    We not only teach our students the knowledge that they need, but also to provide them with a sense of socialization. We have teachers who are skilled in sign language and have experience working with the deaf community.
                  </h2>
                </div>
              </TextRevealItem>
            </TextRevealGroup>

            {/* Principal Card & Bio Layout (Matching Screenshot 1) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Offset peach/terracotta backdrop card with rectangular photo */}
              <div className="lg:col-span-5 flex justify-center lg:justify-start">
                <div className="relative w-full max-w-sm sm:max-w-md">
                  {/* Offset Warm Terracotta Backdrop Card */}
                  <div className="absolute -top-4 -left-4 w-full h-full rounded-3xl bg-[#F8C1AA] shadow-lg transform -rotate-1" />
                  
                  {/* Photo of Principal sliding in from corner-left */}
                  <ImageReveal
                    src={principalImage}
                    alt={principalName}
                    from="corner-left"
                    delay={0.15}
                    wrapperClassName="relative rounded-3xl shadow-2xl overflow-hidden aspect-[4/3] sm:aspect-[1/1] z-10"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              {/* Right Column: Clean Headings & Concise Paragraphs */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <TextRevealGroup baseDelay={0.15} stagger={0.15}>
                  <TextRevealItem>
                    <div>
                      <h3 className="font-poppins font-bold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
                        {principalName}
                      </h3>
                      <p className="text-sm sm:text-base text-emerald-400 font-medium mt-1">
                        {principalRole}
                      </p>
                    </div>
                  </TextRevealItem>

                  <TextRevealItem blur={false}>
                    <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                      The Deaf and Dumb Industrial Institute, Nagpur, was established in 1946 by selfless, sincere, and philanthropic individuals from different walks of life who thought it worthwhile to serve the community by starting specialized education for hearing-impaired children.
                    </p>
                  </TextRevealItem>

                  <TextRevealItem blur={false}>
                    <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                      {principalBio}
                    </p>
                  </TextRevealItem>
                </TextRevealGroup>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════ National Award Recognition ════════════ */}
        <SectionTransition delay={0.05}>
          <section className="section-container">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Award Image Reveal (Left, Corner Sliding) */}
              <div className="lg:col-span-6">
                <ImageReveal
                  src={awardImage}
                  alt="National Award Certificate"
                  from="corner-left"
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
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-poppins font-bold text-zinc-900 leading-tight">
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

        {/* ════════════ Dedicated Team Section (Compact One-by-One Showcase) ════════════ */}
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
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-poppins font-bold text-zinc-900">
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
                        <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/30 text-primary flex items-center justify-center font-bold text-xs font-poppins shrink-0">
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

        {/* ════════════ Key Facilities and Student Support (With in-place hover popup) ════════════ */}
        <section className="bg-zinc-50 py-16 border-y border-zinc-200/80 overflow-hidden">
          <div className="space-y-8">
            <TextRevealGroup className="section-container text-center space-y-2" stagger={0.14}>
              <TextRevealItem>
                <h2 className="text-2xl sm:text-3xl font-poppins font-bold text-zinc-900">
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

        {/* ════════════ Admission 1-2-3 ════════════ */}
        <SectionTransition delay={0.05}>
          <section className="section-container">
            <div className="rounded-3xl p-8 sm:p-12 bg-white border border-zinc-200/80 shadow-xs space-y-8">
              <TextRevealGroup className="text-center max-w-2xl mx-auto space-y-2" stagger={0.14}>
                <TextRevealItem>
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">Admission & Community</span>
                </TextRevealItem>
                <TextRevealItem>
                  <h2 className="text-2xl sm:text-3xl font-poppins font-bold text-zinc-900">
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
                      <span className="font-poppins font-bold text-3xl text-primary/40 block">
                        {item.step}
                      </span>
                      <h3 className="font-poppins font-bold text-base text-zinc-900">
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
      </main>
    </div>
  );
}
