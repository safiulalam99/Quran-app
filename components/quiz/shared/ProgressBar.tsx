'use client';

import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';

interface ProgressBarProps {
  readonly current: number;
  readonly total: number;
  readonly showNumbers?: boolean;
}

export default function ProgressBar({
  current,
  total,
  showNumbers = true,
}: ProgressBarProps) {
  const { theme } = useTheme();
  const percentage = (current / total) * 100;

  return (
    <div className="w-full">
      {/* Progress numbers */}
      {showNumbers && (
        <div className="flex justify-between items-center mb-2">
          <span
            className={`text-sm font-semibold ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Question {current} of {total}
          </span>
          <span
            className={`text-sm font-semibold ${
              theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
            }`}
          >
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      {/* Progress bar track */}
      <div
        className={`relative h-3 rounded-full overflow-hidden ${
          theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
        }`}
      >
        {/* Progress bar fill */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 20,
          }}
        >
          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
