import { MessageCircle } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';

/**
 * Floating WhatsApp Support button that queries dynamic backend configurations.
 */
export function WhatsAppButton() {
  const { config } = useConfig();

  if (!config?.whatsappNumber) return null;

  const rawDigits = String(config.whatsappNumber).replace(/[^\d]/g, '');
  const cleanNumber = rawDigits.length === 10 ? `91${rawDigits}` : rawDigits;
  const welcomeMessage = encodeURIComponent(config.whatsappWelcomeMessage || '');
  const url = `https://wa.me/${cleanNumber}?text=${welcomeMessage}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[45] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/20 transition-all hover:scale-110 hover:shadow-[#25D366]/35 active:scale-95 group animate-fade-up"
      title="Contact us on WhatsApp"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="h-7 w-7 transition-transform group-hover:rotate-6" />
      <span className="absolute right-16 scale-0 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white shadow-lg transition-all group-hover:scale-100 whitespace-nowrap bg-zinc-900/90 backdrop-blur-sm select-none">
        Chat with Us
      </span>
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-35 animate-ping pointer-events-none" style={{ animationIterationCount: 3, animationDuration: '2.5s' }} />
    </a>
  );
}
