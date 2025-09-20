# Arabic Alphabet Learning App - CLAUDE.md

## Project Overview

This is a **Next.js 15** educational application for teaching Arabic alphabet to children ages 3-8. The app features interactive learning modules, audio pronunciation, quizzes, and comprehensive Arabic letter forms with engaging animations and responsive design.

## Quick Start Commands

```bash
# Development
npm run dev --turbopack --port 3002

# Build & Deploy
npm run build
npm start

# Linting
npm run lint
```

## Tech Stack & Dependencies

### Core Framework
- **Next.js 15.4.6** with React 19.1.0
- **TypeScript 5** for type safety
- **Tailwind CSS v4** for styling

### Key Libraries
- **Framer Motion 12.23.12** - Smooth animations and transitions
- **@lottiefiles/dotlottie-react 0.15.0** - Background animations
- **lottie-react 2.4.1** - Animation components
- **use-sound 5.0.0** - Audio management

### Development Tools
- **@tailwindcss/postcss** for CSS processing
- **TypeScript types** for React, Node.js

## Project Structure

```
quran/
├── app/
│   ├── data/
│   │   ├── arabic-alphabet.json     # 28 letters with metadata
│   │   ├── arabic-letter-forms.json # Positional forms data
│   │   └── arabic-content.json      # Additional content
│   ├── forms/page.tsx               # Arabic forms module
│   ├── quiz/
│   │   ├── page.tsx                 # General quiz
│   │   └── alphabet-[1-3]/page.tsx  # Level-specific quizzes
│   ├── layout.tsx                   # Root layout with fonts
│   ├── page.tsx                     # Main app entry
│   └── globals.css                  # Global styles
├── components/
│   ├── forms/
│   │   └── ArabicFormsPage.tsx      # Letter forms interface
│   ├── quiz/
│   │   ├── QuizGame.tsx             # Main quiz component
│   │   ├── QuizStartScreen.tsx      # Quiz entry screen
│   │   ├── StatsScreen.tsx          # Results display
│   │   └── AlphabetQuiz.tsx         # Level-specific quiz
│   └── ui/
│       ├── AlphabetGrid.tsx         # Letter grid layout
│       ├── LetterCard.tsx           # Individual letter cards
│       ├── Navigation.tsx           # Bottom navigation
│       ├── AppHeader.tsx            # App header
│       ├── LottieBackground.tsx     # Animated backgrounds
│       └── ThemeToggle.tsx          # Dark/light mode toggle
├── contexts/
│   └── ThemeContext.tsx             # Theme management
├── utils/
│   └── statsStorage.ts              # Quiz statistics
├── public/
│   └── audio/letters/               # Arabic letter pronunciations
└── CLAUDE.md                        # This file
```

## Core Features

### 1. Learning Module (`app/page.tsx`)
- **Interactive alphabet grid** with 28 Arabic letters
- **Audio pronunciation** on letter tap
- **Responsive grid layout**: 2 cols (mobile) → 4 cols (tablet) → 5 cols (desktop)
- **Haptic feedback** for mobile devices
- **Theme-aware styling** with dark/light modes

### 2. Arabic Forms Module (`components/forms/ArabicFormsPage.tsx`)
- **Complete letter forms**: Isolated, Initial, Medial, Final positions
- **Scroll-based navigation**: Vertical snap-scroll through all letters
- **Interactive scrollbar**: Custom right-side navigation
- **Connection rules**: Visual indication of letter connectivity
- **Audio integration**: Play pronunciation for each form

### 3. Quiz System
#### QuizGame (`components/quiz/QuizGame.tsx`)
- **Audio-based learning**: "Tap what you hear" methodology
- **4-choice multiple choice** questions
- **Progressive difficulty**: 10 questions per session
- **Wrong answer retry**: Ensures mastery before completion
- **Visual feedback**: Success/error animations with haptic response
- **Celebration effects**: Particle animations for correct answers

#### Statistics Tracking (`utils/statsStorage.ts`)
- **Session tracking**: Accuracy, time spent, question count
- **Achievement system**: Streaks, milestones, best scores
- **Local storage**: Persistent progress without backend
- **Performance optimization**: Debounced saves, size limits

### 4. Theme System (`contexts/ThemeContext.tsx`)
- **Dark/Light mode toggle** with system preference detection
- **Persistent storage**: Remembers user preference
- **Global theme context** accessible throughout app
- **Enhanced dark mode**: Improved colors, shadows, glows

## Design System

### Color Scheme
Each Arabic letter has a unique color for visual recognition:
```typescript
// Example colors from arabic-alphabet.json
"ا": "#00d4ff",  // Alif - Light blue
"ب": "#ff4757",  // Baa - Red
"ت": "#00ff88",  // Taa - Green
// ... 25 more unique colors
```

### Typography
- **Arabic Text**: Noto Sans Arabic (Google Fonts)
- **UI Text**: Nunito (Google Fonts)
- **Responsive sizes**: 5xl (mobile) → 6xl (desktop) for letters

### Layout Patterns
- **Mobile-first responsive design**
- **Snap scroll** for forms navigation
- **Grid layouts** with consistent spacing
- **Floating navigation** with backdrop blur
- **Card-based components** with shadow/border variations

### Animation Guidelines
- **Framer Motion** for all animations
- **Stagger children** for grid entry (0.05s delay)
- **Scale transforms** for interactive feedback (0.95-1.05)
- **Duration standards**: 0.2s (quick), 0.4s (medium), 0.6s (slow)
- **Easing**: "easeOut" for most transitions

## Data Models

### Letter Structure
```typescript
interface Letter {
  letter: string;        // Arabic character
  name: string;          // Arabic name
  englishName: string;   // Romanized name
  sound: string;         // Pronunciation guide
  color: string;         // Unique hex color
  category: string;      // "consonants" | "vowels"
  examples: string[];    // Usage examples
}
```

### Letter Forms Structure
```typescript
interface LetterForm {
  forms: {
    isolated: string;    // Standalone form
    initial: string;     // Beginning of word
    medial: string;      // Middle of word
    final: string;       // End of word
  };
  connects: {
    before: boolean;     // Connects to previous letter
    after: boolean;      // Connects to next letter
  };
}
```

### Quiz Statistics
```typescript
interface QuizStats {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;      // Percentage
  timeSpent: number;     // Seconds
}
```

## File Locations & Key Components

### Critical Files
- **Main App**: `app/page.tsx:23-164` - Core application logic
- **Letter Cards**: `components/ui/LetterCard.tsx:16-194` - Interactive letter display
- **Quiz Engine**: `components/quiz/QuizGame.tsx:38-508` - Audio quiz implementation
- **Forms Display**: `components/forms/ArabicFormsPage.tsx:28-588` - Letter forms interface
- **Theme Context**: `contexts/ThemeContext.tsx:27-60` - Global theme management

### Audio Assets
- **Location**: `/public/audio/letters/`
- **Format**: M4A files (iOS/Safari optimized)
- **Naming**: `{arabic-letter}.m4a` (e.g., `ا.m4a`, `ب.m4a`)
- **Usage**: Preloaded on component mount, played on user interaction

### Configuration Files
- **Next.js**: `next.config.ts` - App configuration
- **TypeScript**: `tsconfig.json` - Type checking rules
- **Tailwind**: `postcss.config.mjs` - CSS processing
- **Git**: `.gitignore` - Version control exclusions

## Development Guidelines

### Code Style
- **TypeScript strict mode** enabled
- **'use client'** directive for interactive components
- **Async/await** for audio playback
- **Error boundaries** for graceful failure handling
- **Performance optimization**: useRef for DOM access, memo for expensive operations

### Component Patterns
- **Props interfaces** defined for all components
- **Default props** using destructuring defaults
- **Event handlers** with proper TypeScript typing
- **State management** with useState and useContext
- **Side effects** properly managed with useEffect

### Mobile Optimization
- **Touch events** properly handled
- **Haptic feedback** integration (`navigator.vibrate`)
- **Audio autoplay** compliance (user-initiated)
- **Responsive breakpoints**: sm (640px), md (768px), lg (1024px)

## Performance Considerations

### Audio Management
- **Preload metadata** only to save bandwidth
- **Error handling** for failed audio loads
- **Audio cleanup** on component unmount
- **User gesture requirement** compliance for autoplay policies

### Animation Performance
- **Transform-based animations** for 60fps performance
- **Will-change** hints for animation layers
- **Reduced motion** respect for accessibility
- **Intersection Observer** for scroll-based animations

### Storage Optimization
- **localStorage debouncing** (500ms) for stats
- **Data size limits** (10 recent sessions max)
- **Graceful fallbacks** when storage unavailable
- **Error recovery** for corrupted data

## Accessibility Features

### Internationalization
- **RTL text support** with `dir="rtl"`
- **Arabic font loading** with fallbacks
- **Proper text alignment** for mixed content

### User Experience
- **Visual feedback** for all interactions
- **Audio alternatives** with visual cues
- **Keyboard navigation** support (where applicable)
- **Error state handling** with user-friendly messages

### Mobile Accessibility
- **Touch target sizes** (minimum 44px)
- **Gesture support** (tap, swipe, drag)
- **Orientation handling** (portrait optimized)
- **Safe area respect** for notched devices

## Testing & Quality

### Development Workflow
1. **Start dev server**: `npm run dev`
2. **Open**: http://localhost:3002
3. **Test features**: Audio, navigation, theme switching
4. **Check mobile**: Browser dev tools device simulation
5. **Lint code**: `npm run lint`

### Common Issues & Solutions
- **Audio not playing**: Check user gesture requirement, file paths
- **Animations stuttering**: Verify transform usage, reduce complexity
- **Theme not persisting**: Check localStorage availability
- **Mobile touch issues**: Verify touch-action CSS properties

### Deployment Notes
- **Build command**: `npm run build`
- **Static optimization**: Next.js automatically optimizes static assets
- **Audio files**: Ensure proper MIME types configured on server
- **Font loading**: Google Fonts handled by Next.js font optimization

## Future Enhancement Ideas

### Educational Features
- **Progress tracking**: Visual progress bars for letter mastery
- **Adaptive difficulty**: Adjust based on user performance
- **Pronunciation practice**: Record and compare feature
- **Word formation**: Connect letters to form simple words

### Technical Improvements
- **Offline support**: Service worker for offline functionality
- **PWA features**: Install prompt, splash screen
- **Analytics**: Usage tracking for feature optimization
- **A/B testing**: Different teaching methodologies

### Content Expansion
- **More quiz types**: Writing practice, letter recognition
- **Advanced forms**: Diacritics, ligatures, calligraphy
- **Cultural content**: Islamic phrases, common words
- **Multiple languages**: UI translation support

---

*Last updated: 2025-01-20*
*This file serves as the complete technical documentation for the Arabic Alphabet Learning application.*