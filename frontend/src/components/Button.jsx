import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = "px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap";
  
  const variants = {
    primary: "bg-primary-green hover:bg-emerald-500 text-white glow hover:shadow-[0_0_25px_rgba(34,197,94,0.7)]",
    secondary: "bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white backdrop-blur-md border border-gray-200 dark:border-white/10",
    outline: "border-2 border-primary-green text-primary-green hover:bg-primary-green/10 dark:hover:bg-primary-green/20",
    ghost: "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
