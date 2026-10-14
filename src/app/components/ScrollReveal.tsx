import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { useRef } from 'react';

/* ─────────────────────────────────────────────────────────
   Shared easing curves: long gentle deceleration
───────────────────────────────────────────────────────── */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const EASE_SMOOTH   = [0.22, 1, 0.36, 1] as const;

type Direction = 'up' | 'down' | 'left' | 'right' | 'corner-left' | 'corner-right' | 'none';

/* ─────────────────────────────────────────────────────────
   1. ScrollReveal — generic fade+slide+blur wrapper
───────────────────────────────────────────────────────── */
type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  distance?: number;
  y?: number;
  direction?: Direction;
  blur?: boolean;
  once?: boolean;
};

export function ScrollReveal({
  children,
  className,
  delay = 0,
  duration = 1.25,
  distance = 40,
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
   2. BlurReveal — text slides upward with blur-to-sharp dissolve
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
  duration = 1.35,
  direction = 'up',
}: BlurRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const x = shouldReduceMotion || direction === 'none'
    ? 0
    : direction === 'left' ? 28 : direction === 'right' ? -28 : 0;
  const y = shouldReduceMotion || direction === 'none'
    ? 0
    : direction === 'up' ? 32 : direction === 'down' ? -32 : 0;

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        x,
        y,
        filter: shouldReduceMotion ? 'none' : 'blur(10px)',
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
      All text slides upward smoothly from below
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
  stagger = 0.18,
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

/** Stagger item: slides up with blur dissolution */
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
          y: shouldReduceMotion ? 0 : 36,
          filter: blur && !shouldReduceMotion ? 'blur(8px)' : 'none',
        },
        visible: {
          opacity: 1,
          y: 0,
          filter: 'none',
          transition: {
            duration: shouldReduceMotion ? 0.2 : 1.25,
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
   4. ImageReveal — prominent sliding from screen edge/corner
      into place with overflow-hidden and soft blur-to-sharp
───────────────────────────────────────────────────────── */
type ImageRevealProps = {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  delay?: number;
  duration?: number;
  distance?: number;
  from?: Direction;
  parallax?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill';
};

export function ImageReveal({
  src,
  alt,
  className = 'w-full h-full object-cover',
  wrapperClassName = '',
  delay = 0,
  duration = 1.55,
  distance = 220,
  from = 'corner-left',
  parallax = false,
  objectFit = 'cover',
}: ImageRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ['5%', '-5%']);

  // Prominent slide offsets from screen edges or corners
  let xInit = 0;
  let yInit = 0;

  if (!shouldReduceMotion && from !== 'none') {
    switch (from) {
      case 'left':
        xInit = -distance;
        break;
      case 'right':
        xInit = distance;
        break;
      case 'corner-left':
        xInit = -distance;
        yInit = Math.round(distance * 0.38);
        break;
      case 'corner-right':
        xInit = distance;
        yInit = Math.round(distance * 0.38);
        break;
      case 'up':
        yInit = -distance;
        break;
      case 'down':
        yInit = distance;
        break;
    }
  }

  return (
    <motion.div
      ref={ref}
      className={`overflow-hidden will-change-transform ${wrapperClassName}`}
      initial={{
        opacity: 0,
        x: xInit,
        y: yInit,
        scale: shouldReduceMotion ? 1 : 0.94,
        filter: shouldReduceMotion ? 'none' : 'blur(8px)',
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        filter: 'none',
      }}
      viewport={{ once: true, margin: '-6% 0px -4% 0px' }}
      transition={{
        duration: shouldReduceMotion ? 0.25 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: EASE_OUT_EXPO,
      }}
    >
      <motion.img
        src={src}
        alt={alt}
        className={className}
        style={{
          objectFit,
          ...(parallax && !shouldReduceMotion ? { y: parallaxY } : {}),
        }}
        loading="lazy"
        decoding="async"
      />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   5. SectionTransition — cinematic entrance
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
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 45 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-5% 0px -5% 0px' }}
      transition={{
        duration: shouldReduceMotion ? 0.2 : 1.25,
        delay: shouldReduceMotion ? 0 : delay,
        ease: EASE_OUT_EXPO,
      }}
    >
      {children}
    </motion.div>
  );
}

