import { Link } from 'react-router';
import { motion } from 'motion/react';
import { MapPin, Users, Gift, Heart, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { PremiumDarkStatTile } from './PremiumDarkStatTile';
import { GlassIconChip } from './GlassIconChip';
import type { Ashram, User } from '../../types';

type Props = {
  ashram: Ashram;
  currentUser: User | null;
  heroImage: string;
  galleryThumbs: string[];
  needsCount: number;
  urgentNeedsCount: number;
  getFirstName: (name: string) => string;
  onExplore: () => void;
};

export function HomeAshramIntro({
  ashram,
  currentUser,
  heroImage,
  galleryThumbs,
  needsCount,
  urgentNeedsCount,
  getFirstName,
  onExplore,
}: Props) {
  const thumbs =
    galleryThumbs.length > 0 ? galleryThumbs : [heroImage, heroImage, heroImage];

  return (
    <div className="relative px-4 pb-11 pt-8 max-w-[480px] mx-auto w-full">
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-5 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-white/50"
      >
        Orphanage Connect
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.06, type: 'spring', stiffness: 120, damping: 18 }}
        className="relative"
      >
        {/* Outer 3D rim */}
        <div
          className="pointer-events-none absolute -inset-[2px] rounded-[2.35rem] sm:rounded-[2.6rem] bg-gradient-to-b from-white/[0.12] via-primary/20 to-transparent opacity-80 blur-[1px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -inset-px rounded-[2.28rem] sm:rounded-[2.52rem] shadow-[0_32px_80px_-12px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.06)]"
          aria-hidden
        />

        <div className="relative overflow-hidden rounded-[2.2rem] bg-[#0d1018] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.06)] ring-1 ring-white/[0.07] sm:rounded-[2.45rem]">
          {/* Image capsule */}
          <div className="relative aspect-[16/11] max-h-[min(52vw,248px)] w-full shrink-0 overflow-hidden rounded-t-[2.15rem] rounded-b-[2.35rem] sm:max-h-[268px] sm:rounded-t-[2.35rem] sm:rounded-b-[2.55rem]">
            <img src={heroImage} alt="" className="h-full w-full object-cover scale-[1.03]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1018] via-[#0d1018]/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0d1018]/90 to-transparent" />

            <div className="absolute left-3 top-3 right-3 flex items-start justify-between gap-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/90 px-3.5 py-1.5 text-[11px] font-semibold text-primary-foreground shadow-[0_8px_28px_rgba(15,109,78,0.45),inset_0_1px_0_0_rgba(255,255,255,0.25)] ring-1 ring-white/25 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-200 shadow-[0_0_12px_rgba(167,243,208,0.95)]" />
                Verified NGO
              </div>
              <Link to="/profile" className="block active:scale-95 transition-transform">
                <GlassIconChip
                  emphasis
                  className="h-11 w-11 shrink-0 rounded-full text-sm font-bold text-white"
                >
                  {currentUser?.name ? currentUser.name.charAt(0) : 'G'}
                </GlassIconChip>
              </Link>
            </div>
          </div>

          {/* Body: curved overlap */}
          <div className="relative -mt-6 flex flex-col rounded-t-[1.85rem] rounded-b-[2.15rem] bg-gradient-to-b from-[#0f141c] via-[#0c1018] to-[#080b11] px-5 pb-7 pt-6 shadow-[0_-24px_48px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.04] sm:-mt-7 sm:rounded-t-[2.1rem] sm:rounded-b-[2.4rem] sm:px-6 sm:pb-8 sm:pt-7">
            <p className="text-[13px] text-white/60">
              Namaste,{' '}
              <span className="font-medium text-[#E8F5E9]">
                {currentUser?.name ? getFirstName(currentUser.name) : 'Guest'}
              </span>
            </p>
            <p className="mb-3 text-[11px] font-medium text-primary/75">Welcome to our family</p>

            <div className="mb-3 flex -space-x-2">
              {thumbs.map((url, i) => (
                <div
                  key={`${url}-${i}`}
                  className="h-10 w-10 overflow-hidden rounded-full border-2 border-[#0f141c] bg-black/30 shadow-[0_6px_16px_rgba(0,0,0,0.45)] ring-2 ring-primary/35"
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>

            <h1 className="font-serif text-[22px] font-semibold leading-tight tracking-tight text-white drop-shadow-sm sm:text-2xl">
              {ashram.name}
            </h1>
            <div className="mt-2 flex items-start gap-2 text-[13px] text-white/65">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary drop-shadow-[0_0_12px_rgba(15,109,78,0.5)]" />
              <span className="leading-snug">{ashram.location}</span>
            </div>
            <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-white/48">
              {ashram.description}
            </p>

            <div className="mt-6 grid grid-cols-3 gap-2.5 sm:gap-3">
              <PremiumDarkStatTile
                variant="primary"
                icon={<Users className="h-4 w-4 text-emerald-200" />}
                value="50+"
                label="Children"
              />
              <PremiumDarkStatTile
                variant="secondary"
                icon={<Gift className="h-4 w-4 text-emerald-200/95" />}
                value={needsCount}
                label="Needs"
              />
              <PremiumDarkStatTile
                variant="accent"
                icon={<Heart className="h-4 w-4 text-rose-200/95" />}
                value="₹1.2L"
                label="This mo."
              />
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] text-white/45">
                {urgentNeedsCount} urgent need{urgentNeedsCount === 1 ? '' : 's'} right now
              </p>
              <Button
                type="button"
                className="h-12 w-full rounded-full border-0 bg-primary text-[14px] font-semibold text-primary-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_14px_40px_-6px_rgba(15,109,78,0.55)] transition-all hover:bg-primary/92 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_18px_44px_-6px_rgba(15,109,78,0.5)] active:scale-[0.98] sm:w-auto sm:min-w-[148px] sm:shrink-0"
                onClick={onExplore}
              >
                Explore <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
