import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Mail, Phone, MessageCircle, Search, HelpCircle, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { useNavigate } from 'react-router';
import { PremiumHeroBackdrop } from '../components/home/PremiumHeroBackdrop';
import { ScrollReveal } from '../components/ScrollReveal';

export function Help() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const faqs = [
    {
      question: 'How do I contribute or support a child or ashram?',
      answer: 'Browse current needs or ashrams, select the cause you would like to support, and click "Support Our Mission". You can choose to contribute towards specific educational items, food programs, or general welfare. Follow the simple online payment steps to complete your support.',
    },
    {
      question: 'Are contributions eligible for 80G tax exemption?',
      answer: 'Yes! All monetary contributions made to the Deaf and Dumb Industrial Institute, Nagpur, are eligible for tax deductions under Section 80G. An official receipt will be generated and emailed directly to your registered account.',
    },
    {
      question: 'How can I schedule a visit to the Institute?',
      answer: 'Click "Visit Us" in the top navigation bar or go to the Visit Booking page. Select your preferred date, time slot, and number of visitors. Our team will prepare for your arrival and guide you through the campus tour.',
    },
    {
      question: 'What facilities are available for hearing-impaired students?',
      answer: 'We provide specialized digital classrooms, speech therapy labs, hostel residence for boys and girls up to 14 years, free uniforms, textbooks, bus transport, sports grounds, and vocational training.',
    },
    {
      question: 'Can I suggest or sponsor a special event?',
      answer: 'Yes! Navigate to the Events page and click "Suggest / Sponsor Event". You can propose birthday celebrations, meal distribution, or cultural programs for the children.',
    },
    {
      question: 'What payment methods are supported?',
      answer: 'We accept all secure payment options including UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and direct Bank Transfer.',
    },
  ];

  const contactOptions = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'ddingp1@gmail.com',
      subtext: 'Response within 24 hours',
      action: () => (window.location.href = 'mailto:ddingp1@gmail.com'),
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: '+91 712 253 2468',
      subtext: 'Mon - Sat, 9 AM - 6 PM IST',
      action: () => (window.location.href = 'tel:+917122532468'),
    },
    {
      icon: MessageCircle,
      title: 'Visit Address',
      description: 'Shankar Nagar, Nagpur',
      subtext: 'Deaf and Dumb Institute',
      action: () => navigate('/visit-book/ashram-1'),
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-background pb-16">
      {/* Hero Header */}
      <PremiumHeroBackdrop pageKey="help">
        <div className="section-container pt-24 pb-16 lg:pt-32 lg:pb-24 text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-widest text-emerald-300 border border-white/15">
            <HelpCircle className="h-3.5 w-3.5" /> Support & Guidance
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
            How Can We Help You Today?
          </h1>
          <p className="text-sm text-white/85 max-w-xl mx-auto leading-relaxed">
            Find answers to common questions regarding donations, visit bookings, government schemes, and student support.
          </p>
        </div>
      </PremiumHeroBackdrop>

      <main className="flex-1 space-y-12 py-12">
        {/* Compact 3-Column Small Grid Cards for Contact Support */}
        <section className="section-container">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#0F6D4E]">Direct Support Channels</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {contactOptions.map((opt) => (
                  <Card
                    key={opt.title}
                    onClick={opt.action}
                    className="border border-zinc-200/80 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all rounded-2xl bg-white cursor-pointer p-4 text-center flex flex-col items-center justify-between space-y-2 group"
                  >
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#0F6D4E] border border-emerald-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <opt.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-zinc-900">{opt.title}</h4>
                      <p className="text-xs font-bold text-[#0F6D4E] mt-0.5">{opt.description}</p>
                      <p className="text-[10px] text-zinc-400 font-medium mt-0.5">{opt.subtext}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* FAQ Accordion List */}
        <section className="section-container">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-serif font-bold text-zinc-900">Frequently Asked Questions</h2>
                <p className="text-xs text-zinc-500">Quick answers to common queries</p>
              </div>

                <Card className="border border-zinc-200/80 shadow-xs rounded-3xl bg-white p-4 sm:p-6 overflow-hidden">
                  <Accordion type="single" collapsible className="w-full space-y-2">
                    {faqs.map((faq, idx) => (
                      <AccordionItem key={idx} value={`faq-${idx}`} className="border border-zinc-100 rounded-2xl px-4 py-1">
                        <AccordionTrigger className="text-xs sm:text-sm font-bold text-zinc-900 hover:text-[#0F6D4E] text-left py-3">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-zinc-600 leading-relaxed pb-3 pt-1">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </Card>
            </div>
          </ScrollReveal>
        </section>

        {/* Bottom CTA Card */}
        <section className="section-container">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto rounded-3xl bg-gradient-to-r from-emerald-900 via-[#0F6D4E] to-emerald-800 text-white p-8 text-center space-y-4 shadow-lg">
              <h3 className="text-xl font-serif font-bold text-white">Still have questions?</h3>
              <p className="text-xs text-white/80 max-w-md mx-auto leading-relaxed">
                Our support team and school administrators are happy to assist you with any inquiries regarding admissions, donations, or visits.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Button
                  onClick={() => navigate('/donate/ashram-1')}
                  className="rounded-full bg-white text-[#0F6D4E] hover:bg-emerald-50 font-bold text-xs px-6 shadow-md"
                >
                  Support Our Mission <Heart className="ml-1.5 h-3.5 w-3.5 fill-current" />
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>
    </div>
  );
}
