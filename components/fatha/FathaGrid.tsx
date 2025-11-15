'use client';

import { motion } from 'framer-motion';
import FathaCard from './FathaCard';

interface FathaLetter {
  readonly letter: string;
  readonly letterWithFatha: string;
  readonly sound: string;
  readonly baseColor: string;
  readonly fathaColor: string;
}

interface FathaGridProps {
  readonly letters: readonly FathaLetter[];
  readonly cols?: {
    readonly mobile: number;
    readonly tablet: number;
    readonly desktop: number;
  };
  readonly onLetterPlay?: (letter: FathaLetter) => void;
}

export default function FathaGrid({
  letters,
  cols = { mobile: 2, tablet: 4, desktop: 5 },
  onLetterPlay,
}: FathaGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0, scale: 0.92 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: "easeOut" as const,
      },
    },
  };

  const getGridClasses = () => {
    const mobileClass = cols.mobile === 1
      ? 'grid-cols-1'
      : cols.mobile === 2
        ? 'grid-cols-2'
        : 'grid-cols-3';

    const tabletClass = cols.tablet === 3
      ? 'sm:grid-cols-3'
      : cols.tablet === 4
        ? 'sm:grid-cols-4'
        : 'sm:grid-cols-5';

    const desktopClass = cols.desktop === 4
      ? 'lg:grid-cols-4'
      : cols.desktop === 5
        ? 'lg:grid-cols-5'
        : 'lg:grid-cols-6';

    return `grid gap-3 md:gap-4 w-full max-w-4xl mx-auto ${mobileClass} ${tabletClass} ${desktopClass}`;
  };

  return (
    <motion.div
      className={getGridClasses()}
      dir="rtl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {letters.map((letter, index) => (
        <motion.div
          key={`${letter.letter}-${index}`}
          variants={itemVariants}
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <FathaCard
            letter={letter.letter}
            letterWithFatha={letter.letterWithFatha}
            sound={letter.sound}
            baseColor={letter.baseColor}
            fathaColor={letter.fathaColor}
            audioFile={`/audio/Fatha/${letter.letter}.m4a`}
            onPlay={() => onLetterPlay?.(letter)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
