import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Search, FileText, CheckCircle, ExternalLink } from 'lucide-react';
import { api } from '../lib/api';
import type { GovScheme, GovSchemeCategory } from '../types';
import { PremiumHeroBackdrop } from '../components/home/PremiumHeroBackdrop';

const CATEGORIES: (GovSchemeCategory | 'All')[] = [
  'All',
  'Education',
  'Scholarship',
  'Child Welfare',
  'Healthcare',
  'Disability Support',
];

const DEFAULT_SCHEMES: GovScheme[] = [
  {
    id: 'scheme-1',
    title: 'ADIP Scheme (Assistance to Disabled Persons for Purchase/Fitting of Aids and Appliances)',
    description:
      'Assistance to needy disabled persons in procuring durable, sophisticated, and scientifically manufactured modern aids and appliances. This includes free digital hearing aids, educational kits, and fully funded cochlear implant surgeries for children with congenital hearing impairment (up to ₹6 Lakhs per child).',
    category: 'Healthcare',
    published: true,
    eligibility:
      'Indian citizen of any age. Monthly family income less than ₹30,000 (100% subsidy) or between ₹30,000 to ₹50,000 (50% subsidy). Must not have received similar assistance in the last 3 years.',
    link: 'https://depwd.gov.in/adip-scheme/',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'scheme-2',
    title: 'Pre-Matric and Post-Matric Scholarship for Students with Disabilities',
    description:
      'Scholarships provided by the Ministry of Social Justice and Empowerment to support hearing-impaired and other disabled students in completing pre-matric (classes 9 and 10) and post-matric (class 11 to post-graduate) education.',
    category: 'Scholarship',
    published: true,
    eligibility:
      'Student enrolled in class 9 or above with more than 40% disability certified by medical authority. Family annual income must not exceed ₹2.5 Lakhs. Only two children per family can avail this scholarship.',
    link: 'https://scholarships.gov.in/',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'scheme-3',
    title: 'Deendayal Disabled Rehabilitation Scheme (DDRS)',
    description:
      'Provides grant-in-aid to voluntary organizations (NGOs) to facilitate delivery of services to children with hearing loss, mental retardation, and visual disabilities. This covers running deaf schools, vocational training, and early intervention centers.',
    category: 'Disability Support',
    published: true,
    eligibility:
      'Voluntary organizations working in disability rehabilitation registered for at least 2 years. Benefits flow down directly to children enrolled in NGO special schools.',
    link: 'https://depwd.gov.in/deendayal-disabled-rehabilitation-scheme-ddrs/',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'scheme-4',
    title: 'National Scholarship Portal (NSP) Scholarships',
    description:
      'Central sector scheme for top-class education for students with disabilities to pursue graduation, post-graduation, and technical degrees in recognized premium institutions in India.',
    category: 'Scholarship',
    published: true,
    eligibility:
      'Must have secured admission in notified premier institutes. More than 40% certified disability. Family income limit of ₹6 Lakhs per annum.',
    link: 'https://scholarships.gov.in/',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'scheme-mh-1',
    title: 'Sanjay Gandhi Niradhar Anudan Yojana (संजय गांधी निराधार अनुदान योजना - महाराष्ट्र शासन)',
    description:
      'Maharashtra State Government flagship scheme providing ₹1,500 monthly financial pension assistance to destitute families of hearing-impaired and specially-abled children in Nagpur and Maharashtra.',
    category: 'Child Welfare',
    published: true,
    eligibility:
      'Resident of Maharashtra for 15+ years. Family annual income less than ₹21,000. Child must have certified disability above 40%.',
    link: 'https://sanjaygandhiyojana.maharashtra.gov.in/',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'scheme-mh-2',
    title: 'Divyang Kalyan Vibhag Maharashtra Special Aid (दिव्यांग कल्याण विभाग महाराष्ट्र शासन)',
    description:
      'Provides free digital hearing aids, Marathi sign language learning kits, braille computers, and educational grants for deaf and mute students enrolled in Nagpur special schools.',
    category: 'Education',
    published: true,
    eligibility:
      'Hearing-impaired students enrolled in recognized special schools in Maharashtra. Certificate of 40%+ hearing loss required.',
    link: 'https://sjsa.maharashtra.gov.in/',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'scheme-mh-3',
    title: 'Nagpur Zilla Parishad Divyang Welfare Fund (नागपूर जिल्हा परिषद ५% अपंग कल्याण निधी)',
    description:
      'Nagpur Zilla Parishad local welfare initiative allocating 5% annual budget for free bus travel passes, battery-operated tricycles, and school kit distribution for deaf children in Shankar Nagar and Nagpur district.',
    category: 'Disability Support',
    published: true,
    eligibility:
      'Resident of Nagpur District with valid UDID Card or Civil Surgeon Disability Certificate.',
    link: 'https://nagpur.gov.in/',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'scheme-mh-4',
    title: 'Shravanbal Seva State Level Scheme (श्रवणबाळ सेवा योजना)',
    description:
      'Special pension and nutritional support scheme funded by Maharashtra Government for children with congenital speech and hearing impairments.',
    category: 'Healthcare',
    published: true,
    eligibility:
      'Children from BPL (Below Poverty Line) families residing in Maharashtra with medical civil surgeon verification.',
    link: 'https://sjsa.maharashtra.gov.in/',
    createdAt: new Date().toISOString(),
  },
];

export function SchemesPage() {
  const [schemes, setSchemes] = useState<GovScheme[]>(DEFAULT_SCHEMES);
  const [activeCategory, setActiveCategory] = useState<GovSchemeCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchSchemes = async () => {
      try {
        const data = await api.getSchemes();
        const published = (data || []).filter((s: any) => s.published !== false);
        if (mounted && published.length > 0) {
          setSchemes(published);
        }
      } catch (err) {
        console.error('Schemes load fallback active:', err);
      }
    };
    void fetchSchemes();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredSchemes = schemes.filter((scheme) => {
    const matchesCategory = activeCategory === 'All' || scheme.category === activeCategory;
    const matchesSearch =
      scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (scheme.eligibility && scheme.eligibility.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Hero Section with Configurable Super Admin Video Background */}
      <PremiumHeroBackdrop pageKey="schemes" className="min-h-[45vh] lg:min-h-[55vh]">
        <div className="section-container relative flex flex-col items-center justify-center py-16 lg:py-24 text-center text-white">
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 uppercase tracking-widest text-[10px] font-bold px-3.5 py-1 mb-3">
            Government Welfare and Empowerment
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight">
            Government Schemes and Financial Support
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-200 leading-relaxed font-sans mt-3">
            Explore active central and state welfare initiatives, scholarships, medical assistance grants, and UDID programs designed for hearing-impaired children and families.
          </p>
        </div>
      </PremiumHeroBackdrop>

      {/* Main Container */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 space-y-8">
        {/* Search and Filter Bar */}
        <Card className="border border-zinc-200/80 shadow-lg bg-white/95 backdrop-blur rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search schemes, scholarships, or aids..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 text-xs sm:text-sm text-zinc-900 bg-zinc-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F6D4E]/30 focus:border-[#0F6D4E] transition-all"
              />
            </div>

            {/* Categories */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-[#0F6D4E] text-white shadow-md shadow-[#0F6D4E]/20 scale-105'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Schemes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSchemes.map((scheme, idx) => (
            <motion.div
              key={scheme.id || idx}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Card className="h-full border border-zinc-200/80 shadow-xs hover:shadow-xl transition-all duration-300 rounded-3xl bg-white flex flex-col justify-between overflow-hidden group">
                <CardHeader className="p-6 pb-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <Badge className="bg-emerald-50 text-[#0F6D4E] border border-emerald-200 font-bold text-[10px] uppercase px-3 py-1">
                      {scheme.category}
                    </Badge>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-emerald-500" /> Active Scheme
                    </span>
                  </div>
                  <CardTitle className="text-lg font-serif font-bold text-zinc-950 group-hover:text-[#0F6D4E] transition-colors leading-snug">
                    {scheme.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6 pt-0 space-y-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-sans">
                    {scheme.description}
                  </p>

                  {scheme.eligibility && (
                    <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-100 space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#0F6D4E]">
                        Eligibility Criteria
                      </p>
                      <p className="text-xs text-zinc-700 leading-relaxed">
                        {scheme.eligibility}
                      </p>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between border-t border-zinc-100">
                    <span className="text-[11px] font-medium text-zinc-400">
                      Official Portal Access
                    </span>
                    {scheme.link ? (
                      <a
                        href={scheme.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F6D4E] hover:text-[#0b523a] hover:underline"
                      >
                        Apply and Read More <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <span className="text-xs text-zinc-400">Contact Institution</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredSchemes.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-zinc-200 p-8 space-y-3">
            <FileText className="h-12 w-12 text-zinc-300 mx-auto" />
            <h3 className="text-lg font-serif font-bold text-zinc-900">No matching schemes found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Try adjusting your search query or switching to another category.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveCategory('All');
                setSearchQuery('');
              }}
              className="rounded-full text-xs"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
