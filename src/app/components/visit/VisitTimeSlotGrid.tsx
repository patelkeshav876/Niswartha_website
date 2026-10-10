import { VISIT_TIME_SLOTS } from '../../lib/visitSlots';
import { cn } from '../../lib/utils';

const ACCENT = '#FF6633';

export type SlotAvailability = { booked: number; capacity: number; available: number };

type Props = {
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string) => void;
  availabilityById?: Record<string, SlotAvailability>;
  loading?: boolean;
  ready?: boolean;
  maxSelectable?: number;
};

export function VisitTimeSlotGrid({
  selectedSlotId,
  onSelectSlot,
  loading = false,
  ready = true,
}: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {VISIT_TIME_SLOTS.map((slot) => {
        const disabled = !ready || loading;
        const selected = selectedSlotId === slot.id;

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
              'flex min-h-[48px] flex-col items-center justify-center rounded-xl border px-1 py-2 text-center transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6633] focus-visible:ring-offset-2',
              disabled && 'opacity-60 cursor-not-allowed bg-zinc-50 text-zinc-400',
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
            <span className="text-xs font-semibold">{slot.label}</span>
            <span
              className={cn(
                'mt-0.5 block text-[10px] font-normal',
                selected ? 'text-white/90' : 'text-emerald-700 font-medium'
              )}
            >
              Available
            </span>
          </button>
        );
      })}
    </div>
  );
}
