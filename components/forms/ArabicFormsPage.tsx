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
  const { theme } = useTheme();
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);

  const letters = arabicLetterForms.letterForms as LetterForm[];
  const currentLetter = letters[currentLetterIndex];

  // Handle scroll navigation
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || isDragging) return; // Don't update during scrubbing
      
      const scrollTop = containerRef.current.scrollTop;
      const screenHeight = window.innerHeight;
      // More accurate scroll detection with proper rounding
      const rawIndex = scrollTop / screenHeight;
      const newIndex = Math.min(
        Math.max(0, Math.round(rawIndex)),
        letters.length - 1
      );
      
      if (newIndex !== currentLetterIndex) {
        setCurrentLetterIndex(newIndex);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [currentLetterIndex, letters.length, isDragging]);

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

  // Handle scrubber drag/touch events
  const handleScrubberInteraction = (event: React.MouseEvent | React.TouchEvent) => {
    if (!scrubberRef.current) return;

    const rect = scrubberRef.current.getBoundingClientRect();
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    const relativeY = clientY - rect.top;
    
    // Account for the 24px padding on top and bottom
    const padding = 24;
    const effectiveHeight = rect.height - (padding * 2);
    const effectiveY = relativeY - padding;
    
    // Calculate percentage within the effective area
    const percentage = Math.max(0, Math.min(1, effectiveY / effectiveHeight));
    
    // Find the closest letter index
    const letterIndex = Math.min(
      Math.max(0, Math.round(percentage * (letters.length - 1))),
      letters.length - 1
    );
    
    console.log('Click debug:', {
      eventType: 'touches' in event ? 'touch' : 'mouse',
      relativeY,
      effectiveY,
      height: rect.height,
      effectiveHeight,
      percentage,
      letterIndex,
      selectedLetter: letters[letterIndex]?.forms.isolated,
      selectedLetterName: letters[letterIndex]?.englishName,
      totalLetters: letters.length,
      clientY: 'touches' in event ? event.touches[0].clientY : event.clientY,
      rectTop: rect.top
    });
    
    if (letterIndex !== currentLetterIndex) {
      setCurrentLetterIndex(letterIndex);
      scrollToLetter(letterIndex);
      
      // Haptic feedback during scrubbing
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(15); // Shorter vibration for scrubbing
      }
    }
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    setIsDragging(true);
    handleScrubberInteraction(event);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging) {
      handleScrubberInteraction(event);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    event.preventDefault(); // Prevent default touch behavior
    setIsDragging(true);
    handleScrubberInteraction(event);
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (isDragging) {
      event.preventDefault(); // Prevent page scrolling during scrubbing
      event.stopPropagation(); // Stop event bubbling
      handleScrubberInteraction(event);
    }
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    event.preventDefault(); // Prevent default touch behavior
    setIsDragging(false);
  };

  // Add global mouse and touch events for smooth dragging
  useEffect(() => {
    const handleGlobalMove = (clientY: number) => {
      if (isDragging && scrubberRef.current) {
        const rect = scrubberRef.current.getBoundingClientRect();
        const relativeY = clientY - rect.top;
        
        // Account for the 20px padding on top and bottom
        const padding = 20;
        const effectiveHeight = rect.height - (padding * 2);
        const effectiveY = relativeY - padding;
        
        // Calculate percentage within the effective area
        const percentage = Math.max(0, Math.min(1, effectiveY / effectiveHeight));
        
        // Find the closest letter index
        const letterIndex = Math.min(
          Math.max(0, Math.round(percentage * (letters.length - 1))),
          letters.length - 1
        );
        
        if (letterIndex !== currentLetterIndex) {
          setCurrentLetterIndex(letterIndex);
          scrollToLetter(letterIndex);
          
          if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(15);
          }
        }
      }
    };

    const handleGlobalMouseMove = (event: MouseEvent) => {
      handleGlobalMove(event.clientY);
    };

    const handleGlobalTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        handleGlobalMove(event.touches[0].clientY);
      }
    };

    const handleGlobalEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
      document.addEventListener('mouseup', handleGlobalEnd);
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: true });
      document.addEventListener('touchend', handleGlobalEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalEnd);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalEnd);
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

      {/* Right Side Arabic Letter Scrubber */}
      <div className="fixed right-4 md:right-6 top-1/2 transform -translate-y-1/2 z-20 h-[75vh] flex flex-col items-center">
        <div 
          ref={scrubberRef}
          className="relative h-full w-12 flex flex-col justify-start cursor-pointer select-none touch-none"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ 
            touchAction: 'none',
            paddingTop: '24px',
            paddingBottom: '24px',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none'
          }}
        >
          {letters.map((letter, index) => {
            const isActive = index === currentLetterIndex;
            // Calculate exact position for each letter (0% to 100% of available space)
            const totalLetters = letters.length;
            const positionPercent = totalLetters === 1 ? 50 : (index / (totalLetters - 1)) * 100;
            
            return (
              <motion.div
                key={letter.letter}
                className="absolute w-full h-6 flex items-center justify-center touch-none"
                style={{
                  top: `${positionPercent}%`,
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
                animate={{
                  scale: isActive ? 1.4 : 1,
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <span 
                  className={`text-sm md:text-base font-bold transition-all duration-200 pointer-events-none ${
                    isActive 
                      ? 'drop-shadow-lg' 
                      : theme === 'dark' 
                        ? 'text-gray-500' 
                        : 'text-gray-400'
                  }`}
                  style={{ 
                    color: isActive ? letter.color : undefined,
                    fontFamily: 'Noto Sans Arabic, sans-serif',
                    textShadow: isActive ? `0 0 8px ${letter.color}60` : 'none'
                  }}
                >
                  {letter.forms.isolated}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}