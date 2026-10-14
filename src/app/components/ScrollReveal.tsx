import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { useRef } from 'react';

/* ─────────────────────────────────────────────────────────
   Shared easing curves
───────────────────────────────────────────────────────── */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const EASE_SMOOTH   = [0.22, 1, 0.36, 1] as const;

/* ─────────────────────────────────────────────────────────
   1. ScrollReveal — generic fade+slide+blur wrapper
      Drop-in replacement for the old ScrollReveal.
      Supports: direction, blur, distance, backward-compatible y.
───────────────────────────────────────────────────────── */
type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  /** Shift amount in px along the primary axis */
  distance?: number;
  /** Backward-compatibility alias for upward distance */
  y?: number;
  direction?: Direction;
  /** Apply blur-to-sharp effect */
  blur?: boolean;
  /** once=false allows re-animation on scroll back */
  once?: boolean;
};

export function ScrollReveal({
  children,
  className,
  delay = 0,
  duration = 0.9,
  distance = 30,
  y: yProp,
  direction = 'up',
  blur = false,
  once = true,
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const effectiveDistance = yProp ?? distance;

  const x = shouldReduceMotion || direction === 'none'
    ? 0
    : direction === 'left' ? effectiveDistance : direction === 'right' ? -effectiveDistance : 0;
  const y = shouldReduceMotion || direction === 'none'
    ? 0
    : direction === 'up' ? effectiveDistance : direction === 'down' ? -effectiveDistance : 0;

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        x,
        y,
        filter: blur && !shouldReduceMotion ? 'blur(10px)' : 'none',
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        filter: 'none',
      }}
      viewport={{ once, margin: '-8% 0px -6% 0px' }}
      transition={{
        duration: shouldReduceMotion ? 0.2 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: EASE_OUT_EXPO,
      }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   2. BlurReveal — blur-to-sharp text/heading reveal
      Animate text from blurry+offset to perfectly sharp.
───────────────────────────────────────────────────────── */
type BlurRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: Direction;
};

export function BlurReveal({
  children,
  className,
  delay = 0,
  duration = 0.95,
  direction = 'up',
}: BlurRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const x = shouldReduceMotion || direction === 'none'
    ? 0
    : direction === 'left' ? 20 : direction === 'right' ? -20 : 0;
  const y = shouldReduceMotion || direction === 'none'
    ? 0
    : direction === 'up' ? 18 : direction === 'down' ? -18 : 0;

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        x,
        y,
        filter: shouldReduceMotion ? 'none' : 'blur(8px)',
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        filter: 'none',
      }}
      viewport={{ once: true, margin: '-6% 0px -4% 0px' }}
      transition={{
        duration: shouldReduceMotion ? 0.2 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: EASE_SMOOTH,
      }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   3. TextRevealGroup — staggered heading + body text
      Children animate in sequence with blur-to-sharp.
───────────────────────────────────────────────────────── */
type TextRevealGroupProps = {
  children: ReactNode;
  className?: string;
  baseDelay?: number;
  stagger?: number;
};

export function TextRevealGroup({
  children,
  className,
  baseDelay = 0,
  stagger = 0.16,
}: TextRevealGroupProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-8% 0px -6% 0px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: shouldReduceMotion ? 0 : stagger,
            delayChildren: shouldReduceMotion ? 0 : baseDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Use inside TextRevealGroup as a stagger child */
export function TextRevealItem({
  children,
  className,
  blur = true,
}: {
  children: ReactNode;
  className?: string;
  blur?: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={{
        hidden: {
          opacity: 0,
          y: shouldReduceMotion ? 0 : 16,
          filter: blur && !shouldReduceMotion ? 'blur(6px)' : 'none',
        },
        visible: {
          opacity: 1,
          y: 0,
          filter: 'none',
          transition: {
            duration: shouldReduceMotion ? 0.2 : 0.85,
            ease: EASE_SMOOTH,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   4. ImageReveal — directional image reveal with
      overflow-hidden clip, blur-to-sharp, and
      optional parallax shift on scroll.
───────────────────────────────────────────────────────── */
type ImageRevealProps = {
  src: string;
  alt: string;
  className?: string;
  /** Wrapper div className (controls border-radius, size, etc.) */
  wrapperClassName?: string;
  delay?: number;
  /** Direction the image slides in FROM */
  from?: Direction;
  /** Enable subtle scroll parallax on the image */
  parallax?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill';
};

export function ImageReveal({
  src,
  alt,
  className = 'w-full h-full object-cover',
  wrapperClassName = '',
  delay = 0,
  from = 'left',
  parallax = false,
  objectFit = 'cover',
}: ImageRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ['6%', '-6%']);

  const xInit = shouldReduceMotion || from === 'none'
    ? 0
    : from === 'left' ? -40 : from === 'right' ? 40 : 0;
  const yInit = shouldReduceMotion || from === 'none'
    ? 0
    : from === 'up' ? -40 : from === 'down' ? 40 : 0;

  return (
    <div ref={ref} className={`overflow-hidden ${wrapperClassName}`}>
      <motion.div
        className="w-full h-full will-change-transform"
        initial={{
          opacity: 0,
          x: xInit,
          y: yInit,
          scale: shouldReduceMotion ? 1 : 1.04,
          filter: shouldReduceMotion ? 'none' : 'blur(8px)',
        }}
        whileInView={{
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          filter: 'none',
        }}
        viewport={{ once: true, margin: '-6% 0px -6% 0px' }}
        transition={{
          duration: shouldReduceMotion ? 0.25 : 1.15,
          delay: shouldReduceMotion ? 0 : delay,
          ease: EASE_OUT_EXPO,
        }}
        style={parallax && !shouldReduceMotion ? { y: parallaxY } : undefined}
      >
        <img
          src={src}
          alt={alt}
          className={className}
          style={{ objectFit }}
          loading="lazy"
          decoding="async"
        />
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   5. SectionTransition — wraps an entire section for
      cinematic entrance (slight y + opacity, no blur).
───────────────────────────────────────────────────────── */
export function SectionTransition({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-5% 0px -5% 0px' }}
      transition={{
        duration: shouldReduceMotion ? 0.2 : 1.0,
        delay: shouldReduceMotion ? 0 : delay,
        ease: EASE_OUT_EXPO,
      }}
    >
      {children}
    </motion.div>
  );
}
