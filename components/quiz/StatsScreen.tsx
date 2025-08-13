'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 pb-20 md:pb-4 flex items-center justify-center">
      <motion.div
        className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 text-center"
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Quiz Complete!
          </h1>
          <p className="text-xl text-gray-600">
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
                stroke="#10b981"
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
              <span className="text-2xl font-bold text-gray-800">
                {animatedStats.accuracy}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* Achievement Badges */}
        {stats.accuracy >= 75 && (
          <motion.div
            className="mb-8 flex justify-center space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            {stats.accuracy >= 90 && (
              <div className="bg-yellow-100 border-2 border-yellow-300 rounded-full px-4 py-2 flex items-center space-x-2">
                <span className="text-2xl">🏆</span>
                <span className="text-sm font-bold text-yellow-700">Perfect!</span>
              </div>
            )}
            {stats.accuracy >= 75 && (
              <div className="bg-green-100 border-2 border-green-300 rounded-full px-4 py-2 flex items-center space-x-2">
                <span className="text-2xl">🎖️</span>
                <span className="text-sm font-bold text-green-700">Great Job!</span>
              </div>
            )}
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
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            🎯 Play Again
          </motion.button>
          
          <motion.button
            onClick={onBackToMenu}
            className="bg-white border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
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