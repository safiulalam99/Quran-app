'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getStoredStats, getAchievements } from '../../utils/statsStorage';
import { useTheme } from '../../contexts/ThemeContext';

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
  const [animatedStats, setAnimatedStats] = useState({
    accuracy: 0,
    correctAnswers: 0,
    timeSpent: 0
  });
  const [userStats, setUserStats] = useState(getStoredStats());
  const [achievements, setAchievements] = useState(getAchievements(userStats));
  const { theme } = useTheme();

  // Load fresh stats on mount
  useEffect(() => {
    const freshStats = getStoredStats();
    setUserStats(freshStats);
    setAchievements(getAchievements(freshStats));
  }, []);

  // Animate numbers counting up
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedStats({
        accuracy: Math.round(stats.accuracy * progress),
        correctAnswers: Math.round(stats.correctAnswers * progress),
        timeSpent: Math.round(stats.timeSpent * progress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedStats({
          accuracy: Math.round(stats.accuracy),
          correctAnswers: stats.correctAnswers,
          timeSpent: stats.timeSpent
        });
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
    if (stats.accuracy >= 90) return 'Amazing! You\'re a star!';
    if (stats.accuracy >= 75) return 'Great job! Keep it up!';
    if (stats.accuracy >= 60) return 'Good work! Practice makes perfect!';
    return 'Keep trying! You\'re learning!';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className={`min-h-screen p-4 pb-24 md:pb-4 pt-4 md:pt-0 flex items-center justify-center ${
      theme === 'dark' ? 'bg-slate-800' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <motion.div
        className={`max-w-2xl w-full rounded-3xl shadow-2xl p-8 text-center ${
          theme === 'dark' ? 'bg-slate-700' : 'bg-white'
        }`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="text-8xl mb-4">
            {getPerformanceEmoji()}
          </div>
          <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Quiz Complete!
          </h1>
          <p className={`text-xl ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {getPerformanceMessage()}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Accuracy */}
          <motion.div
            className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-6 border-2 border-green-300"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-3xl font-bold text-green-700 mb-1">
              {animatedStats.accuracy}%
            </div>
            <div className="text-sm text-green-600 font-medium">
              Accuracy
            </div>
          </motion.div>

          {/* Correct Answers */}
          <motion.div
            className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-6 border-2 border-blue-300"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="text-4xl mb-2">✅</div>
            <div className="text-3xl font-bold text-blue-700 mb-1">
              {animatedStats.correctAnswers}
            </div>
            <div className="text-sm text-blue-600 font-medium">
              Correct
            </div>
          </motion.div>

          {/* Time */}
          <motion.div
            className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-6 border-2 border-purple-300"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="text-4xl mb-2">⏱️</div>
            <div className="text-3xl font-bold text-purple-700 mb-1">
              {formatTime(animatedStats.timeSpent)}
            </div>
            <div className="text-sm text-purple-600 font-medium">
              Time
            </div>
          </motion.div>
        </div>

        {/* Progress Ring */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress circle */}
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                stroke="#58CC02"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 40}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                animate={{ 
                  strokeDashoffset: 2 * Math.PI * 40 * (1 - stats.accuracy / 100)
                }}
                transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {animatedStats.accuracy}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* Overall Progress */}
        <motion.div
          className={`mb-8 rounded-2xl p-6 ${
            theme === 'dark' ? 'bg-slate-600' : 'bg-gray-100'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <h3 className={`text-xl font-bold mb-4 text-center ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>Your Journey</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-[#58CC02]">{userStats.totalSessions}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Total Quizzes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#58CC02]">{Math.round(userStats.averageAccuracy)}%</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Average Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#58CC02]">{userStats.currentStreak}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Current Streak</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#58CC02]">{userStats.totalCorrectAnswers}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Letters Learned</div>
            </div>
          </div>
        </motion.div>

        {/* Achievement Badges */}
        {achievements.length > 0 && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
          >
            <h3 className={`text-xl font-bold mb-4 text-center ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>Achievements</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.name}
                  className="bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-300 rounded-full px-4 py-2 flex items-center space-x-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.6 + index * 0.1 }}
                >
                  <span className="text-xl">{achievement.emoji}</span>
                  <span className="text-sm font-bold text-yellow-700">{achievement.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          <motion.button
            onClick={onPlayAgain}
            className="bg-gradient-to-r from-[#58CC02] to-[#89E219] text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            🎯 Play Again
          </motion.button>
          
          <motion.button
            onClick={onBackToMenu}
            className={`border-2 px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 ${
              theme === 'dark' 
                ? 'bg-slate-600 border-slate-500 text-white hover:bg-slate-500'
                : 'bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200'
            }`}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            📚 Back to Learning
          </motion.button>
        </motion.div>

        {/* Floating particles animation */}
        {stats.accuracy >= 80 && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-20, -40, -20],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}