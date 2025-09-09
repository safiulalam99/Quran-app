'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import arabicLetterForms from '../../app/data/arabic-letter-forms.json';

interface LetterForm {
  letter: string;
  name: string;
  englishName: string;
  sound: string;
  color: string;
  category: string;
  forms: {
    isolated: string;
    initial: string;
    medial: string;
    final: string;
  };
  connects: {
    before: boolean;
    after: boolean;
  };
}

export default function ArabicFormsPage() {
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [playingForm, setPlayingForm] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const { theme } = useTheme();
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const letters = arabicLetterForms.letterForms as LetterForm[];
  const currentLetter = letters[currentLetterIndex];

  // Handle scroll navigation
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const scrollTop = containerRef.current.scrollTop;
      const screenHeight = window.innerHeight;
      const newIndex = Math.round(scrollTop / screenHeight);
      
      if (newIndex !== currentLetterIndex && newIndex >= 0 && newIndex < letters.length) {
        setCurrentLetterIndex(newIndex);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [currentLetterIndex, letters.length]);

  // Play audio for letter forms
  const playFormAudio = async (formType: 'isolated' | 'initial' | 'medial' | 'final') => {
    if (playingForm) return;

    try {
      setPlayingForm(formType);
      setShowFeedback(formType);

      // Play main letter audio
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      }

      // Haptic feedback
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }

      // Clear feedback after animation
      setTimeout(() => {
        setShowFeedback(null);
      }, 1000);

    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  };

  const handleAudioEnd = () => {
    setPlayingForm(null);
  };

  // Get form labels
  const getFormLabel = (formType: string) => {
    const labels = {
      isolated: 'Isolated',
      initial: 'Initial', 
      medial: 'Medial',
      final: 'Final'
    };
    return labels[formType as keyof typeof labels];
  };

  // Smooth scroll to specific letter
  const scrollToLetter = (index: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: index * window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative">
      {/* Audio element */}
      <audio
        ref={audioRef}
        src={`/audio/letters/${currentLetter.letter}.m4a`}
        onEnded={handleAudioEnd}
        preload="metadata"
      />

      {/* Scroll container */}
      <div
        ref={containerRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        {letters.map((letter, letterIndex) => (
          <motion.div
            key={letter.letter}
            className={`h-screen flex flex-col snap-start relative ${
              theme === 'dark' 
                ? 'bg-slate-800' 
                : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Letter Progress Indicator */}
            <div className={`fixed top-4 right-4 z-20 px-3 py-1 rounded-full text-sm font-medium ${
              theme === 'dark' 
                ? 'bg-slate-700 text-gray-300' 
                : 'bg-white/80 text-gray-600'
            }`}>
              {letterIndex + 1} / {letters.length}
            </div>

            {/* Main Letter Display */}
            <div className="flex-1 flex items-center justify-center px-4 md:px-8">
              <motion.div
                className={`w-72 h-72 md:w-80 md:h-80 rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden ${
                  theme === 'dark' 
                    ? 'bg-slate-700 border border-slate-600' 
                    : 'bg-white border border-gray-200'
                }`}
                style={{
                  boxShadow: theme === 'dark' 
                    ? `0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px ${letter.color}20`
                    : `0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px ${letter.color}30`
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
              >
                {/* Background glow */}
                <motion.div
                  className="absolute inset-0 rounded-3xl opacity-20"
                  style={{ 
                    background: `radial-gradient(circle at center, ${letter.color}40 0%, transparent 70%)`
                  }}
                  animate={{
                    scale: currentLetterIndex === letterIndex ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Letter */}
                <motion.span
                  className="text-7xl md:text-9xl font-bold select-none leading-none relative z-10"
                  style={{ 
                    color: letter.color,
                    fontFamily: 'Noto Sans Arabic, sans-serif',
                    textShadow: theme === 'dark' 
                      ? `0 0 20px ${letter.color}60, 0 0 40px ${letter.color}30` 
                      : `0 0 10px ${letter.color}40`,
                    filter: theme === 'dark' 
                      ? 'brightness(1.2) saturate(1.2)' 
                      : 'brightness(1.1)'
                  }}
                  animate={{
                    scale: currentLetterIndex === letterIndex ? [1, 1.05, 1] : 1,
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {letter.forms.isolated}
                </motion.span>

                {/* Letter name */}
                <motion.div
                  className={`absolute bottom-6 left-0 right-0 text-center ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <div className="text-xl font-bold mb-1">{letter.englishName}</div>
                  <div className="text-sm opacity-75">/{letter.sound}/</div>
                </motion.div>
              </motion.div>
            </div>

            {/* Form Buttons */}
            <div className="pb-12 px-4 md:px-6">
              <motion.div
                className="grid grid-cols-3 gap-3 md:gap-4 max-w-sm md:max-w-md mx-auto"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                {/* Final Form */}
                <motion.button
                  onClick={() => playFormAudio('final')}
                  disabled={playingForm !== null}
                  className={`relative aspect-square rounded-2xl shadow-lg flex flex-col items-center justify-center p-3 md:p-4 transition-all duration-200 ${
                    theme === 'dark' 
                      ? 'bg-slate-700 hover:bg-slate-600 border border-slate-600' 
                      : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-md'
                  } ${playingForm === 'final' ? 'ring-4 ring-opacity-60' : ''}`}
                  style={{ 
                    ...(playingForm === 'final' && { ringColor: letter.color + '60' }),
                    borderColor: theme === 'dark' ? letter.color + '40' : letter.color + '20'
                  }}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  animate={{
                    scale: playingForm === 'final' ? [1, 1.05, 1] : 1,
                  }}
                >
                  {/* Playing animation */}
                  {showFeedback === 'final' && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      style={{ backgroundColor: letter.color + '30' }}
                      animate={{ opacity: [0, 0.6, 0] }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    />
                  )}

                  <span 
                    className="text-3xl md:text-4xl font-bold mb-1 md:mb-2 relative z-10"
                    style={{ 
                      color: letter.color,
                      fontFamily: 'Noto Sans Arabic, sans-serif'
                    }}
                  >
                    {letter.forms.final}
                  </span>
                  <span className={`text-xs font-medium relative z-10 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Final
                  </span>
                </motion.button>

                {/* Medial Form */}
                <motion.button
                  onClick={() => playFormAudio('medial')}
                  disabled={playingForm !== null}
                  className={`relative aspect-square rounded-2xl shadow-lg flex flex-col items-center justify-center p-3 md:p-4 transition-all duration-200 ${
                    theme === 'dark' 
                      ? 'bg-slate-700 hover:bg-slate-600 border border-slate-600' 
                      : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-md'
                  } ${playingForm === 'medial' ? 'ring-4 ring-opacity-60' : ''}`}
                  style={{ 
                    ...(playingForm === 'medial' && { ringColor: letter.color + '60' }),
                    borderColor: theme === 'dark' ? letter.color + '40' : letter.color + '20'
                  }}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  animate={{
                    scale: playingForm === 'medial' ? [1, 1.05, 1] : 1,
                  }}
                >
                  {/* Playing animation */}
                  {showFeedback === 'medial' && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      style={{ backgroundColor: letter.color + '30' }}
                      animate={{ opacity: [0, 0.6, 0] }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    />
                  )}

                  <span 
                    className="text-3xl md:text-4xl font-bold mb-1 md:mb-2 relative z-10"
                    style={{ 
                      color: letter.color,
                      fontFamily: 'Noto Sans Arabic, sans-serif'
                    }}
                  >
                    {letter.forms.medial}
                  </span>
                  <span className={`text-xs font-medium relative z-10 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Medial
                  </span>
                </motion.button>

                {/* Initial Form */}
                <motion.button
                  onClick={() => playFormAudio('initial')}
                  disabled={playingForm !== null}
                  className={`relative aspect-square rounded-2xl shadow-lg flex flex-col items-center justify-center p-3 md:p-4 transition-all duration-200 ${
                    theme === 'dark' 
                      ? 'bg-slate-700 hover:bg-slate-600 border border-slate-600' 
                      : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-md'
                  } ${playingForm === 'initial' ? 'ring-4 ring-opacity-60' : ''}`}
                  style={{ 
                    ...(playingForm === 'initial' && { ringColor: letter.color + '60' }),
                    borderColor: theme === 'dark' ? letter.color + '40' : letter.color + '20'
                  }}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  animate={{
                    scale: playingForm === 'initial' ? [1, 1.05, 1] : 1,
                  }}
                >
                  {/* Playing animation */}
                  {showFeedback === 'initial' && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      style={{ backgroundColor: letter.color + '30' }}
                      animate={{ opacity: [0, 0.6, 0] }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    />
                  )}

                  <span 
                    className="text-3xl md:text-4xl font-bold mb-1 md:mb-2 relative z-10"
                    style={{ 
                      color: letter.color,
                      fontFamily: 'Noto Sans Arabic, sans-serif'
                    }}
                  >
                    {letter.forms.initial}
                  </span>
                  <span className={`text-xs font-medium relative z-10 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Initial
                  </span>
                </motion.button>
              </motion.div>

              {/* Connection info */}
              <motion.div
                className={`text-center mt-4 text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                {letter.connects.before && letter.connects.after 
                  ? "Connects before and after"
                  : letter.connects.before 
                    ? "Connects only before" 
                    : "Does not connect after"
                }
              </motion.div>
            </div>

            {/* Scroll hint for first letter */}
            {letterIndex === 0 && (
              <motion.div
                className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <span>Scroll for more letters</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 10l5 5 5-5H7z"/>
                </svg>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Progress Bar at Bottom - Responsive */}
      <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20 px-3 md:px-4 py-2 rounded-full backdrop-blur-md shadow-lg max-w-[90vw] ${
        theme === 'dark' 
          ? 'bg-slate-800/90 border border-slate-600' 
          : 'bg-white/90 border border-gray-200'
      }`}>
        <div className="flex items-center space-x-2 md:space-x-3">
          {/* Current letter indicator */}
          <div className="flex items-center space-x-2">
            <span 
              className="text-xl md:text-2xl font-bold"
              style={{ 
                color: currentLetter.color,
                fontFamily: 'Noto Sans Arabic, sans-serif'
              }}
            >
              {currentLetter.forms.isolated}
            </span>
            <div className="text-xs md:text-sm">
              <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                {currentLetter.englishName}
              </div>
              <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {currentLetterIndex + 1} / {letters.length}
              </div>
            </div>
          </div>
          
          {/* Mini progress bar - responsive width */}
          <div className={`w-20 md:w-32 h-2 rounded-full ${
            theme === 'dark' ? 'bg-slate-600' : 'bg-gray-200'
          }`}>
            <motion.div
              className="bg-gradient-to-r from-[#58CC02] to-[#89E219] h-2 rounded-full"
              animate={{ width: `${((currentLetterIndex + 1) / letters.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Navigation arrows - larger touch targets on mobile */}
          <div className="flex space-x-1">
            <motion.button
              onClick={() => scrollToLetter(Math.max(0, currentLetterIndex - 1))}
              disabled={currentLetterIndex === 0}
              className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-colors ${
                currentLetterIndex === 0
                  ? 'opacity-30 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              whileHover={currentLetterIndex > 0 ? { scale: 1.1 } : {}}
              whileTap={currentLetterIndex > 0 ? { scale: 0.9 } : {}}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
            
            <motion.button
              onClick={() => scrollToLetter(Math.min(letters.length - 1, currentLetterIndex + 1))}
              disabled={currentLetterIndex === letters.length - 1}
              className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-colors ${
                currentLetterIndex === letters.length - 1
                  ? 'opacity-30 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              whileHover={currentLetterIndex < letters.length - 1 ? { scale: 1.1 } : {}}
              whileTap={currentLetterIndex < letters.length - 1 ? { scale: 0.9 } : {}}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}