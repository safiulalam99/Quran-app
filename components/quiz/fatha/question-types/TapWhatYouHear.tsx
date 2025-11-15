'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../../contexts/ThemeContext';
import type { FathaLetter } from '../../../../types/quiz.types';

interface TapWhatYouHearProps {
  readonly targetLetter: FathaLetter;
  readonly choices: readonly FathaLetter[];
  readonly onAnswer: (letter: FathaLetter) => void;
  readonly disabled: boolean;
  readonly autoPlay?: boolean;
}

export default function TapWhatYouHear({
  targetLetter,
  choices,
  onAnswer,
  disabled,
  autoPlay = true,
}: TapWhatYouHearProps) {
  const { theme } = useTheme();
  const audioRef = useRef<HTMLAudioElement>(null);

  // Auto-play audio when question loads
  useEffect(() => {
    if (autoPlay && audioRef.current) {
      const timer = setTimeout(() => {
        audioRef.current?.play().catch(console.error);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [targetLetter, autoPlay]);

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(40);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Audio element */}
      <audio
        ref={audioRef}
        src={`/audio/Fatha/${targetLetter.letter}.m4a`}
        preload="auto"
      />

      {/* Instruction */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2
          className={`text-2xl sm:text-3xl font-bold mb-3 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}
        >
          Tap what you hear
        </h2>

        {/* Replay button */}
        <motion.button
          onClick={playAudio}
          disabled={disabled}
          className={`px-6 py-3 rounded-full font-semibold text-lg shadow-lg transition-all ${
            theme === 'dark'
              ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-700'
              : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300'
          }`}
          whileHover={!disabled ? { scale: 1.05 } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
        >
          🔊 Play Sound
        </motion.button>
      </motion.div>

      {/* Choices grid */}
      <motion.div
        className="grid grid-cols-2 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {choices.map((choice, index) => (
          <motion.button
            key={choice.letter}
            onClick={() => !disabled && onAnswer(choice)}
            disabled={disabled}
            className={`relative p-6 sm:p-8 rounded-2xl shadow-lg transition-all ${
              theme === 'dark'
                ? 'bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 disabled:opacity-50'
                : 'bg-white hover:shadow-xl border-2 border-gray-200 disabled:opacity-50'
            }`}
            style={{
              borderColor: !disabled
                ? theme === 'dark'
                  ? `${choice.baseColor}40`
                  : `${choice.baseColor}30`
                : undefined,
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
          >
            {/* Letter with Fatha */}
            <div className="text-center">
              <motion.div
                className="text-5xl sm:text-6xl font-bold mb-2"
                style={{
                  color: choice.baseColor,
                  fontFamily: 'Noto Sans Arabic, sans-serif',
                  filter:
                    theme === 'dark'
                      ? `brightness(1.2) saturate(1.2) drop-shadow(0 0 4px ${choice.baseColor}40)`
                      : 'none',
                }}
              >
                {choice.letterWithFatha}
              </motion.div>

              {/* Sound label */}
              <div
                className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {choice.sound}
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
