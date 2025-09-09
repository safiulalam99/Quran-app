'use client';

import ArabicFormsPage from '../../components/forms/ArabicFormsPage';
import { ThemeProvider } from '../../contexts/ThemeContext';

export default function FormsPage() {
  return (
    <ThemeProvider>
      <ArabicFormsPage />
    </ThemeProvider>
  );
}