'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

interface FathaCardProps {
  readonly letter: string;
  readonly letterWithFatha: string;
  readonly sound: string;
  readonly baseColor: string;
  readonly fathaColor: string;
  readonly audioFile: string;
  readonly disabled?: boolean;
  readonly onPlay?: () => void;
}

export default function FathaCard({
  letter,
  letterWithFatha,
  sound,
  baseColor,
  fathaColor,
  audioFile,
  disabled = false,
  onPlay,
}: FathaCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { theme } = useTheme();

  const handleClick = async () => {
    if (disabled || isPlaying || hasError) return;

    try {
      setIsPlaying(true);
      onPlay?.();

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      }
    } catch (error) {
      console.warn(`Audio playback failed for ${letter}:`, error);
      setIsPlaying(false);
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  const handleAudioError = () => {
    console.error(`Failed to load audio: ${audioFile}`);
    setHasError(true);
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={audioFile}
        onEnded={handleAudioEnd}
        onError={handleAudioError}
        preload="metadata"
      />

      <motion.button
        onClick={handleClick}
        disabled={disabled || hasError}
        className={`
          w-full aspect-square rounded-2xl shadow-md
          flex flex-col items-center justify-center
          transition-all duration-200 relative overflow-hidden
          p-3 min-h-[100px]
          ${theme === 'dark'
            ? 'bg-slate-800 hover:bg-slate-750 shadow-xl'
            : 'bg-white hover:shadow-lg'
          }
          ${disabled || hasError ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isPlaying ? 'ring-2 ring-opacity-60' : ''}
        `}
        style={{
          borderColor: theme === 'dark' ? fathaColor + '50' : fathaColor + '40',
          border: theme === 'dark'
            ? `2px solid ${fathaColor}50`
            : `2px solid ${fathaColor}40`,
          ...(isPlaying && { ringColor: fathaColor + '70' }),
          ...(theme === 'dark' && {
            boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px ${fathaColor}15, inset 0 1px 0 rgba(255,255,255,0.08)`
          })
        }}
        initial={{ scale: 1 }}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: disabled || hasError ? 1 : 1.02 }}
        animate={{
          scale: isPlaying ? [1, 1.04, 1] : 1,
        }}
        transition={{
          duration: isPlaying ? 0.5 : 0.2,
          ease: "easeOut"
        }}
      >
        {/* Playing pulse animation */}
        {isPlaying && (
          <>
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                backgroundColor: theme === 'dark' ? fathaColor + '25' : fathaColor + '15',
              }}
              animate={{
                opacity: theme === 'dark' ? [0, 0.5, 0] : [0, 0.3, 0],
              }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Sparkle effects */}
            <motion.div
              className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${
                theme === 'dark' ? 'bg-rose-300 shadow-lg' : 'bg-rose-400'
              }`}
              style={{
                boxShadow: theme === 'dark' ? `0 0 6px ${fathaColor}` : 'none'
              }}
              animate={{
                scale: [0, 1, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className={`absolute bottom-2 left-2 w-1 h-1 rounded-full ${
                theme === 'dark' ? 'bg-pink-300 shadow-md' : 'bg-pink-400'
              }`}
              style={{
                boxShadow: theme === 'dark' ? `0 0 4px ${fathaColor}` : 'none'
              }}
              animate={{
                scale: [0, 1.1, 0],
                rotate: [0, -180, -360],
              }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2
              }}
            />
          </>
        )}

        {/* Letter with Fatha */}
        <motion.span
          className="text-4xl sm:text-5xl font-bold select-none leading-none"
          style={{
            color: baseColor,
            fontFamily: 'Noto Sans Arabic, sans-serif',
            filter: theme === 'dark'
              ? isPlaying
                ? 'brightness(1.3) saturate(1.2) drop-shadow(0 0 6px currentColor)'
                : 'brightness(1.15) saturate(1.1) drop-shadow(0 0 3px currentColor)'
              : isPlaying
                ? 'brightness(1.1)'
                : 'none',
            textShadow: theme === 'dark'
              ? `0 0 8px ${baseColor}30, 0 0 16px ${baseColor}15`
              : 'none'
          }}
          animate={{
            scale: isPlaying ? [1, 1.08, 1] : 1,
          }}
          transition={{
            duration: 0.5,
            ease: "easeOut"
          }}
        >
          {letterWithFatha}
        </motion.span>

        {/* Sound */}
        <motion.span
          className={`text-xs text-center select-none mt-2 font-medium ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}
          animate={{
            opacity: isPlaying ? 0.6 : 1,
          }}
        >
          {sound}
        </motion.span>

        {/* Error state indicator */}
        {hasError && (
          <div className="absolute top-1 right-1 text-xs text-red-500">
            ⚠️
          </div>
        )}
      </motion.button>
    </>
  );
}
