'use client';

import arabicAlphabet from './data/arabic-alphabet.json';
import AlphabetGrid from '../components/ui/AlphabetGrid';
import AppHeader from '../components/ui/AppHeader';
import LottieBackground from '../components/ui/LottieBackground';

export default function Home() {
  const { alphabet } = arabicAlphabet;

  const handleLetterPlay = () => {
    // Add haptic feedback for mobile devices
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 relative overflow-hidden">
      <LottieBackground animationType="floating-stars" />
      
      <AppHeader
        title="Arabic Alphabet"
        subtitle="🎵 Tap a letter to hear its sound"
        showProgress={false}
      />

      <main className="pb-8 relative z-10">
        <div className="flex justify-center">
          <AlphabetGrid
            letters={alphabet}
            cols={{ mobile: 2, tablet: 4, desktop: 5 }}
            onLetterPlay={handleLetterPlay}
          />
        </div>
      </main>
    </div>
  );
}
