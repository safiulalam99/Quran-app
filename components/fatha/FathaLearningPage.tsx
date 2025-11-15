'use client';

import { useTheme } from '../../contexts/ThemeContext';
import FathaGrid from './FathaGrid';
import AppHeader from '../ui/AppHeader';
import LottieBackground from '../ui/LottieBackground';
import fathaData from '../../app/data/arabic-fatha.json';

interface FathaLetter {
  letter: string;
  letterWithFatha: string;
  sound: string;
  baseColor: string;
  fathaColor: string;
}

export default function FathaLearningPage() {
  const { theme } = useTheme();
  const { fathaLetters } = fathaData;

  const handleLetterPlay = () => {
    // Add haptic feedback for mobile devices
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const getBackgroundClass = () => {
    return theme === 'dark'
      ? 'bg-slate-900'
      : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50';
  };

  return (
    <div className={`min-h-screen ${getBackgroundClass()} relative overflow-hidden`}>
      {/* Subtle background animation */}
      <LottieBackground animationType="floating-stars" />

      <div className="p-4 pb-24 md:pb-8 pt-0 md:pt-24 relative z-10">
        <AppHeader
          title="Learn Fatha"
          subtitle="🎵 Tap to hear the sound with Fatha (َ)"
          showProgress={false}
        />

        <main className="pb-8 relative z-10">
          <div className="flex justify-center">
            <FathaGrid
              letters={fathaLetters as readonly FathaLetter[]}
              cols={{ mobile: 2, tablet: 4, desktop: 5 }}
              onLetterPlay={handleLetterPlay}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
