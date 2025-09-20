'use client';

import { usePathname, useRouter } from 'next/navigation';
import Navigation from './Navigation';

export default function GlobalNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  // Determine current mode based on pathname
  const getCurrentMode = (): 'learn' | 'quiz' => {
    if (pathname.includes('/quiz') || pathname.includes('/forms')) {
      return 'quiz';
    }
    return 'learn';
  };

  // Handle mode changes with proper routing
  const handleModeChange = (mode: 'learn' | 'quiz') => {
    if (mode === 'learn') {
      router.push('/');
    } else if (mode === 'quiz') {
      router.push('/quiz');
    }
  };

  return (
    <Navigation
      currentMode={getCurrentMode()}
      onModeChange={handleModeChange}
    />
  );
}