import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Recycle, Cpu, ScanLine, Leaf, Droplets } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const ParticleBackground = () => {
  const [particles, setParticles] = useState([]);
  const location = useLocation();

  useEffect(() => {
    // Generate particles only on the client side to avoid hydration mismatches
    const icons = [Recycle, Cpu, ScanLine, Leaf, Droplets];
    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      size: Math.random() * 24 + 12,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 25 + 20,
      delay: Math.random() * 5,
      iconIndex: Math.floor(Math.random() * icons.length),
      opacity: Math.random() * 0.15 + 0.1, // Brighter nodes
    }));
    setParticles(newParticles);
  }, []);

  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const icons = [Recycle, Cpu, ScanLine, Leaf, Droplets];

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-slate-100 dark:bg-[#081420] transition-colors duration-300">
      {/* Subtle Tech Grid */}
      <div 
        className="absolute inset-0 opacity-[0.07]" 
        style={{ 
          backgroundImage: 'linear-gradient(#22c55e 1px, transparent 1px), linear-gradient(90deg, #22c55e 1px, transparent 1px)',
          backgroundSize: '40px 40px' 
        }} 
      />

      {/* Radial Gradient for depth (makes edges darker) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,#f1f5f9_100%)] dark:bg-[radial-gradient(circle_at_50%_50%,transparent_0%,#081420_100%)] transition-colors duration-300" />

      {/* Floating Eco/AI Particles */}
      {particles.map((p) => {
        const Icon = icons[p.iconIndex];
        return (
          <motion.div
            key={p.id}
            className="absolute text-green-500"
            initial={{ 
              x: `${p.x}vw`, 
              y: `${p.y}vh`, 
              opacity: p.opacity,
              rotate: 0,
            }}
            animate={{ 
              x: [`${p.x}vw`, `${p.x + (Math.random() * 10 - 5)}vw`, `${p.x}vw`],
              y: [`${p.y}vh`, `${p.y - 15}vh`, `${p.y}vh`],
              rotate: [0, 180, 360],
            }}
            transition={{ 
              duration: p.duration,
              repeat: Infinity,
              ease: "linear",
              delay: p.delay,
            }}
          >
            <Icon size={p.size} />
          </motion.div>
        )
      })}
    </div>
  );
};

export default ParticleBackground;
