'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';

interface FeedbackOverlayProps {
  readonly show: boolean;
  readonly isCorrect: boolean;
  readonly message: string;
  readonly xpEarned?: number;
}

export default function FeedbackOverlay({
  show,
  isCorrect,
  message,
  xpEarned = 0,
}: FeedbackOverlayProps) {
  const { theme } = useTheme();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Background overlay */}
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundColor: isCorrect
                ? 'rgba(34, 197, 94, 0.1)'
                : 'rgba(239, 68, 68, 0.1)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Feedback card */}
          <motion.div
            className={`relative px-8 py-6 rounded-3xl shadow-2xl pointer-events-auto ${
              theme === 'dark'
                ? isCorrect
                  ? 'bg-green-900/90 border-2 border-green-500'
                  : 'bg-red-900/90 border-2 border-red-500'
                : isCorrect
                  ? 'bg-green-50 border-2 border-green-400'
                  : 'bg-red-50 border-2 border-red-400'
            }`}
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
            }}
          >
            {/* Icon */}
            <motion.div
              className="text-6xl text-center mb-3"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.1,
              }}
            >
              {isCorrect ? '✓' : '✗'}
            </motion.div>

            {/* Message */}
            <motion.p
              className={`text-2xl font-bold text-center ${
                theme === 'dark'
                  ? isCorrect
                    ? 'text-green-100'
                    : 'text-red-100'
                  : isCorrect
                    ? 'text-green-800'
                    : 'text-red-800'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {message}
            </motion.p>

            {/* XP earned */}
            {isCorrect && xpEarned > 0 && (
              <motion.div
                className="mt-3 flex items-center justify-center space-x-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-3xl">⭐</span>
                <span
                  className={`text-xl font-bold ${
                    theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600'
                  }`}
                >
                  +{xpEarned} XP
                </span>
              </motion.div>
            )}

            {/* Confetti particles for correct answers */}
            {isCorrect && (
              <>
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: [
                        '#fbbf24',
                        '#f59e0b',
                        '#10b981',
                        '#3b82f6',
                        '#8b5cf6',
                        '#ec4899',
                      ][i % 6],
                      top: '50%',
                      left: '50%',
                    }}
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      x: Math.cos((i / 12) * Math.PI * 2) * 100,
                      y: Math.sin((i / 12) * Math.PI * 2) * 100,
                    }}
                    transition={{
                      duration: 0.8,
                      ease: 'easeOut',
                      delay: 0.2,
                    }}
                  />
                ))}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
