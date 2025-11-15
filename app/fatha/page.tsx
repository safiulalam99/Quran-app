'use client';

import FathaLearningPage from '../../components/fatha/FathaLearningPage';
import Navigation from '../../components/ui/Navigation';

export default function FathaPage() {
  return (
    <>
      <FathaLearningPage />
      <Navigation currentMode="learn" onModeChange={() => {}} />
    </>
  );
}
