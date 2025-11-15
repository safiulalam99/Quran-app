'use client';

import { motion } from 'framer-motion';
import { useTheme } from '../../../../contexts/ThemeContext';
import type { FathaLetter } from '../../../../types/quiz.types';

interface WhichSoundProps {
  readonly targetLetter: FathaLetter;
  readonly soundChoices: readonly string[]; // Array of sound options
  readonly onAnswer: (sound: string) => void;
  readonly disabled: boolean;
}

export default function WhichSound({
  targetLetter,
  soundChoices,
  onAnswer,
  disabled,
}: WhichSoundProps) {
  const { theme } = useTheme();

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Instruction */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2
          className={`text-2xl sm:text-3xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}
        >
          Which sound does this make?
        </h2>

        {/* Letter display */}
        <motion.div
          className={`inline-block px-8 py-6 rounded-3xl shadow-2xl ${
            theme === 'dark'
              ? 'bg-slate-800 border-2 border-slate-600'
              : 'bg-white border-2 border-gray-200'
          }`}
          style={{
            borderColor:
              theme === 'dark'
                ? `${targetLetter.baseColor}50`
                : `${targetLetter.baseColor}40`,
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.3,
          }}
        >
          <div
            className="text-7xl sm:text-8xl font-bold"
            style={{
              color: targetLetter.baseColor,
              fontFamily: 'Noto Sans Arabic, sans-serif',
              filter:
                theme === 'dark'
                  ? `brightness(1.2) saturate(1.2) drop-shadow(0 0 8px ${targetLetter.baseColor}40)`
                  : 'none',
            }}
          >
            {targetLetter.letterWithFatha}
          </div>
        </motion.div>
      </motion.div>

      {/* Sound choices grid */}
      <motion.div
        className="grid grid-cols-2 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {soundChoices.map((sound, index) => (
          <motion.button
            key={sound}
            onClick={() => !disabled && onAnswer(sound)}
            disabled={disabled}
            className={`p-6 sm:p-8 rounded-2xl shadow-lg font-bold text-2xl sm:text-3xl transition-all ${
              theme === 'dark'
                ? 'bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-teal-400 disabled:opacity-50'
                : 'bg-white hover:shadow-xl border-2 border-teal-200 text-teal-600 disabled:opacity-50'
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            whileHover={!disabled ? { scale: 1.05 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
          >
            {sound}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
