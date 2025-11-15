/**
 * Compatibility layer between old stats system and new quiz system
 */

import { loadUserProgress, getQuizSessions, getQuizBestScore } from './storage';

/**
 * Get quiz stats compatible with old Navigation component
 */
export const getQuizStatsCompat = (quizId: string): { bestScore: number; attempts: number } => {
  try {
    const progress = loadUserProgress();
    const sessions = getQuizSessions(progress, quizId);

    if (sessions.length === 0) {
      return { bestScore: 0, attempts: 0 };
    }

    const bestScore = getQuizBestScore(progress, quizId);
    const attempts = sessions.length;

    return {
      bestScore: Math.round(bestScore),
      attempts,
    };
  } catch (error) {
    console.warn(`Failed to get quiz stats for ${quizId}:`, error);
    return { bestScore: 0, attempts: 0 };
  }
};
