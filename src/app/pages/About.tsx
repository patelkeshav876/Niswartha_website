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
  Briefcase,
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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { mockAshrams } from '../data/mock';
import { ScrollReveal } from '../components/ScrollReveal';
import { PremiumHeroBackdrop } from '../components/home/PremiumHeroBackdrop';
import { AdBanner } from '../components/AdBanner';
import { api } from '../lib/api';

const DEFAULT_STAFF = [
  { id: 't-1', name: 'Dr. Meenal Sudhir Sangole', role: 'School Principal', since: 'Since 1993', category: 'Management', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80' },
  // Special Teachers
  { id: 't-2', name: 'Draupadi Popat Chavan', role: 'Special Teacher', since: 'Since 1996', category: 'Faculty', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80' },
  { id: 't-3', name: 'Uttara Narendra Patwardhan', role: 'Special Teacher', since: 'Since 1996', category: 'Faculty', imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80' },
  { id: 't-4', name: 'Jyoti Naneshwar Santpe', role: 'Special Teacher', since: 'Since 1998', category: 'Faculty', imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80' },
  { id: 't-5', name: 'Saral Sandesh Waghmare', role: 'Special Teacher', since: 'Since 1999', category: 'Faculty', imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80' },
  { id: 't-6', name: 'Neha Aparajit', role: 'Special Teacher', since: 'Since 2000', category: 'Faculty', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
  { id: 't-7', name: 'Jyoti Gajanan Solanke', role: 'Special Teacher', since: 'Since 2000', category: 'Faculty', imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80' },
  { id: 't-8', name: 'Hanumant Ambadas Rokade', role: 'Special Teacher', since: 'Since 2004', category: 'Faculty', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
  { id: 't-9', name: 'Monali Agalave', role: 'Special Teacher', since: 'Since 2008', category: 'Faculty', imageUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=400&q=80' },
  { id: 't-10', name: 'Kajal Manoj Parteti', role: 'Special Teacher', since: 'Since 2008', category: 'Faculty', imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80' },
  { id: 't-11', name: 'Kapil Pratap Wase', role: 'Special Teacher', since: 'Since 2008', category: 'Faculty', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
  { id: 't-12', name: 'Varsha Parag Jadhav', role: 'Special Teacher', since: 'Since 2008', category: 'Faculty', imageUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80' },
  { id: 't-13', name: 'Kalpana Prashant Atkare', role: 'Special Teacher', since: 'Since 2009', category: 'Faculty', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80' },
  { id: 't-14', name: 'Ashwini Naresh Wajbhakte', role: 'Special Teacher', since: 'Since 2010', category: 'Faculty', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
  { id: 't-15', name: 'Shalini Anil Bhuyar', role: 'Special Teacher', since: 'Since 2018', category: 'Faculty', imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80' },
  // Art Teachers
  { id: 't-16', name: 'Madhuvanti Khode', role: 'Art Teacher', since: 'Since 1996', category: 'Faculty', imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80' },
  { id: 't-17', name: 'Shailesh Damodar Borkar', role: 'Art Teacher', since: 'Since 1996', category: 'Faculty', imageUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80' },
  { id: 't-18', name: 'Kavita Pille', role: 'Art Teacher', since: 'Since 1998', category: 'Faculty', imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80' },
  { id: 't-19', name: 'Pramod Nagarale', role: 'Art Teacher', since: 'Since 1998', category: 'Faculty', imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80' },
  { id: 't-20', name: 'Rajendra Bhaskar Aghav', role: 'Art Teacher', since: 'Since 2000', category: 'Faculty', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80' },
  // Accountants & Clerks
  { id: 't-21', name: 'Rahul Sharad Rangari', role: 'Accountant', since: 'Since 2022', category: 'Staff', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80' },
  { id: 't-22', name: 'Bhushan Kailas Bave', role: 'Junior Clerk', since: 'Since 2022', category: 'Staff', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80' },
  { id: 't-23', name: 'Harish Dnyaneshwar Jogi', role: 'Junior Clerk', since: 'Since 2025', category: 'Staff', imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80' },
  // Hostel & Support Caretakers
  { id: 't-24', name: 'Nandu Motiramji Padole', role: 'Hostel Superintendent', since: 'Since 2008', category: 'Staff', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
  { id: 't-25', name: 'Anil Tukaram Lute', role: 'Caretaker', since: 'Since 1989', category: 'Staff', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
  { id: 't-26', name: 'Arun Tukaram Mohule', role: 'Caretaker', since: 'Since 1996', category: 'Staff', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
  { id: 't-27', name: 'Meena Kishor Savarkar', role: 'Caretaker', since: 'Since 1998', category: 'Staff', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80' },
  { id: 't-28', name: 'Siddharth Narayan Gachhe', role: 'Caretaker', since: 'Since 2022', category: 'Staff', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80' },
  { id: 't-29', name: 'Mangesh Gurudeorao Manne', role: 'Caretaker', since: 'Since 2023', category: 'Staff', imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80' },
  { id: 't-30', name: 'Shrikant Dattatraya Sutar', role: 'Caretaker', since: 'Since 2025', category: 'Staff', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80' },
  { id: 't-31', name: 'Devidas Helonde', role: 'Office Peon', since: 'Since 1996', category: 'Staff', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80' },
  { id: 't-32', name: 'Shila Udaram Lohi', role: 'Maid', since: 'Since 1997', category: 'Staff', imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80' },
  { id: 't-33', name: 'Sanjay Hazarilal Nahar', role: 'Watchman', since: 'Since 1991', category: 'Staff', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
  { id: 't-34', name: 'Sanmugam Mutyan Settiyar', role: 'Watchman', since: 'Since 1996', category: 'Staff', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
  { id: 't-35', name: 'Lahu Raosaheb Gavare', role: 'Helper', since: 'Since 2017', category: 'Staff', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80' }
];

export function About() {
  const navigate = useNavigate();
  const ashram = mockAshrams[0];
  const [team, setTeam] = useState<any[]>(DEFAULT_STAFF);
  const [config, setConfig] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [openCategories, setOpenCategories] = useState<string[]>(['Management', 'Faculty', 'Staff']);

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

  const heroImage = config?.aboutHeroImgUrl || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80';
  const assemblyImage = config?.aboutAssemblyImgUrl || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80';
  const awardImage = config?.aboutAwardImgUrl || 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=800&q=80';
  const principalImage = config?.aboutPrincipalImgUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80';

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
      title: 'Free Uniforms and Textbooks',
      description: 'Students receive free uniforms and textbooks to support uninterrupted learning.',
      icon: BookOpen,
    },
    {
      title: 'Free Transportation and Disability Guidance',
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
      title: 'Sports and Physical Activities',
      description: 'A well-developed playground and regular sports competitions promote physical fitness and teamwork.',
      icon: Dumbbell,
    },
    {
      title: 'Modern Fitness and Yoga Training',
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
      title: 'Financial Assistance and Government Scholarships',
      description: 'Needy and deserving students receive financial aid along with support from Social Welfare Department scholarship schemes.',
      icon: IndianRupee,
    },
    {
      title: 'Savitribai Phule Scholarship Support',
      description: 'Eligible students are guided and supported under the Savitribai Phule Scholarship Scheme.',
      icon: FileCheck,
    },
    {
      title: 'Higher Education Guidance Center',
      description: 'We provide dedicated guidance for hearing-impaired students pursuing higher education opportunities.',
      icon: Compass,
    },
    {
      title: 'Parent Guidance and Counseling',
      description: 'Special counseling and structured guidance services are available for parents of children with disabilities.',
      icon: Heart,
    },
    {
      title: 'Competition and Career Guidance',
      description: 'Students receive mentoring for various competitions as well as career and job opportunities.',
      icon: Lightbulb,
    },
    {
      title: 'Post-Grade 12 Support',
      description: 'We provide continued guidance and support for students pursuing higher education after Grade 12.',
      icon: Award,
    },
  ];

  const filteredTeam = team.filter((member) => {
    if (activeCategory === 'All') return true;
    return member.category === activeCategory;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ════════════ Hero Section ════════════ */}
      <PremiumHeroBackdrop pageKey="about">
        <div className="section-container relative py-20 lg:py-28 text-left max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-widest text-emerald-300 border border-white/15">
                Play. Educate. Inspire. Empower
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                A safe and joyful place for your lovely children
              </h1>
              <p className="text-sm sm:text-base text-white/85 leading-relaxed max-w-xl">
                The Deaf and Dumb Industrial Institute, established in 1946 in Nagpur, is dedicated to providing quality education, skill development, and holistic growth for hearing-impaired children from Grades 1 to 12 in a supportive and inclusive environment.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <a
                  href="mailto:ddingp1@gmail.com"
                  className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all"
                >
                  <Mail className="h-4 w-4 text-emerald-400" /> ddingp1@gmail.com
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 group">
                <img
                  src={heroImage}
                  alt="Deaf and Dumb Industrial Institute Nagpur"
                  className="w-full h-72 sm:h-80 object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">Established 1946</p>
                  <p className="text-sm font-serif font-bold">मूक आणि बधिर विद्यालय, शंकरनगर, नागपूर</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PremiumHeroBackdrop>

      <main className="flex-1 space-y-16 py-12">
        {/* ──── Empowering Students Overview ──── */}
        <section className="section-container">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-5 order-2 lg:order-1">
                <div className="relative rounded-3xl overflow-hidden shadow-xl border border-emerald-100 bg-white p-2">
                  <img
                    src={assemblyImage}
                    alt="School Assembly and Ground Activities"
                    className="w-full h-80 object-cover rounded-2xl"
                  />
                  <div className="p-3 text-center">
                    <p className="text-xs font-bold text-zinc-700">Holistic Campus and School Assembly</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 order-1 lg:order-2 space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[#0F6D4E]">About us</span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-zinc-900 leading-tight">
                  Empowering hearing-impaired students with quality education and skills for an independent future
                </h2>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  The Deaf and Dumb Industrial Institute, Nagpur, provides a structured and inclusive educational environment designed specifically for hearing-impaired students. Our experienced and specially trained teachers ensure that every child receives personalized attention and the opportunity to develop academic, communication, and life skills.
                </p>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  The Institute offers well-equipped classrooms, digital learning facilities, speech therapy support, a rich library, and a safe campus. We focus on the overall development of students through academics, sports, vocational guidance, and regular parent engagement, helping each student move towards independence and a successful future.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ──── National Award Recognition (Light Theme Upgrade) ──── */}
        <section className="section-container">
          <ScrollReveal>
            <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-[#0F6D4E]/5 via-emerald-50/60 to-white text-zinc-900 border border-[#0F6D4E]/20 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5">
                  <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/30 bg-white p-3 shadow-md">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-zinc-50 flex items-center justify-center">
                      <img
                        src={awardImage}
                        alt="National Award Certificate"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-4">
                  <Badge className="bg-[#0F6D4E] text-white border-none uppercase font-bold text-xs tracking-wider px-3.5 py-1 shadow-sm">
                    Government Recognition
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-zinc-900 leading-tight">
                    National Award for Welfare of Persons with Disabilities
                  </h2>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    The Deaf and Dumb Industrial Institute has been honored with the prestigious National Award by the Government of India, Ministry of Welfare, in recognition of its dedicated service and outstanding contribution towards the education and empowerment of hearing-impaired students.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ──── Principal's Message (Light Theme Upgrade) ──── */}
        <section className="section-container">
          <ScrollReveal>
            <Card className="border border-emerald-200/80 shadow-lg shadow-emerald-950/5 bg-gradient-to-br from-white via-emerald-50/30 to-white text-zinc-900 rounded-3xl overflow-hidden">
              <CardContent className="p-8 sm:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-4 flex justify-center">
                    <div className="relative h-48 w-48 sm:h-56 sm:w-56 rounded-full overflow-hidden border-4 border-[#0F6D4E] shadow-xl">
                      <img
                        src={principalImage}
                        alt="Dr. Meenal Sudhir Sangole"
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
                    <span className="text-4xl font-serif text-[#0F6D4E]">“</span>
                    <blockquote className="text-base sm:text-lg font-serif italic text-zinc-800 leading-relaxed">
                      At the Deaf and Dumb Industrial Institute, our mission is to provide every hearing-impaired student with quality education, confidence, and the skills needed for an independent future. We are committed to creating a supportive and inclusive environment where each student is encouraged to achieve their fullest potential.
                    </blockquote>
                    <div>
                      <h4 className="font-bold text-lg text-zinc-900">Dr. Meenal Sudhir Sangole (Principal - Since 1993)</h4>
                      <p className="text-xs text-[#0F6D4E] font-bold uppercase tracking-wider">School Principal and Academic Lead</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </section>

        {/* ──── Infinite Marquee and Classified Roster Section (Light Theme Upgrade) ──── */}
        <section className="bg-gradient-to-b from-white via-emerald-50/20 to-zinc-50/80 py-16 border-y border-emerald-100/60 overflow-hidden">
          <div className="space-y-10">
            <div className="section-container text-center max-w-3xl mx-auto space-y-3">
              <div className="flex items-center justify-center">
                <Badge className="bg-[#0F6D4E]/10 text-[#0F6D4E] border border-[#0F6D4E]/20 uppercase font-bold text-xs tracking-wider px-3.5 py-1">
                  Our Dedicated Team
                </Badge>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-zinc-900">
                Meet the Staff Guiding Our Children
              </h2>
              <p className="text-xs text-zinc-500">
                Special Educators, Art Instructors, Hostel Superintendents, Caretakers, and Support Staff serving since 1989.
              </p>
            </div>

            {/* Continuous Marquee Banner with Super Admin Speed Control */}
            <div className="relative w-full overflow-hidden py-4 bg-white border-y border-emerald-100 shadow-xs">
              <div
                className="flex gap-6 animate-marquee whitespace-nowrap"
                style={{ animationDuration: `${config?.marqueeSpeed || 35}s` }}
              >
                {[...team, ...team, ...team].map((m, idx) => (
                  <div
                    key={`${m.id}-${idx}`}
                    className="inline-flex items-center gap-3 bg-zinc-50/80 border border-emerald-200/60 px-4 py-2.5 rounded-2xl min-w-[230px] shadow-xs hover:border-emerald-400 transition-colors shrink-0"
                  >
                    {m.imageUrl ? (
                      <img
                        src={m.imageUrl}
                        alt={m.name}
                        className="h-10 w-10 rounded-full object-cover border border-[#0F6D4E]/40 shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-[#0F6D4E]/10 border border-[#0F6D4E]/30 text-[#0F6D4E] flex items-center justify-center font-bold text-xs font-serif shrink-0">
                        {m.name?.charAt(0)?.toUpperCase() || 'T'}
                      </div>
                    )}
                    <div className="text-left">
                      <p className="text-xs font-bold text-zinc-900 truncate max-w-[140px]">{m.name}</p>
                      <p className="text-[10px] text-[#0F6D4E] font-semibold">{m.role} {m.since ? `(${m.since})` : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Collapsible Dropdown Accordions */}
            <div className="section-container max-w-4xl mx-auto space-y-4">
              {[
                { key: 'Management', label: 'Management & Leadership', desc: 'School Principal & Academic Lead' },
                { key: 'Faculty', label: 'Special Educators & Art Instructors', desc: 'Qualified Special Teachers (Since 1996) & Art Teachers' },
                { key: 'Staff', label: 'Support Staff, Caretakers & Accountants', desc: 'Hostel Superintendents, Caretakers, Clerks & Office Staff' },
              ].map((cat) => {
                const members = team.filter((m) => m.category === cat.key);
                const isOpen = activeCategory === 'All' ? openCategories.includes(cat.key) : activeCategory === cat.key;

                const toggleCat = () => {
                  if (activeCategory !== 'All') setActiveCategory('All');
                  setOpenCategories((prev) =>
                    prev.includes(cat.key) ? prev.filter((k) => k !== cat.key) : [...prev, cat.key]
                  );
                };

                return (
                  <div key={cat.key} className="border border-zinc-200/90 rounded-3xl bg-white overflow-hidden shadow-xs">
                    <button
                      onClick={toggleCat}
                      className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-emerald-50/40 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="h-10 w-10 rounded-2xl bg-[#0F6D4E]/10 border border-[#0F6D4E]/20 text-[#0F6D4E] flex items-center justify-center font-bold">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif font-bold text-base sm:text-lg text-zinc-900">{cat.label}</h3>
                            <Badge className="bg-[#0F6D4E]/10 text-[#0F6D4E] border-none font-bold text-[10px]">
                              {members.length} Members
                            </Badge>
                          </div>
                          <p className="text-xs text-zinc-500 mt-0.5">{cat.desc}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0F6D4E] hidden sm:inline">
                          {isOpen ? 'Click to collapse' : 'Click to view team'}
                        </span>
                        <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600">
                          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="p-5 border-t border-zinc-100 bg-zinc-50/40 animate-fade-up">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {members.map((member) => (
                            <div
                              key={member.id}
                              className="p-3 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex items-center gap-3 hover:border-emerald-400 transition-colors"
                            >
                              {member.imageUrl ? (
                                <img
                                  src={member.imageUrl}
                                  alt={member.name}
                                  className="h-11 w-11 rounded-xl object-cover border border-emerald-200 shrink-0"
                                />
                              ) : (
                                <div className="h-11 w-11 rounded-xl bg-[#0F6D4E]/10 border border-[#0F6D4E]/20 text-[#0F6D4E] flex items-center justify-center font-bold text-sm font-serif shrink-0">
                                  {member.name?.charAt(0)?.toUpperCase() || 'T'}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-xs text-zinc-900 truncate">{member.name}</h4>
                                <p className="text-[10px] text-[#0F6D4E] font-semibold truncate mt-0.5">{member.role}</p>
                                {member.since && (
                                  <p className="text-[9px] text-zinc-400 font-mono mt-0.5">{member.since}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ──── Commitment and Core Values (4 Pillars) ──── */}
        <section className="bg-zinc-50 py-16">
          <div className="section-container space-y-10">
            <ScrollReveal>
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900">
                  We Are Committed to Empowering Hearing-Impaired Students
                </h2>
                <p className="text-sm font-bold text-[#0F6D4E]">
                  Every student deserves the right support during their most important learning years.
                </p>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  The Deaf and Dumb Industrial Institute, Nagpur, is dedicated to providing inclusive and specialized education for hearing-impaired students from Grades 1 to 12. With a legacy dating back to 1946, the Institute focuses on academic excellence, communication development, and skill-based learning in a safe and supportive environment. Our experienced special educators, modern digital classrooms, speech therapy support, and well-equipped campus ensure that every student receives the attention and resources needed to succeed.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {corePillars.map((pillar, idx) => (
                <ScrollReveal key={idx} delay={idx * 0.08}>
                  <Card className="border border-zinc-200/80 shadow-sm hover:shadow-md transition-shadow h-full rounded-2xl bg-white">
                    <CardContent className="p-6 space-y-3">
                      <div className="h-10 w-10 rounded-xl bg-[#0F6D4E]/10 flex items-center justify-center text-[#0F6D4E]">
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

        {/* ──── Vision and Mission Dual Cards ──── */}
        <section className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ScrollReveal>
              <Card className="border border-emerald-100 shadow-md bg-gradient-to-br from-white to-emerald-50/40 rounded-3xl p-8">
                <CardContent className="p-0 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-[#0F6D4E] text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-[#0F6D4E]/20">
                      V
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F6D4E] uppercase tracking-widest">Vision Statement</p>
                      <h3 className="text-lg font-serif font-bold text-zinc-900">Our Vision</h3>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-zinc-700 font-serif leading-relaxed">
                    To empower hearing-impaired students through quality education and holistic development, enabling them to lead confident and independent lives.
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <Card className="border border-emerald-100 shadow-md bg-gradient-to-br from-white to-emerald-50/40 rounded-3xl p-8">
                <CardContent className="p-0 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-[#0F6D4E] text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-[#0F6D4E]/20">
                      M
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F6D4E] uppercase tracking-widest">Mission Statement</p>
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

        {/* ──── Key Facilities and Student Support (18 Grid Tiles) ──── */}
        <section className="bg-zinc-50/80 py-16 border-t border-b">
          <div className="section-container space-y-8">
            <ScrollReveal>
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900">
                  Key Facilities and Student Support
                </h2>
                <p className="text-xs text-zinc-500">Comprehensive resources empowering hearing-impaired learners</p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {facilities.map((fac, idx) => (
                <ScrollReveal key={idx} delay={(idx % 6) * 0.05}>
                  <Card className="border border-zinc-200/80 shadow-xs hover:shadow-md transition-shadow bg-white rounded-2xl h-full">
                    <CardContent className="p-5 space-y-2">
                      <h4 className="font-bold text-xs text-[#0F6D4E] leading-snug">{fac.title}</h4>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">{fac.description}</p>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ))}
            </div>

            <p className="text-center text-[11px] text-zinc-400 pt-2">
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
