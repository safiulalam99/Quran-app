'use client';

import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className={`
        relative w-14 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out
        ${theme === 'dark' 
          ? 'bg-slate-700 hover:bg-slate-600' 
          : 'bg-yellow-200 hover:bg-yellow-300'
        }
      `}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      initial={false}
    >
      {/* Toggle circle */}
      <motion.div
        className={`
          w-5 h-5 rounded-full flex items-center justify-center text-xs
          ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}
        `}
        layout
        animate={{
          x: theme === 'dark' ? 0 : 28
        }}
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30
        }}
      >
        <motion.span
          key={theme} // Force re-render for smooth icon transition
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ duration: 0.2 }}
          className={theme === 'dark' ? 'text-slate-400' : 'text-yellow-600'}
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </motion.span>
      </motion.div>
    </motion.button>
  );
}