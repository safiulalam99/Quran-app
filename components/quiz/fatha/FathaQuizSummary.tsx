'use client';

import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import type { QuizSessionStats } from '../../../types/quiz.types';
import { ACHIEVEMENTS } from '../../../utils/quiz/gamification';

interface FathaQuizSummaryProps {
  readonly stats: QuizSessionStats;
  readonly onPlayAgain: () => void;
  readonly onBackToMenu: () => void;
}

export default function FathaQuizSummary({
  stats,
  onPlayAgain,
  onBackToMenu,
}: FathaQuizSummaryProps) {
  const { theme } = useTheme();

  const getPerformanceMessage = () => {
    if (stats.accuracy === 100) return { emoji: '🏆', message: 'Perfect Score!' };
    if (stats.accuracy >= 90) return { emoji: '🌟', message: 'Excellent!' };
    if (stats.accuracy >= 75) return { emoji: '✨', message: 'Great Job!' };
    if (stats.accuracy >= 50) return { emoji: '💪', message: 'Good Effort!' };
    return { emoji: '📚', message: 'Keep Practicing!' };
  };

  const performance = getPerformanceMessage();

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50'
    }`}>
      <motion.div
        className={`w-full max-w-2xl rounded-3xl shadow-2xl p-8 ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white'
        }`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 20,
        }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-8xl mb-4">{performance.emoji}</div>
          <h1 className={`text-4xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Quiz Complete!
          </h1>
          <p className={`text-2xl font-semibold ${
            theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
          }`}>
            {performance.message}
          </p>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          className="grid grid-cols-2 gap-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Accuracy */}
          <div className={`p-6 rounded-2xl text-center ${
            theme === 'dark' ? 'bg-slate-700' : 'bg-gradient-to-br from-emerald-50 to-teal-50'
          }`}>
            <div className="text-5xl font-bold mb-2" style={{
              background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {stats.accuracy}%
            </div>
            <div className={`text-sm font-semibold ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Accuracy
            </div>
          </div>

          {/* XP Earned */}
          <div className={`p-6 rounded-2xl text-center ${
            theme === 'dark' ? 'bg-slate-700' : 'bg-gradient-to-br from-purple-50 to-pink-50'
          }`}>
            <div className="text-5xl font-bold mb-2" style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {stats.xpEarned}
            </div>
            <div className={`text-sm font-semibold ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              XP Earned
            </div>
          </div>

          {/* Correct answers */}
          <div className={`p-6 rounded-2xl text-center ${
            theme === 'dark' ? 'bg-slate-700' : 'bg-gradient-to-br from-green-50 to-emerald-50'
          }`}>
            <div className={`text-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-green-400' : 'text-green-600'
            }`}>
              ✓ {stats.correctAnswers}
            </div>
            <div className={`text-sm font-semibold ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Correct
            </div>
          </div>

          {/* Wrong answers */}
          <div className={`p-6 rounded-2xl text-center ${
            theme === 'dark' ? 'bg-slate-700' : 'bg-gradient-to-br from-red-50 to-orange-50'
          }`}>
            <div className={`text-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-red-400' : 'text-red-600'
            }`}>
              ✗ {stats.wrongAnswers}
            </div>
            <div className={`text-sm font-semibold ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Incorrect
            </div>
          </div>
        </motion.div>

        {/* New achievements */}
        {stats.newAchievements && stats.newAchievements.length > 0 && (
          <motion.div
            className={`p-6 rounded-2xl mb-8 ${
              theme === 'dark' ? 'bg-yellow-900/20 border-2 border-yellow-600' : 'bg-yellow-50 border-2 border-yellow-400'
            }`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className={`text-xl font-bold mb-4 text-center ${
              theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'
            }`}>
              🏆 New Achievements!
            </h3>
            <div className="space-y-2">
              {stats.newAchievements.map((id) => {
                const achievement = ACHIEVEMENTS.find((a) => a.id === id);
                if (!achievement) return null;

                return (
                  <div
                    key={id}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-slate-800' : 'bg-white'
                    }`}
                  >
                    <span className="text-3xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <div className={`font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {achievement.name}
                      </div>
                      <div className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {achievement.description}
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${
                      theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                    }`}>
                      +{achievement.reward} XP
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Perfect round badge */}
        {stats.perfectRound && (
          <motion.div
            className="text-center mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.8,
            }}
          >
            <div className={`inline-block px-6 py-3 rounded-full ${
              theme === 'dark' ? 'bg-gradient-to-r from-yellow-600 to-orange-600' : 'bg-gradient-to-r from-yellow-400 to-orange-400'
            } text-white font-bold text-lg shadow-lg`}>
              💯 Perfect Round! +{stats.xpEarned} Bonus XP
            </div>
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <motion.button
            onClick={onPlayAgain}
            className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg shadow-lg ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🔄 Play Again
          </motion.button>

          <motion.button
            onClick={onBackToMenu}
            className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg shadow-lg ${
              theme === 'dark'
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🏠 Back to Menu
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
