import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import {
  Mail,
  Phone,
  MessageCircle,
  HelpCircle,
  Heart,
  Send,
  CheckCircle2,
  ShieldAlert,
  AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { PremiumHeroBackdrop } from '../components/home/PremiumHeroBackdrop';
import { ScrollReveal } from '../components/ScrollReveal';
import { useUser } from '../context/UserContext';
import { api } from '../lib/api';
import { toast } from 'sonner';

const COMPLAINT_CATEGORIES = [
  'Technical Bug / Website Error',
  'Visit Booking Issue',
  'Donation / Payment Issue',
  'Account / Profile Issue',
  'Content or Information Error',
  'Other Website Complaint',
];

export function Help() {
  const navigate = useNavigate();
  const { currentUser } = useUser();

  // Complaint Form State
  const [complaintName, setComplaintName] = useState(currentUser?.name || '');
  const [complaintContact, setComplaintContact] = useState(currentUser?.email || currentUser?.phone || '');
  const [complaintCategory, setComplaintCategory] = useState(COMPLAINT_CATEGORIES[0]);
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintMessage, setComplaintMessage] = useState('');
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);

  useEffect(() => {
    if (currentUser) {
      if (!complaintName) setComplaintName(currentUser.name || '');
      if (!complaintContact) setComplaintContact(currentUser.email || currentUser.phone || '');
    }
  }, [currentUser]);

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!complaintSubject.trim()) {
      toast.error('Please enter a complaint subject or title');
      return;
    }

    if (!complaintMessage.trim()) {
      toast.error('Please describe your complaint or issue');
      return;
    }

    if (complaintMessage.trim().length < 10) {
      toast.error('Please provide more details (at least 10 characters)');
      return;
    }

    setIsSubmittingComplaint(true);
    try {
      await api.submitComplaint({
        name: complaintName.trim() || 'Anonymous User',
        email: complaintContact.includes('@') ? complaintContact.trim() : '',
        phone: !complaintContact.includes('@') ? complaintContact.trim() : '',
        category: complaintCategory,
        subject: complaintSubject.trim(),
        message: complaintMessage.trim(),
        userId: currentUser?.id,
      });

      toast.success('Complaint submitted directly to Super Admin! Thank you.');
      setComplaintSubmitted(true);
      setComplaintSubject('');
      setComplaintMessage('');
    } catch (err: any) {
      console.error('Complaint submit error:', err);
      toast.error(err.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  const faqs = [
    {
      question: 'How do I contribute or support a child or ashram?',
      answer:
        'Browse current needs or ashrams, select the cause you would like to support, and click "Support Our Mission". You can choose to contribute towards specific educational items, food programs, or general welfare. Follow the simple online payment steps to complete your support.',
    },
    {
      question: 'Are contributions eligible for 80G tax exemption?',
      answer:
        'Yes! All monetary contributions made to the Deaf and Dumb Industrial Institute, Nagpur, are eligible for tax deductions under Section 80G. An official receipt will be generated and emailed directly to your registered account.',
    },
    {
      question: 'How can I schedule a visit to the Institute?',
      answer:
        'Click "Visit Us" in the top navigation bar or go to the Visit Booking page. Select your preferred date, time slot, and number of visitors. Our team will prepare for your arrival and guide you through the campus tour.',
    },
    {
      question: 'What facilities are available for hearing-impaired students?',
      answer:
        'We provide specialized digital classrooms, speech therapy labs, hostel residence for boys and girls up to 14 years, free uniforms, textbooks, bus transport, sports grounds, and vocational training.',
    },
    {
      question: 'Can I suggest or sponsor a special event?',
      answer:
        'Yes! Navigate to the Events page and click "Suggest / Sponsor Event". You can propose birthday celebrations, meal distribution, or cultural programs for the children.',
    },
    {
      question: 'What payment methods are supported?',
      answer:
        'We accept all secure payment options including UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and direct Bank Transfer.',
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
            Find answers to common questions regarding donations, visit bookings, government schemes, or report any issues directly to our leadership.
          </p>
        </div>
      </PremiumHeroBackdrop>

      <main className="flex-1 space-y-12 py-12">
        {/* Direct Support Channels Cards */}
        <section className="section-container">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#1E3A8A]">Direct Support Channels</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {contactOptions.map((opt) => (
                  <Card
                    key={opt.title}
                    onClick={opt.action}
                    className="border border-zinc-200/80 shadow-xs hover:shadow-md hover:border-[#1E3A8A]/40 transition-all rounded-2xl bg-white cursor-pointer p-4 text-center flex flex-col items-center justify-between space-y-2 group"
                  >
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#1E3A8A] border border-blue-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <opt.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-zinc-900">{opt.title}</h4>
                      <p className="text-xs font-bold text-[#1E3A8A] mt-0.5">{opt.description}</p>
                      <p className="text-[10px] text-zinc-400 font-medium mt-0.5">{opt.subtext}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* User Website Complaint Box (Direct to Super Admin Notification) */}
        <section className="section-container">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto">
              <Card className="border border-amber-200/70 shadow-md rounded-3xl bg-gradient-to-b from-amber-50/40 via-white to-white overflow-hidden p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-zinc-100 pb-5">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                      <ShieldAlert className="h-3.5 w-3.5" /> Direct to Super Admin
                    </div>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-900 pt-1">
                      Report a Website Issue or Complaint
                    </h2>
                    <p className="text-xs text-zinc-500 leading-relaxed max-w-xl">
                      Facing a problem with booking, donations, or found a website glitch? Submit your complaint below. It is delivered directly to our Super Administrator's notification center for immediate attention.
                    </p>
                  </div>
                </div>

                {complaintSubmitted ? (
                  <div className="py-8 text-center space-y-4">
                    <div className="h-14 w-14 rounded-full bg-emerald-100 text-[#1E3A8A] flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 className="h-7 w-7" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-zinc-900">Complaint Submitted Successfully!</h3>
                      <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
                        Your message has been dispatched to the Super Admin's notification console. Our team will review the issue and follow up if contact details were provided.
                      </p>
                    </div>
                    <Button
                      onClick={() => setComplaintSubmitted(false)}
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs font-bold border-zinc-200 mt-2"
                    >
                      Submit Another Report
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleComplaintSubmit} className="space-y-4 pt-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-700">Your Name</Label>
                        <Input
                          type="text"
                          value={complaintName}
                          onChange={(e) => setComplaintName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="rounded-xl border-zinc-200 text-xs h-10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-700">Contact Email or Phone</Label>
                        <Input
                          type="text"
                          value={complaintContact}
                          onChange={(e) => setComplaintContact(e.target.value)}
                          placeholder="e.g. rahul@example.com or +91..."
                          className="rounded-xl border-zinc-200 text-xs h-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-700">Complaint Category</Label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {COMPLAINT_CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setComplaintCategory(cat)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                              complaintCategory === cat
                                ? 'bg-[#1E3A8A] text-white shadow-xs'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-700">Subject / Title</Label>
                      <Input
                        type="text"
                        value={complaintSubject}
                        onChange={(e) => setComplaintSubject(e.target.value)}
                        placeholder="Brief summary of the issue (e.g. Visit booking button showing NOT_FOUND error)"
                        className="rounded-xl border-zinc-200 text-xs h-10"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-700">Detailed Complaint / Issue Description</Label>
                      <Textarea
                        value={complaintMessage}
                        onChange={(e) => setComplaintMessage(e.target.value)}
                        placeholder="Please describe what happened, what page you were on, and any error message you saw..."
                        rows={4}
                        className="rounded-2xl border-zinc-200 text-xs resize-none"
                        required
                      />
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span>Visible in Super Admin notifications instantly upon submit.</span>
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmittingComplaint}
                        className="w-full sm:w-auto rounded-full bg-[#1E3A8A] hover:bg-[#0c593f] text-white font-bold text-xs px-6 h-10 gap-2 shadow-sm"
                      >
                        {isSubmittingComplaint ? (
                          'Submitting...'
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" /> Submit Complaint to Super Admin
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
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
                      <AccordionTrigger className="text-xs sm:text-sm font-bold text-zinc-900 hover:text-[#1E3A8A] text-left py-3">
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
            <div className="max-w-3xl mx-auto rounded-3xl bg-gradient-to-r from-emerald-900 via-[#1E3A8A] to-emerald-800 text-white p-8 text-center space-y-4 shadow-lg">
              <h3 className="text-xl font-serif font-bold text-white">Still have questions?</h3>
              <p className="text-xs text-white/80 max-w-md mx-auto leading-relaxed">
                Our support team and school administrators are happy to assist you with any inquiries regarding admissions, donations, or visits.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Button
                  onClick={() => navigate('/donate/ashram-1')}
                  className="rounded-full bg-white text-[#1E3A8A] hover:bg-emerald-50 font-bold text-xs px-6 shadow-md"
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
