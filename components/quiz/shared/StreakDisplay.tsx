'use client';

import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';

interface StreakDisplayProps {
  readonly currentStreak: number;
  readonly showAnimation?: boolean;
}

export default function StreakDisplay({
  currentStreak,
  showAnimation = false,
}: StreakDisplayProps) {
  const { theme } = useTheme();

  if (currentStreak === 0) return null;

  const getStreakColor = () => {
    if (currentStreak >= 10) return 'from-red-500 to-orange-500';
    if (currentStreak >= 5) return 'from-orange-500 to-yellow-500';
    return 'from-yellow-500 to-amber-500';
  };

  return (
    <motion.div
      className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg ${
        theme === 'dark'
          ? 'bg-slate-800 border border-orange-500/50'
          : 'bg-white border border-orange-300'
      }`}
      initial={{ scale: showAnimation ? 0.8 : 1 }}
      animate={{ scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 15,
      }}
    >
      {/* Flame icon */}
      <motion.div
        className={`text-2xl bg-gradient-to-br ${getStreakColor()} bg-clip-text text-transparent`}
        animate={
          showAnimation
            ? {
                scale: [1, 1.2, 1],
                rotate: [0, -10, 10, 0],
              }
            : {}
        }
        transition={{ duration: 0.5 }}
      >
        🔥
      </motion.div>

      {/* Streak count */}
      <motion.span
        className={`font-bold text-lg ${
          theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
        }`}
        animate={
          showAnimation
            ? {
                scale: [1, 1.3, 1],
              }
            : {}
        }
        transition={{ duration: 0.3 }}
      >
        {currentStreak}
      </motion.span>

      {/* Pulse effect for high streaks */}
      {currentStreak >= 5 && (
        <motion.div
          className="absolute inset-0 rounded-full bg-orange-500/20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  );
}
