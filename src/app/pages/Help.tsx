import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { ArrowLeft, Mail, Phone, MessageCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router';

export function Help() {
  const navigate = useNavigate();

  const faqs = [
    {
      question: 'How do I make a donation?',
      answer: 'Browse ashrams, select one you\'d like to support, and click the "Donate" button. You can choose to donate to a specific need or make a general donation. Follow the payment process to complete your contribution.',
    },
    {
      question: 'Is my donation tax-deductible?',
      answer: 'Yes, all donations made through Ashram Connect are eligible for tax deductions under Section 80G. You will receive a donation receipt via email after your contribution.',
    },
    {
      question: 'Can I track how my donation is being used?',
      answer: 'Yes! Visit your Donation History to see all your contributions. Ashrams regularly post updates on their feed showing how donations are making an impact.',
    },
    {
      question: 'How do I become an ashram admin?',
      answer: 'If you represent an orphanage or ashram, please contact our support team at admin@ashramconnect.org with your organization details. We\'ll verify your credentials and set up your admin account.',
    },
    {
      question: 'Can I visit the ashrams?',
      answer: 'Many ashrams welcome visitors! Check the ashram\'s profile for contact information and visit their Events page to see upcoming open house events or volunteer opportunities.',
    },
    {
      question: 'How do I register for an event?',
      answer: 'Open Events, choose an event, then tap Register / Join. After you confirm, your booking appears under Profile and My Bookings.',
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept all major credit/debit cards, UPI, net banking, and digital wallets. All transactions are secure and encrypted.',
    },
    {
      question: 'Can I set up recurring donations?',
      answer: 'Yes! When making a donation, select the "Make this recurring" option. You can choose monthly, quarterly, or annual recurring donations.',
    },
  ];

  const contactOptions = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'support@ashramconnect.org',
      action: () => window.location.href = 'mailto:support@ashramconnect.org',
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: '+91 1800 123 4567',
      action: () => window.location.href = 'tel:+911800123456',
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Available 9 AM - 6 PM IST',
      action: () => alert('Live chat feature coming soon!'),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-serif font-bold">Help & Support</h1>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Quick Contact */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Contact Us</h2>
          <div className="space-y-3">
            {contactOptions.map((option) => (
              <Card
                key={option.title}
                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-muted/50 active:scale-[0.98] transition-transform"
                onClick={option.action}
              >
                <div className="bg-primary/10 p-3 rounded-lg">
                  <option.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{option.title}</p>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Frequently Asked Questions</h2>
          <Card className="p-4">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>

        {/* Resources */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Resources</h2>
          <div className="space-y-2">
            <Card className="p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/50">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">User Guide</span>
            </Card>
            <Card className="p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/50">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Privacy Policy</span>
            </Card>
            <Card className="p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/50">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Terms of Service</span>
            </Card>
          </div>
        </div>

        {/* Feedback */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h3 className="font-semibold mb-2">Need More Help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Can't find what you're looking for? Send us a message and we'll get back to you within 24 hours.
          </p>
          <Button className="w-full">
            Send Feedback
          </Button>
        </Card>
      </main>
    </div>
  );
}
