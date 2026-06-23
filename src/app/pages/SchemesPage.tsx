import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Search, FileText, CheckCircle, ExternalLink } from 'lucide-react';
import { api } from '../lib/api';
import type { GovScheme, GovSchemeCategory } from '../types';

const CATEGORIES: (GovSchemeCategory | 'All')[] = [
  'All',
  'Education',
  'Scholarship',
  'Child Welfare',
  'Healthcare',
  'Disability Support',
];

export function SchemesPage() {
  const [schemes, setSchemes] = useState<GovScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<GovSchemeCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const data = await api.getSchemes();
        // filter published schemes for public view
        const published = data.filter((s: any) => s.published !== false);
        if (published.length > 0) {
          setSchemes(published);
        } else {
          // Fallback mock schemes
          const mockData: GovScheme[] = [
            {
              id: 'scheme-1',
              title: 'ADIP Scheme (Assistance to Disabled Persons for Purchase/Fitting of Aids and Appliances)',
              description: 'Assistance to needy disabled persons in procuring durable, sophisticated, and scientifically manufactured modern aids and appliances. This includes free digital hearing aids, educational kits, and fully funded cochlear implant surgeries for children with congenital hearing impairment (up to ₹6 Lakhs per child).',
              category: 'Healthcare',
              published: true,
              eligibility: 'Indian citizen of any age. Monthly family income less than ₹30,000 (100% subsidy) or between ₹30,000 to ₹50,000 (50% subsidy). Must not have received similar assistance in the last 3 years.',
              link: 'https://depwd.gov.in/adip-scheme/',
              createdAt: new Date().toISOString(),
            },
            {
              id: 'scheme-2',
              title: 'Pre-Matric & Post-Matric Scholarship for Students with Disabilities',
              description: 'Scholarships provided by the Ministry of Social Justice and Empowerment to support hearing-impaired and other disabled students in completing pre-matric (classes 9 & 10) and post-matric (class 11 to post-graduate) education.',
              category: 'Scholarship',
              published: true,
              eligibility: 'Student enrolled in class 9 or above with more than 40% disability certified by medical authority. Family annual income must not exceed ₹2.5 Lakhs. Only two children per family can avail this scholarship.',
              link: 'https://scholarships.gov.in/',
              createdAt: new Date().toISOString(),
            },
            {
              id: 'scheme-3',
              title: 'Deendayal Disabled Rehabilitation Scheme (DDRS)',
              description: 'Provides grant-in-aid to voluntary organizations (NGOs) to facilitate delivery of services to children with hearing loss, mental retardation, and visual disabilities. This covers running deaf schools, vocational training, and early intervention centers.',
              category: 'Disability Support',
              published: true,
              eligibility: 'Voluntary organizations working in disability rehabilitation registered for at least 2 years. Benefits flow down directly to children enrolled in NGO special schools.',
              link: 'https://depwd.gov.in/deendayal-disabled-rehabilitation-scheme-ddrs/',
              createdAt: new Date().toISOString(),
            },
            {
              id: 'scheme-4',
              title: 'National Scholarship Portal (NSP) Scholarships',
              description: 'Central sector scheme for top-class education for students with disabilities to pursue graduation, post-graduation, and technical degrees in recognized premium institutions in India.',
              category: 'Scholarship',
              published: true,
              eligibility: 'Must have secured admission in notified premier institutes. More than 40% certified disability. Family income limit of ₹6 Lakhs per annum.',
              link: 'https://scholarships.gov.in/',
              createdAt: new Date().toISOString(),
            },
            {
              id: 'scheme-5',
              title: 'Unique Disability ID (UDID) Card Enrollment Program',
              description: 'A national database for persons with disabilities to issue a Unified UDID Card. This card acts as a single document of identification and disability verification to avail all government scheme benefits, travel concessions, and reservations.',
              category: 'Disability Support',
              published: true,
              eligibility: 'All persons with certified disabilities (hearing impairment, visual impairment, orthopedic, etc.) residing in India.',
              link: 'http://www.swavlambancard.gov.in/',
              createdAt: new Date().toISOString(),
            }
          ];
          setSchemes(mockData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  const filteredSchemes = schemes.filter((scheme) => {
    const matchesCategory = activeCategory === 'All' || scheme.category === activeCategory;
    const matchesSearch = scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Hero Header */}
      <div className="relative py-16 bg-[#0F6D4E] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent_50%)]" />
        <div className="section-container relative text-center space-y-3">
          <h1 className="text-3xl font-bold font-serif sm:text-4xl md:text-5xl">Government Schemes</h1>
          <p className="text-white/80 max-w-xl mx-auto text-sm sm:text-base">
            Explore government scholarships, welfare awards, healthcare programs, and special aids available for hearing-impaired children.
          </p>
        </div>
      </div>

      <div className="section-container py-12 space-y-8">
        {/* Filters and Search */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between bg-white border border-zinc-100 p-4 rounded-3xl shadow-sm">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                  activeCategory === cat
                    ? 'bg-[#0F6D4E] text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search schemes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 rounded-full border border-zinc-200 bg-zinc-50 pl-9 pr-4 text-xs text-zinc-800 placeholder-zinc-400 focus:bg-white focus:outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* Schemes Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 rounded-3xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredSchemes.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <p>No government schemes found matching the criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSchemes.map((scheme) => (
              <motion.div
                key={scheme.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-none shadow-sm rounded-3xl overflow-hidden h-full flex flex-col justify-between hover:shadow-md transition-shadow bg-white">
                  <div>
                    <CardHeader className="p-6 pb-2 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge className="bg-[#0F6D4E]/10 text-[#0F6D4E] font-bold text-[10px] tracking-wider px-3 py-1 rounded-full uppercase border-none">
                          {scheme.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-base sm:text-lg font-bold font-serif text-zinc-900 leading-snug">
                        {scheme.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 pt-2 space-y-4">
                      <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                        {scheme.description}
                      </p>
                      
                      {scheme.eligibility && (
                        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100/50 space-y-1.5">
                          <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wide flex items-center gap-1.5">
                            <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                            Eligibility Criteria
                          </h4>
                          <p className="text-xs text-zinc-500 leading-relaxed">
                            {scheme.eligibility}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </div>

                  <div className="p-6 pt-0 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 font-medium">
                      Published: {new Date(scheme.createdAt).toLocaleDateString('en-IN')}
                    </span>
                    {scheme.link && (
                      <a
                        href={scheme.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F6D4E] hover:underline"
                      >
                        Official Website
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
