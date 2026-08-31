import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { api } from '../lib/api';

/**
 * Floating WhatsApp Support button that queries dynamic backend configurations.
 */
export function WhatsAppButton() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api.getConfig();
        if (active && data) {
          setConfig(data);
        }
      } catch {
        // Fallback default config
        if (active) {
          setConfig({
            whatsappNumber: '+919876543210',
            whatsappWelcomeMessage: 'Hello! I would like to learn more about support options for the Niswartha Ashram.'
          });
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!config?.whatsappNumber) return null;

  const numberString = String(config.whatsappNumber).replace(/[^\d+]/g, '');
  const welcomeMessage = encodeURIComponent(config.whatsappWelcomeMessage || '');
  const url = `https://wa.me/${numberString}?text=${welcomeMessage}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[45] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/20 transition-all hover:scale-110 hover:shadow-[#25D366]/35 active:scale-95 group animate-fade-up"
      title="Contact us on WhatsApp"
    >
      <MessageCircle className="h-7 w-7 transition-transform group-hover:rotate-6" />
      <span className="absolute right-16 scale-0 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white shadow-lg transition-all group-hover:scale-100 whitespace-nowrap bg-zinc-900/90 backdrop-blur-sm select-none">
        Chat with Us
      </span>
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-35 animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
    </a>
  );
}
