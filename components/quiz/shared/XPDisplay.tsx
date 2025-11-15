'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import type { XPSystem } from '../../../types/quiz.types';

interface XPDisplayProps {
  readonly xpSystem: XPSystem;
  readonly recentXP?: number; // XP just earned (for animation)
}

export default function XPDisplay({ xpSystem, recentXP }: XPDisplayProps) {
  const { theme } = useTheme();
  const progressPercentage =
    (xpSystem.xpInCurrentLevel / xpSystem.xpToNextLevel) * 100;

  return (
    <div className="relative">
      {/* Level badge */}
      <div className="flex items-center space-x-3">
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg shadow-lg ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-purple-600 to-purple-800 text-white'
              : 'bg-gradient-to-br from-purple-400 to-purple-600 text-white'
          }`}
        >
          {xpSystem.currentLevel}
        </div>

        {/* XP bar */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span
              className={`text-xs font-semibold ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Level {xpSystem.currentLevel}
            </span>
            <span
              className={`text-xs font-semibold ${
                theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
              }`}
            >
              {xpSystem.xpInCurrentLevel} / {xpSystem.xpToNextLevel} XP
            </span>
          </div>

          <div
            className={`relative h-2 rounded-full overflow-hidden ${
              theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
            }`}
          >
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{
                type: 'spring',
                stiffness: 80,
                damping: 15,
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent XP gained animation */}
      <AnimatePresence>
        {recentXP && recentXP > 0 && (
          <motion.div
            className="absolute -top-8 right-0 text-xl font-bold text-yellow-500 pointer-events-none"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 1.2 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            +{recentXP} XP
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
