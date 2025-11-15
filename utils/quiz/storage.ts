/**
 * Storage Utility for Quiz Progress
 * Handles localStorage persistence with error handling
 */

import type {
  UserProgress,
  MemoryState,
  QuizSessionRecord,
} from '../../types/quiz.types';
import { StorageKey } from '../../types/quiz.types';
import { createXPSystem, createStreakData } from './gamification';

// ============================================================================
// STORAGE UTILITIES
// ============================================================================

/**
 * Check if localStorage is available
 */
const isStorageAvailable = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Safely get item from localStorage
 */
const getItem = (key: string): string | null => {
  if (!isStorageAvailable()) return null;

  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`Failed to get ${key} from localStorage:`, error);
    return null;
  }
};

/**
 * Safely set item in localStorage
 */
const setItem = (key: string, value: string): boolean => {
  if (!isStorageAvailable()) return false;

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Failed to set ${key} in localStorage:`, error);
    return false;
  }
};

/**
 * Safely remove item from localStorage
 */
const removeItem = (key: string): boolean => {
  if (!isStorageAvailable()) return false;

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove ${key} from localStorage:`, error);
    return false;
  }
};

// ============================================================================
// USER PROGRESS MANAGEMENT
// ============================================================================

/**
 * Create default user progress
 */
export const createDefaultUserProgress = (): UserProgress => ({
  memoryStates: {},
  xp: createXPSystem(),
  streak: createStreakData(),
  lives: {
    maxLives: 5,
    currentLives: 5,
    lastLossTimestamp: 0,
    regenerationRate: 10, // minutes
  },
  achievements: [],
  totalSessions: 0,
  totalQuestionsAnswered: 0,
  totalCorrectAnswers: 0,
  globalAccuracy: 0,
  totalTimeSpent: 0,
  totalXPEarned: 0,
  sessionHistory: [],
  soundEnabled: true,
  hapticEnabled: true,
  difficulty: 'medium',
  lastUpdated: new Date().toISOString(),
});

/**
 * Load user progress from localStorage
 */
export const loadUserProgress = (): UserProgress => {
  const stored = getItem(StorageKey.USER_PROGRESS);

  if (!stored) {
    return createDefaultUserProgress();
  }

  try {
    const parsed = JSON.parse(stored);
    return {
      ...createDefaultUserProgress(),
      ...parsed,
      lastUpdated: parsed.lastUpdated || new Date().toISOString(),
    };
  } catch (error) {
    console.warn('Failed to parse user progress:', error);
    return createDefaultUserProgress();
  }
};

/**
 * Save user progress to localStorage with debouncing
 */
let saveTimeout: NodeJS.Timeout | null = null;

export const saveUserProgress = (progress: UserProgress): boolean => {
  // Debounce saves to avoid excessive writes
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  return new Promise<boolean>((resolve) => {
    saveTimeout = setTimeout(() => {
      const updated: UserProgress = {
        ...progress,
        lastUpdated: new Date().toISOString(),
      };

      // Optimize data before storing
      const optimized = {
        ...updated,
        // Limit session history to last 50
        sessionHistory: updated.sessionHistory.slice(0, 50),
        // Round floating point numbers
        globalAccuracy: Math.round(updated.globalAccuracy * 100) / 100,
      };

      const success = setItem(
        StorageKey.USER_PROGRESS,
        JSON.stringify(optimized)
      );

      resolve(success);
    }, 500); // 500ms debounce
  }) as any; // Type cast for synchronous-looking API
};

/**
 * Clear all user progress (reset)
 */
export const clearUserProgress = (): boolean => {
  return removeItem(StorageKey.USER_PROGRESS);
};

// ============================================================================
// MEMORY STATE MANAGEMENT
// ============================================================================

/**
 * Get memory state for a specific item
 */
export const getMemoryState = <T = string>(
  progress: UserProgress,
  itemId: T
): MemoryState<T> | null => {
  const key = String(itemId);
  return (progress.memoryStates[key] as MemoryState<T>) || null;
};

/**
 * Set memory state for a specific item
 */
export const setMemoryState = <T = string>(
  progress: UserProgress,
  state: MemoryState<T>
): UserProgress => {
  const key = String(state.itemId);
  return {
    ...progress,
    memoryStates: {
      ...progress.memoryStates,
      [key]: state as any, // Type cast needed for generic flexibility
    },
  };
};

/**
 * Get all memory states as array
 */
export const getAllMemoryStates = <T = string>(
  progress: UserProgress
): MemoryState<T>[] => {
  return Object.values(progress.memoryStates) as MemoryState<T>[];
};

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Add a new quiz session to history
 */
export const addSessionToHistory = (
  progress: UserProgress,
  session: QuizSessionRecord
): UserProgress => {
  return {
    ...progress,
    sessionHistory: [session, ...progress.sessionHistory].slice(0, 50),
    totalSessions: progress.totalSessions + 1,
    totalQuestionsAnswered:
      progress.totalQuestionsAnswered + session.stats.totalQuestions,
    totalCorrectAnswers:
      progress.totalCorrectAnswers + session.stats.correctAnswers,
    globalAccuracy:
      progress.totalSessions === 0
        ? session.stats.accuracy
        : (progress.globalAccuracy * progress.totalSessions + session.stats.accuracy) /
          (progress.totalSessions + 1),
    totalTimeSpent: progress.totalTimeSpent + session.stats.timeSpent,
    totalXPEarned: progress.totalXPEarned + session.stats.xpEarned,
  };
};

/**
 * Get sessions for a specific quiz
 */
export const getQuizSessions = (
  progress: UserProgress,
  quizId: string
): readonly QuizSessionRecord[] => {
  return progress.sessionHistory.filter(s => s.quizId === quizId);
};

/**
 * Get best score for a quiz
 */
export const getQuizBestScore = (
  progress: UserProgress,
  quizId: string
): number => {
  const sessions = getQuizSessions(progress, quizId);
  if (sessions.length === 0) return 0;

  return Math.max(...sessions.map(s => s.stats.accuracy));
};

// ============================================================================
// LIVES MANAGEMENT
// ============================================================================

/**
 * Regenerate lives based on time passed
 */
export const regenerateLives = (progress: UserProgress): UserProgress => {
  const { lives } = progress;

  if (lives.currentLives >= lives.maxLives) {
    return progress; // Already at max
  }

  const now = Date.now();
  const timeSinceLastLoss = now - lives.lastLossTimestamp;
  const minutesPassed = Math.floor(timeSinceLastLoss / (1000 * 60));
  const livesRegained = Math.floor(minutesPassed / lives.regenerationRate);

  if (livesRegained === 0) {
    return progress; // No lives to regenerate yet
  }

  const newLives = Math.min(lives.maxLives, lives.currentLives + livesRegained);

  return {
    ...progress,
    lives: {
      ...lives,
      currentLives: newLives,
      lastLossTimestamp: newLives >= lives.maxLives ? 0 : lives.lastLossTimestamp,
    },
  };
};

/**
 * Lose a life
 */
export const loseLife = (progress: UserProgress): UserProgress => {
  const newLives = Math.max(0, progress.lives.currentLives - 1);

  return {
    ...progress,
    lives: {
      ...progress.lives,
      currentLives: newLives,
      lastLossTimestamp: newLives === progress.lives.currentLives - 1
        ? Date.now()
        : progress.lives.lastLossTimestamp,
    },
  };
};

// ============================================================================
// MIGRATION & COMPATIBILITY
// ============================================================================

/**
 * Migrate old stats storage format to new format
 */
export const migrateOldStats = (): UserProgress | null => {
  const oldStats = getItem('arabic-alphabet-stats');

  if (!oldStats) return null;

  try {
    const parsed = JSON.parse(oldStats);
    const newProgress = createDefaultUserProgress();

    // Map old stats to new format
    return {
      ...newProgress,
      totalSessions: parsed.totalSessions || 0,
      totalQuestionsAnswered: parsed.totalQuestionsAnswered || 0,
      totalCorrectAnswers: parsed.totalCorrectAnswers || 0,
      globalAccuracy: parsed.averageAccuracy || 0,
      totalTimeSpent: parsed.totalTimeSpent || 0,
      streak: {
        ...newProgress.streak,
        dailyStreak: parsed.currentStreak || 0,
        longestDailyStreak: parsed.longestStreak || 0,
      },
    };
  } catch (error) {
    console.warn('Failed to migrate old stats:', error);
    return null;
  }
};

/**
 * Initialize user progress (with migration if needed)
 */
export const initializeUserProgress = (): UserProgress => {
  // Try to load existing progress
  let progress = loadUserProgress();

  // If no new progress exists, try to migrate old stats
  if (progress.totalSessions === 0) {
    const migrated = migrateOldStats();
    if (migrated) {
      progress = migrated;
      saveUserProgress(progress);
    }
  }

  // Regenerate lives
  progress = regenerateLives(progress);
  saveUserProgress(progress);

  return progress;
};

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

/**
 * Export user progress as JSON (for backup)
 */
export const exportProgress = (progress: UserProgress): string => {
  return JSON.stringify(progress, null, 2);
};

/**
 * Import user progress from JSON
 */
export const importProgress = (json: string): UserProgress | null => {
  try {
    const parsed = JSON.parse(json);
    const progress: UserProgress = {
      ...createDefaultUserProgress(),
      ...parsed,
    };

    saveUserProgress(progress);
    return progress;
  } catch (error) {
    console.error('Failed to import progress:', error);
    return null;
  }
};
