import { VISIT_TIME_SLOTS, VISIT_SLOT_CAPACITY } from '../../lib/visitSlots';
import { cn } from '../../lib/utils';

const ACCENT = '#FF6633';

export type SlotAvailability = { booked: number; capacity: number; available: number };

type Props = {
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string) => void;
  availabilityById: Record<string, SlotAvailability>;
  loading: boolean;
  ready: boolean;
  maxSelectable?: number;
};

export function VisitTimeSlotGrid({
  selectedSlotId,
  onSelectSlot,
  availabilityById,
  loading,
  ready,
  maxSelectable = VISIT_SLOT_CAPACITY,
}: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {VISIT_TIME_SLOTS.map((slot) => {
        const av = availabilityById[slot.id];
        const available = av?.available ?? 0;
        const unavailable = !ready || loading || available <= 0;
        const selected = selectedSlotId === slot.id;
        const tooSmallForParty = ready && !loading && available > 0 && available < maxSelectable;
        const disabled = unavailable || tooSmallForParty;

        return (
          <button
            key={slot.id}
            type="button"
            disabled={disabled}
            aria-pressed={selected}
            aria-disabled={disabled}
            onClick={() => {
              if (!disabled) onSelectSlot(slot.id);
            }}
            className={cn(
              'flex min-h-[48px] flex-col items-center justify-center rounded-xl border px-1 py-2 text-center transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6633] focus-visible:ring-offset-2',
              disabled &&
                'cursor-not-allowed border-red-200 bg-zinc-50 text-red-700',
              tooSmallForParty && 'border-amber-300 bg-amber-50/80 text-amber-900',
              !disabled &&
                !selected &&
                'border-zinc-200 bg-white text-zinc-900 hover:border-orange-300 hover:bg-orange-50/50 active:scale-[0.98]',
              selected &&
                !disabled &&
                'z-[1] border-transparent text-white shadow-md ring-2 ring-[#FF6633]/25',
            )}
            style={
              selected && !disabled ? { backgroundColor: ACCENT, color: '#fff' } : undefined
            }
          >
            <span
              className={cn(
                'text-xs font-semibold',
                unavailable && !tooSmallForParty && 'line-through decoration-red-500/70',
              )}
            >
              {slot.label}
            </span>
            {ready && !loading && av && (
              <span
                className={cn(
                  'mt-0.5 block text-[10px] font-normal opacity-90',
                  selected && !disabled && 'text-white/90',
                )}
              >
                {tooSmallForParty ? `Need ${maxSelectable}` : `${av.available} left`}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
