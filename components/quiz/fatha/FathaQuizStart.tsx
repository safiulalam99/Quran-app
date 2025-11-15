'use client';

import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { loadUserProgress, getAllMemoryStates } from '../../../utils/quiz/storage';
import { getSRSStats } from '../../../utils/quiz/spacedRepetition';

interface FathaQuizStartProps {
  readonly onStart: () => void;
  readonly onBack: () => void;
}

export default function FathaQuizStart({ onStart, onBack }: FathaQuizStartProps) {
  const { theme } = useTheme();
  const userProgress = loadUserProgress();
  const srsStats = getSRSStats(getAllMemoryStates(userProgress));

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
          <div className="text-7xl mb-4">🎯</div>
          <h1 className={`text-4xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Fatha Quiz
          </h1>
          <p className={`text-lg ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Test your Fatha pronunciation knowledge!
          </p>
        </motion.div>

        {/* Progress overview */}
        <motion.div
          className={`p-6 rounded-2xl mb-8 ${
            theme === 'dark' ? 'bg-slate-700' : 'bg-gradient-to-br from-emerald-50 to-teal-50'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className={`text-lg font-bold mb-4 text-center ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Your Progress
          </h3>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Mastered */}
            <div className="text-center">
              <div className="text-3xl font-bold mb-1" style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {srsStats.mastered}
              </div>
              <div className={`text-xs font-semibold ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                ⭐ Mastered
              </div>
            </div>

            {/* Familiar */}
            <div className="text-center">
              <div className={`text-3xl font-bold mb-1 ${
                theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
              }`}>
                {srsStats.familiar}
              </div>
              <div className={`text-xs font-semibold ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                🌕 Familiar
              </div>
            </div>

            {/* Learning */}
            <div className="text-center">
              <div className={`text-3xl font-bold mb-1 ${
                theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
              }`}>
                {srsStats.learning}
              </div>
              <div className={`text-xs font-semibold ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                🌓 Learning
              </div>
            </div>

            {/* New */}
            <div className="text-center">
              <div className={`text-3xl font-bold mb-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {srsStats.new}
              </div>
              <div className={`text-xs font-semibold ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                🌑 New
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm font-semibold ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Overall Progress
              </span>
              <span className={`text-sm font-bold ${
                theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
              }`}>
                {srsStats.progressPercentage}%
              </span>
            </div>
            <div className={`h-3 rounded-full overflow-hidden ${
              theme === 'dark' ? 'bg-slate-600' : 'bg-gray-200'
            }`}>
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${srsStats.progressPercentage}%` }}
                transition={{ duration: 1, delay: 0.6 }}
              />
            </div>
          </div>
        </motion.div>

        {/* XP and Level */}
        <motion.div
          className="flex items-center justify-center space-x-6 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="text-center">
            <div className={`flex items-center justify-center w-16 h-16 rounded-xl font-bold text-2xl shadow-lg mb-2 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-purple-600 to-purple-800 text-white'
                : 'bg-gradient-to-br from-purple-400 to-purple-600 text-white'
            }`}>
              {userProgress.xp.currentLevel}
            </div>
            <div className={`text-sm font-semibold ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Level
            </div>
          </div>

          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
            }`}>
              {userProgress.xp.totalXP}
            </div>
            <div className={`text-sm font-semibold ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Total XP
            </div>
          </div>

          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
            }`}>
              {userProgress.streak.dailyStreak}
            </div>
            <div className={`text-sm font-semibold ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              🔥 Day Streak
            </div>
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          className={`p-4 rounded-xl mb-8 ${
            theme === 'dark' ? 'bg-blue-900/20 border border-blue-500/50' : 'bg-blue-50 border border-blue-200'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-start space-x-3">
            <div className="text-2xl">ℹ️</div>
            <div className="flex-1">
              <h4 className={`font-bold mb-1 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
              }`}>
                How it works
              </h4>
              <ul className={`text-sm space-y-1 ${
                theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
              }`}>
                <li>• 10 questions per quiz</li>
                <li>• Listen and tap the correct letter</li>
                <li>• Earn XP and unlock achievements</li>
                <li>• Questions adapt to your learning progress</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <motion.button
            onClick={onStart}
            className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg shadow-lg ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🚀 Start Quiz
          </motion.button>

          <motion.button
            onClick={onBack}
            className={`sm:w-auto py-4 px-6 rounded-xl font-bold text-lg shadow-lg ${
              theme === 'dark'
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ← Back
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
