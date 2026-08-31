import { useState } from 'react';
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
  FloatingFocusManager,
  FloatingPortal,
} from '@floating-ui/react';
import { Phone, Mail, Facebook, MessageCircle, X } from 'lucide-react';
import { Button, buttonVariants } from './ui/button';
import { cn } from './ui/utils';
import type { Ashram } from '../types';

type FloatingQuickContactProps = {
  ashram: Pick<Ashram, 'contact' | 'facebookUrl' | 'name'>;
};

export function FloatingQuickContact({ ashram }: FloatingQuickContactProps) {
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'top-end',
    middleware: [offset(12), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const phoneHref = ashram.contact.phone.replace(/\s/g, '');
  const mailHref = `mailto:${ashram.contact.email}`;

  return (
    <div className="fixed bottom-24 right-4 z-50 md:bottom-8 md:right-8">
      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              className="w-[min(100vw-2rem,18rem)] rounded-2xl border bg-card/95 p-3 shadow-xl backdrop-blur-md outline-none"
              {...getFloatingProps()}
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="text-sm font-semibold leading-tight">{ashram.name}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-col gap-1">
                <a
                  href={`tel:${phoneHref}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted"
                >
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{ashram.contact.phone}</span>
                </a>
                <a
                  href={mailHref}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted"
                >
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="truncate">{ashram.contact.email}</span>
                </a>
                {ashram.facebookUrl ? (
                  <a
                    href={ashram.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted"
                  >
                    <Facebook className="h-4 w-4 text-primary" />
                    <span>Facebook page</span>
                  </a>
                ) : null}
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}

      <button
        ref={refs.setReference}
        type="button"
        className={cn(
          buttonVariants({ size: 'lg', variant: 'default' }),
          'h-14 w-14 min-w-14 rounded-full p-0 shadow-lg',
        )}
        aria-expanded={open}
        aria-label="Quick contact"
        {...getReferenceProps()}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
