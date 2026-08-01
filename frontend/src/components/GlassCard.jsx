import React, { useRef, useState, useCallback } from 'react';
import { motion, useInView, useSpring, useTransform, useMotionValue, useMotionTemplate } from 'framer-motion';

const GlassCard = ({ children, className = '', delay = 0, tilt = true, fullHeight = false, ...props }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-60px' });
  const [hovered, setHovered] = useState(false);

  /* ── mouse-tracking motion values ── */
  const rawX = useMotionValue(0.5); // 0..1 across card width
  const rawY = useMotionValue(0.5);

  const springCfg = { stiffness: 220, damping: 22 };
  const rotateY = useSpring(useTransform(rawX, [0, 1], [-12, 12]), springCfg);
  const rotateX = useSpring(useTransform(rawY, [0, 1], [10, -10]), springCfg);

  // Glare: radial highlight that follows cursor
  const glareX = useTransform(rawX, [0, 1], [0, 100]);
  const glareY = useTransform(rawY, [0, 1], [0, 100]);
  const glareGradient = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.13) 0%, transparent 65%)`;

  const handleMouseMove = useCallback((e) => {
    if (!tilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width);
    rawY.set((e.clientY - rect.top) / rect.height);
  }, [tilt, rawX, rawY]);

  const handleMouseLeave = useCallback(() => {
    rawX.set(0.5);
    rawY.set(0.5);
    setHovered(false);
  }, [rawX, rawY]);

  const hFull = fullHeight ? 'h-full' : '';

  return (
    /* Scroll-reveal wrapper */
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 52, scale: 0.93 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, delay, type: 'spring', bounce: 0.32 }}
      style={{ perspective: 1000 }}
      className={hFull}
    >
      {/* Tilt + hover-scale shell */}
      <motion.div
        style={tilt ? { rotateX, rotateY, transformStyle: 'preserve-3d' } : {}}
        whileHover={tilt ? { scale: 1.028 } : {}}
        transition={{ type: 'spring', stiffness: 280, damping: 18 }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        className={`glass-card p-6 relative overflow-hidden cursor-default ${hFull}
          transition-colors duration-300
          hover:border-blue-500/40
          hover:shadow-[0_0_45px_rgba(59,130,246,0.18),0_24px_64px_rgba(0,0,0,0.45)]
          ${className}`}
        {...props}
      >
        {/* Live glare layer */}
        {tilt && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-2xl z-10"
            style={{ background: glareGradient, opacity: hovered ? 1 : 0 }}
            transition={{ opacity: { duration: 0.25 } }}
          />
        )}

        {/* Hover shimmer fill */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background:
              'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, transparent 55%, rgba(59,130,246,0.06) 100%)',
          }}
        />

        {/* Content — h-full so map/chart children can fill the card */}
        <div className={`relative z-[1] ${hFull}`}>{children}</div>
      </motion.div>
    </motion.div>
  );
};

export default GlassCard;
