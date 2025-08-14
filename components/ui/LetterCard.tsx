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
          ${theme === 'dark' 
            ? 'bg-slate-700 hover:bg-slate-600 shadow-2xl' 
            : 'bg-white hover:shadow-xl'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isPlaying ? 'ring-4 ring-opacity-50' : ''}
        `}
        style={{ 
          borderColor: theme === 'dark' ? color + '60' : color + '30',
          border: theme === 'dark' 
            ? `3px solid ${color}60` 
            : `3px solid ${color}30`,
          ...(isPlaying && { ringColor: color + '60' }),
          ...(theme === 'dark' && {
            boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${color}20, inset 0 1px 0 rgba(255,255,255,0.1)`
          })
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
              style={{ 
                backgroundColor: theme === 'dark' ? color + '30' : color + '20',
                boxShadow: theme === 'dark' ? `inset 0 0 20px ${color}40` : 'none'
              }}
              animate={{
                opacity: theme === 'dark' ? [0, 0.6, 0] : [0, 0.4, 0],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            {/* Enhanced sparkle effects for dark mode */}
            <motion.div
              className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                theme === 'dark' ? 'bg-yellow-300 shadow-lg' : 'bg-yellow-400'
              }`}
              style={{
                boxShadow: theme === 'dark' ? '0 0 8px #fde047' : 'none'
              }}
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
              className={`absolute bottom-2 left-2 w-1 h-1 rounded-full ${
                theme === 'dark' ? 'bg-pink-300 shadow-lg' : 'bg-pink-400'
              }`}
              style={{
                boxShadow: theme === 'dark' ? '0 0 6px #f9a8d4' : 'none'
              }}
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
            filter: theme === 'dark' 
              ? isPlaying 
                ? 'brightness(1.4) saturate(1.3) drop-shadow(0 0 8px currentColor)' 
                : 'brightness(1.2) saturate(1.2) drop-shadow(0 0 4px currentColor)'
              : isPlaying 
                ? 'brightness(1.2)' 
                : 'none',
            textShadow: theme === 'dark' 
              ? `0 0 10px ${color}40, 0 0 20px ${color}20` 
              : 'none'
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