import { Link } from 'react-router';
import { Heart, MapPin, Phone, Mail, Facebook, ArrowRight } from 'lucide-react';
import { mockAshrams } from '../data/mock';

export function Footer() {
  const ashram = mockAshrams[0];
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#0b110e] text-white overflow-hidden">
      {/* Ambient decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(15,109,78,0.15),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(15,109,78,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />

      <div className="relative">
        {/* Main Footer Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
                  <Heart className="h-5 w-5 text-white" fill="white" />
                </div>
                <div>
                  <p className="text-lg font-bold tracking-tight font-serif">Niswartha</p>
                  <p className="-mt-1 text-[10px] font-medium uppercase tracking-[0.15em] text-white/50">Selfless Service</p>
                </div>
              </div>
              <p className="text-sm text-white/60 leading-relaxed mb-4">
                Empowering hearing-impaired children with quality education, life skills, and hope for an independent future.
              </p>
              <div className="flex items-center gap-3">
                {ashram.facebookUrl && (
                  <a
                    href={ashram.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white/60 ring-1 ring-white/10 transition-all hover:bg-primary/20 hover:text-primary hover:ring-primary/30"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
                <a
                  href={`mailto:${ashram.contact.email}`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white/60 ring-1 ring-white/10 transition-all hover:bg-primary/20 hover:text-primary hover:ring-primary/30"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/80">Quick Links</h4>
              <ul className="space-y-2.5">
                {[
                  { to: '/', label: 'Home' },
                  { to: '/about', label: 'About Us' },
                  { to: '/events', label: 'Events' },
                  { to: '/needs', label: 'Current Needs' },
                  { to: '/visit-book/ashram-1', label: 'Visit Us' },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="group flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-primary"
                    >
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/80">Support</h4>
              <ul className="space-y-2.5">
                {[
                  { to: '/donate/ashram-1', label: 'Donate Now' },
                  { to: '/events/suggest', label: 'Suggest Event' },
                  { to: '/help', label: 'Help & FAQ' },
                  { to: '/profile', label: 'My Account' },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="group flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-primary"
                    >
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/80">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-sm text-white/50 leading-relaxed">{ashram.location}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  <a href={`tel:${ashram.contact.phone}`} className="text-sm text-white/50 hover:text-primary transition-colors">
                    {ashram.contact.phone}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  <a href={`mailto:${ashram.contact.email}`} className="text-sm text-white/50 hover:text-primary transition-colors">
                    {ashram.contact.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/40">
              © {currentYear} Niswartha — Deaf and Dumb Industrial Institute, Nagpur. All rights reserved.
            </p>
            <p className="text-xs text-white/30 flex items-center gap-1">
              Built with <Heart className="h-3 w-3 text-primary" fill="currentColor" /> for a better tomorrow
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
