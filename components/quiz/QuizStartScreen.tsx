'use client';

import { motion } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useTheme } from '../../contexts/ThemeContext';

interface QuizStartScreenProps {
  onStartQuiz: () => void;
  onBackToMenu: () => void;
}

export default function QuizStartScreen({ onStartQuiz, onBackToMenu }: QuizStartScreenProps) {
  const { theme } = useTheme();
  
  return (
    <div className={`h-screen flex flex-col p-4 pb-24 md:pb-4 pt-4 md:pt-0 overflow-hidden ${
      theme === 'dark' ? 'bg-slate-800' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      {/* Close button */}
      <div className="flex justify-start mb-4">
        <button 
          onClick={onBackToMenu}
          className={`transition-colors ${
            theme === 'dark' 
              ? 'text-gray-400 hover:text-white' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        {/* Character Animation */}
        <motion.div
          className="w-48 h-48 mb-12"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "backOut" }}
          style={{
            // Ensure crisp rendering
            imageRendering: 'crisp-edges',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)', // Force hardware acceleration
          }}
        >
          <DotLottieReact
            src="https://lottie.host/40c9f475-d6ef-408e-9750-c5f790eeedcf/h7GveJPGuo.lottie"
            loop
            autoplay
            className="w-full h-full"
            style={{
              width: '100%',
              height: '100%',
            }}
            onError={(error) => {
              console.warn('Lottie animation error:', error);
            }}
            speed={1}
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          className={`text-4xl md:text-5xl font-bold mb-16 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Ready to quiz?
        </motion.h1>

        {/* Start Button */}
        <motion.button
          onClick={onStartQuiz}
          className="bg-gradient-to-r from-[#58CC02] to-[#89E219] text-white px-16 py-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-200 w-full max-w-md"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          START
        </motion.button>
      </div>
    </div>
  );
}