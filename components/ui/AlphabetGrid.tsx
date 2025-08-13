'use client';

import { motion } from 'framer-motion';
import LetterCard from './LetterCard';

interface Letter {
  letter: string;
  name: string;
  englishName: string;
  sound: string;
  color: string;
  category: string;
}

interface AlphabetGridProps {
  letters: Letter[];
  cols?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  onLetterPlay?: (letter: Letter) => void;
}

export default function AlphabetGrid({
  letters,
  cols = { mobile: 2, tablet: 4, desktop: 5 },
  onLetterPlay,
}: AlphabetGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const,
      },
    },
  };

  const gridClasses = `
    grid gap-3 md:gap-4 w-full max-w-4xl mx-auto
    grid-cols-${cols.mobile} 
    sm:grid-cols-${cols.tablet} 
    lg:grid-cols-${cols.desktop}
  `;

  return (
    <motion.div
      className={gridClasses}
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
          <LetterCard
            letter={letter.letter}
            englishName={letter.englishName}
            color={letter.color}
            audioFile={`/audio/letters/${letter.letter}.m4a`}
            onPlay={() => onLetterPlay?.(letter)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}