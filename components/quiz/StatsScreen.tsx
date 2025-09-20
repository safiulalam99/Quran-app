'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getStoredStats, getAchievements } from '../../utils/statsStorage';
import { useTheme } from '../../contexts/ThemeContext';
import Navigation from '../ui/Navigation';

interface QuizStats {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  timeSpent: number;
}

interface StatsScreenProps {
  stats: QuizStats;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export default function StatsScreen({ stats, onPlayAgain, onBackToMenu }: StatsScreenProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const { theme } = useTheme();

  // Simple score animation
  useEffect(() => {
    const duration = 1500;
    const steps = 30;
    const stepTime = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedScore(Math.round(stats.accuracy * progress));

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedScore(Math.round(stats.accuracy));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [stats]);

  const getPerformanceEmoji = () => {
    if (stats.accuracy >= 90) return '🌟';
    if (stats.accuracy >= 75) return '🎉';
    if (stats.accuracy >= 60) return '👍';
    return '💪';
  };

  const getPerformanceMessage = () => {
    if (stats.accuracy >= 90) return 'WOW! You\'re amazing! 🌟';
    if (stats.accuracy >= 75) return 'Great job! You\'re doing awesome! 🎉';
    if (stats.accuracy >= 60) return 'Good work! Keep practicing! 👏';
    return 'You\'re learning! Try again! 💪';
  };

  const getGrade = () => {
    if (stats.accuracy >= 90) return 'A+';
    if (stats.accuracy >= 80) return 'A';
    if (stats.accuracy >= 70) return 'B';
    if (stats.accuracy >= 60) return 'C';
    return 'Keep Trying!';
  };

  return (
    <>
      <Navigation currentMode="quiz" onModeChange={() => {}} />
      <div className={`min-h-screen p-4 pb-24 md:pb-4 pt-12 md:pt-8 flex items-center justify-center ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
      }`}>
        <motion.div
          className={`max-w-md w-full rounded-3xl shadow-2xl p-8 text-center relative overflow-hidden ${
            theme === 'dark' ? 'bg-slate-700' : 'bg-white'
          }`}
          initial={{ scale: 0, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "backOut" }}
        >
          {/* Celebration confetti */}
          {stats.accuracy >= 70 && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'][i % 6],
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [-10, -30, -10],
                    x: [0, Math.random() * 20 - 10, 0],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          )}

          {/* Giant emoji based on performance */}
          <motion.div
            className="text-9xl mb-6"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "backOut" }}
          >
            {getPerformanceEmoji()}
          </motion.div>

          {/* Score display */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className={`text-6xl font-bold mb-2 ${
              animatedScore >= 80 ? 'text-green-500' :
              animatedScore >= 60 ? 'text-blue-500' : 'text-orange-500'
            }`}>
              {animatedScore}%
            </div>
            <div className={`text-2xl font-bold mb-3 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Grade: {getGrade()}
            </div>
          </motion.div>

          {/* Simple stats */}
          <motion.div
            className={`mb-6 p-4 rounded-2xl ${
              theme === 'dark' ? 'bg-slate-600' : 'bg-gray-50'
            }`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className="flex justify-around text-center">
              <div>
                <div className="text-3xl">✅</div>
                <div className={`text-xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                  {stats.correctAnswers}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Correct
                </div>
              </div>
              <div>
                <div className="text-3xl">📝</div>
                <div className={`text-xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                  {stats.totalQuestions}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Total
                </div>
              </div>
            </div>
          </motion.div>

          {/* Encouraging message */}
          <motion.p
            className={`text-lg font-medium mb-8 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            {getPerformanceMessage()}
          </motion.p>

          {/* Action buttons */}
          <motion.div
            className="flex flex-col gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
          >
            <motion.button
              onClick={onPlayAgain}
              className="bg-gradient-to-r from-[#58CC02] to-[#89E219] text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-lg"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
            >
              🔄 Try Again
            </motion.button>

            <motion.button
              onClick={onBackToMenu}
              className={`px-6 py-4 rounded-2xl font-bold text-lg border-2 ${
                theme === 'dark'
                  ? 'bg-slate-600 border-slate-500 text-white hover:bg-slate-500'
                  : 'bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200'
              }`}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
            >
              🏠 Back Home
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}