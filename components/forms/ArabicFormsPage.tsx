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
  const [isDragging, setIsDragging] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const letters = arabicLetterForms.letterForms as LetterForm[];
  const currentLetter = letters[currentLetterIndex];

  // Better scroll detection using Intersection Observer
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry that's most visible (highest intersection ratio)
        let mostVisible = entries[0];
        for (const entry of entries) {
          if (entry.intersectionRatio > mostVisible.intersectionRatio) {
            mostVisible = entry;
          }
        }

        if (mostVisible && mostVisible.intersectionRatio > 0.5 && !isDragging) {
          const letterIndex = parseInt(mostVisible.target.id.replace('letter-', ''));
          if (!isNaN(letterIndex) && letterIndex !== currentLetterIndex) {
            setCurrentLetterIndex(letterIndex);
          }
        }
      },
      {
        root: containerRef.current,
        threshold: [0, 0.25, 0.5, 0.75, 1.0]
      }
    );

    // Observe all letter elements
    letters.forEach((_, index) => {
      const element = document.getElementById(`letter-${index}`);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [letters.length, currentLetterIndex, isDragging]);

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

  // Use scrollIntoView instead of manual calculations
  const scrollToLetter = (index: number) => {
    const letterElement = document.getElementById(`letter-${index}`);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (letterElement) {
      letterElement.scrollIntoView({
        behavior: isMobile ? 'auto' : 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  // Scrollbar-like navigation handlers
  const getLetterFromPosition = (clientY: number) => {
    if (!navRef.current) return currentLetterIndex;
    
    const rect = navRef.current.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    const percentage = Math.max(0, Math.min(1, relativeY / rect.height));
    
    // Map percentage to letter index
    const letterIndex = Math.round(percentage * (letters.length - 1));
    return Math.max(0, Math.min(letters.length - 1, letterIndex));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const newIndex = getLetterFromPosition(e.touches[0].clientY);
    if (newIndex !== currentLetterIndex) {
      setCurrentLetterIndex(newIndex);
      scrollToLetter(newIndex);
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(15);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    const newIndex = getLetterFromPosition(e.touches[0].clientY);
    if (newIndex !== currentLetterIndex) {
      setCurrentLetterIndex(newIndex);
      scrollToLetter(newIndex);
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(8);
      }
    }
  };

  const handleTouchEnd = () => {
    setTimeout(() => setIsDragging(false), 100); // Small delay to prevent interference
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const newIndex = getLetterFromPosition(e.clientY);
    if (newIndex !== currentLetterIndex) {
      setCurrentLetterIndex(newIndex);
      scrollToLetter(newIndex);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const newIndex = getLetterFromPosition(e.clientY);
    if (newIndex !== currentLetterIndex) {
      setCurrentLetterIndex(newIndex);
      scrollToLetter(newIndex);
    }
  };

  const handleMouseUp = () => {
    setTimeout(() => setIsDragging(false), 100);
  };

  // Global mouse events for better drag experience
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newIndex = getLetterFromPosition(e.clientY);
        if (newIndex !== currentLetterIndex) {
          setCurrentLetterIndex(newIndex);
          scrollToLetter(newIndex);
        }
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setTimeout(() => setIsDragging(false), 100);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, currentLetterIndex, letters.length]);

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
            id={`letter-${letterIndex}`} // Add ID for scrollIntoView
            className={`h-screen flex flex-col snap-start relative ${
              theme === 'dark' 
                ? 'bg-slate-800' 
                : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >

            {/* Main Letter Display */}
            <div className="flex-1 flex items-center justify-center px-4 md:px-8">
              <motion.div
                className={`w-60 h-60 md:w-64 md:h-64 rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden ${
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
                  className="text-5xl md:text-6xl font-bold select-none leading-none relative z-10"
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
                  <div className="text-lg font-bold mb-1">{letter.englishName}</div>
                  <div className="text-xs opacity-75">/{letter.sound}/</div>
                </motion.div>
              </motion.div>
            </div>

            {/* Form Buttons */}
            <div className="pb-12 px-4 md:px-6">
              <motion.div
                className="grid grid-cols-3 gap-2 md:gap-3 max-w-xs md:max-w-sm mx-auto"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                {/* Final Form */}
                <motion.button
                  onClick={() => playFormAudio('final')}
                  disabled={playingForm !== null}
                  className={`relative aspect-square rounded-xl shadow-lg flex flex-col items-center justify-center p-2 md:p-3 transition-all duration-200 ${
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
                    className="text-2xl md:text-3xl font-bold mb-1 relative z-10"
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
                  className={`relative aspect-square rounded-xl shadow-lg flex flex-col items-center justify-center p-2 md:p-3 transition-all duration-200 ${
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
                    className="text-2xl md:text-3xl font-bold mb-1 relative z-10"
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
                  className={`relative aspect-square rounded-xl shadow-lg flex flex-col items-center justify-center p-2 md:p-3 transition-all duration-200 ${
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
                    className="text-2xl md:text-3xl font-bold mb-1 relative z-10"
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

      {/* Scrollbar-like Navigation */}
      <div 
        ref={navRef}
        className="fixed right-3 top-1/2 transform -translate-y-1/2 z-20 h-[70vh] flex items-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ touchAction: 'none' }}
      >
        {/* Clean Letter Navigation */}
        <div className="h-full flex flex-col justify-between py-4">
          {letters.map((letter, index) => (
            <div
              key={letter.letter}
              className={`w-5 h-5 flex items-center justify-center pointer-events-none transition-all duration-200 ${
                currentLetterIndex === index ? 'scale-150' : 'scale-100 opacity-60'
              }`}
              style={{
                fontFamily: 'Noto Sans Arabic, sans-serif',
                color: currentLetterIndex === index 
                  ? (theme === 'dark' ? '#60A5FA' : '#3B82F6')
                  : (theme === 'dark' ? '#9CA3AF' : '#6B7280'),
                fontSize: '14px',
                fontWeight: currentLetterIndex === index ? 'bold' : 'normal',
                textShadow: currentLetterIndex === index 
                  ? '0 0 8px currentColor' 
                  : 'none'
              }}
            >
              {letter.forms.isolated}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}