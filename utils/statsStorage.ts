'use client';

interface QuizSession {
  id: string;
  date: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  timeSpent: number;
}

interface UserStats {
  totalSessions: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  averageAccuracy: number;
  totalTimeSpent: number;
  bestAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  recentSessions: QuizSession[];
}

const STORAGE_KEY = 'arabic-alphabet-stats';
const MAX_RECENT_SESSIONS = 10;

// Utility to safely access localStorage
const isLocalStorageAvailable = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    const test = 'test';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// Get stats from localStorage
export const getStoredStats = (): UserStats => {
  if (!isLocalStorageAvailable()) {
    return getDefaultStats();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultStats();
    
    const stats = JSON.parse(stored);
    return {
      ...getDefaultStats(),
      ...stats,
    };
  } catch (error) {
    console.warn('Failed to load stats from localStorage:', error);
    return getDefaultStats();
  }
};

// Save stats to localStorage (debounced for performance)
let saveTimeout: NodeJS.Timeout | null = null;
export const saveStats = (stats: UserStats): void => {
  if (!isLocalStorageAvailable()) return;

  // Debounce saves to avoid excessive localStorage writes
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(() => {
    try {
      // Keep only essential data to minimize storage size
      const optimizedStats = {
        totalSessions: stats.totalSessions,
        totalQuestionsAnswered: stats.totalQuestionsAnswered,
        totalCorrectAnswers: stats.totalCorrectAnswers,
        averageAccuracy: Math.round(stats.averageAccuracy * 100) / 100, // 2 decimal places
        totalTimeSpent: stats.totalTimeSpent,
        bestAccuracy: Math.round(stats.bestAccuracy * 100) / 100,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        recentSessions: stats.recentSessions.slice(0, MAX_RECENT_SESSIONS), // Limit array size
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(optimizedStats));
    } catch (error) {
      console.warn('Failed to save stats to localStorage:', error);
    }
  }, 500); // 500ms debounce
};

// Default stats structure
const getDefaultStats = (): UserStats => ({
  totalSessions: 0,
  totalQuestionsAnswered: 0,
  totalCorrectAnswers: 0,
  averageAccuracy: 0,
  totalTimeSpent: 0,
  bestAccuracy: 0,
  currentStreak: 0,
  longestStreak: 0,
  recentSessions: [],
});

// Add a new quiz session and update stats
export const addQuizSession = (sessionData: Omit<QuizSession, 'id' | 'date'>): UserStats => {
  const currentStats = getStoredStats();
  
  const newSession: QuizSession = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    ...sessionData,
  };

  // Update streak
  const newStreak = sessionData.accuracy >= 75 ? currentStats.currentStreak + 1 : 0;
  
  const updatedStats: UserStats = {
    totalSessions: currentStats.totalSessions + 1,
    totalQuestionsAnswered: currentStats.totalQuestionsAnswered + sessionData.totalQuestions,
    totalCorrectAnswers: currentStats.totalCorrectAnswers + sessionData.correctAnswers,
    averageAccuracy: 
      ((currentStats.averageAccuracy * currentStats.totalSessions) + sessionData.accuracy) / 
      (currentStats.totalSessions + 1),
    totalTimeSpent: currentStats.totalTimeSpent + sessionData.timeSpent,
    bestAccuracy: Math.max(currentStats.bestAccuracy, sessionData.accuracy),
    currentStreak: newStreak,
    longestStreak: Math.max(currentStats.longestStreak, newStreak),
    recentSessions: [newSession, ...currentStats.recentSessions].slice(0, MAX_RECENT_SESSIONS),
  };

  saveStats(updatedStats);
  return updatedStats;
};

// Get achievement status
export const getAchievements = (stats: UserStats) => {
  const achievements = [];

  if (stats.totalSessions >= 1) achievements.push({ name: 'First Quiz', emoji: '🎯', description: 'Completed your first quiz!' });
  if (stats.totalSessions >= 10) achievements.push({ name: 'Dedicated Learner', emoji: '📚', description: 'Completed 10 quizzes!' });
  if (stats.bestAccuracy >= 90) achievements.push({ name: 'Perfect Score', emoji: '🌟', description: 'Achieved 90%+ accuracy!' });
  if (stats.currentStreak >= 3) achievements.push({ name: 'On Fire', emoji: '🔥', description: '3 quiz streak!' });
  if (stats.totalCorrectAnswers >= 50) achievements.push({ name: 'Arabic Master', emoji: '🏆', description: '50 correct answers!' });

  return achievements;
};

// Clear all stats (for testing or reset)
export const clearStats = (): void => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear stats:', error);
  }
};