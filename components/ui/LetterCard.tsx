'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

interface LetterCardProps {
  letter: string;
  englishName: string;
  color: string;
  audioFile?: string;
  disabled?: boolean;
  onPlay?: () => void;
}

export default function LetterCard({
  letter,
  englishName,
  color,
  audioFile,
  disabled = false,
  onPlay,
}: LetterCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { theme } = useTheme();

  const handleClick = async () => {
    if (disabled || isPlaying) return;

    try {
      setIsPlaying(true);
      onPlay?.();

      if (audioFile && audioRef.current) {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  return (
    <>
      {audioFile && (
        <audio
          ref={audioRef}
          src={`/audio/letters/${letter}.m4a`}
          onEnded={handleAudioEnd}
          preload="metadata"
        />
      )}
      
      <motion.button
        onClick={handleClick}
        disabled={disabled}
        className={`
          w-full aspect-square rounded-3xl shadow-lg 
          flex flex-col items-center justify-center
          transition-all duration-200 relative overflow-hidden
          p-4 min-h-[100px]
          ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white hover:shadow-xl'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isPlaying ? 'ring-4 ring-opacity-50' : ''}
        `}
        style={{ 
          borderColor: color + '30',
          border: `3px solid ${color}30`,
          ...(isPlaying && { ringColor: color + '60' })
        }}
        initial={{ scale: 1 }}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        animate={{
          scale: isPlaying ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: isPlaying ? 0.6 : 0.2,
          ease: "easeOut"
        }}
      >
        {/* Playing pulse animation */}
        {isPlaying && (
          <>
            <motion.div
              className="absolute inset-0 rounded-3xl"
              style={{ backgroundColor: color + '20' }}
              animate={{
                opacity: [0, 0.4, 0],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            {/* Sparkle effects */}
            <motion.div
              className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full"
              animate={{
                scale: [0, 1, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute bottom-2 left-2 w-1 h-1 bg-pink-400 rounded-full"
              animate={{
                scale: [0, 1.2, 0],
                rotate: [0, -180, -360],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2
              }}
            />
          </>
        )}

        {/* Letter */}
        <motion.span 
          className="text-5xl font-bold select-none leading-none"
          style={{ 
            color: color,
            fontFamily: 'Noto Sans Arabic, sans-serif',
            filter: isPlaying ? 'brightness(1.2)' : 'none'
          }}
          animate={{
            scale: isPlaying ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 0.6,
            ease: "easeOut"
          }}
        >
          {letter}
        </motion.span>

        {/* English name */}
        <motion.span 
          className={`text-sm text-center select-none mt-2 font-medium ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}
          animate={{
            opacity: isPlaying ? 0.7 : 1,
          }}
        >
          {englishName}
        </motion.span>
      </motion.button>
    </>
  );
}