/**
 * Spaced Repetition System (SRS) Engine
 * Inspired by Duolingo's Half-Life Regression algorithm
 * Optimized for children ages 3-8
 */

import type { MemoryState, StrengthLevel } from '../../types/quiz.types';

// ============================================================================
// CONFIGURATION
// ============================================================================

const SRS_CONFIG = {
  // Intervals between reviews (in number of questions)
  INTERVALS: {
    NEW: 2,           // New items appear every 2 questions
    LEARNING: 5,      // Learning items every 5 questions
    FAMILIAR: 15,     // Familiar items every 15 questions
    MASTERED: 30,     // Mastered items every 30 questions
  },

  // Number of correct answers needed to level up
  LEVEL_UP_THRESHOLD: {
    TO_LEARNING: 2,   // 2 correct → Learning
    TO_FAMILIAR: 4,   // 4 total correct → Familiar
    TO_MASTERED: 7,   // 7 total correct → Mastered
  },

  // Forgetting curve: incorrect answer impact
  FORGETTING_PENALTY: {
    LEARNING: 1,      // Drop 1 level
    FAMILIAR: 1,      // Drop 1 level
    MASTERED: 2,      // Drop 2 levels if mastered
  },

  // Error history size
  MAX_ERROR_HISTORY: 5,
} as const;

// ============================================================================
// MEMORY STATE CREATION
// ============================================================================

/**
 * Create initial memory state for a new item
 */
export const createMemoryState = <T = string>(itemId: T): MemoryState<T> => ({
  itemId,
  strengthLevel: 0,
  correctCount: 0,
  incorrectCount: 0,
  lastSeenTimestamp: 0,
  nextReviewAfter: SRS_CONFIG.INTERVALS.NEW,
  totalExposures: 0,
  averageResponseTime: 0,
  errorHistory: [],
});

// ============================================================================
// STRENGTH LEVEL CALCULATION
// ============================================================================

/**
 * Calculate strength level based on performance
 */
export const calculateStrengthLevel = (
  correctCount: number,
  incorrectCount: number,
  errorHistory: readonly number[]
): StrengthLevel => {
  // Recent performance matters more
  const recentErrors = errorHistory.slice(-3);
  const recentErrorRate = recentErrors.length > 0
    ? recentErrors.filter(x => x === 0).length / recentErrors.length
    : 0;

  // High recent error rate = demote
  if (recentErrorRate > 0.5 && correctCount < 10) {
    return 0; // Reset to new
  }

  // Level up based on total correct count
  if (correctCount >= SRS_CONFIG.LEVEL_UP_THRESHOLD.TO_MASTERED) {
    return 3; // Mastered
  }

  if (correctCount >= SRS_CONFIG.LEVEL_UP_THRESHOLD.TO_FAMILIAR) {
    return 2; // Familiar
  }

  if (correctCount >= SRS_CONFIG.LEVEL_UP_THRESHOLD.TO_LEARNING) {
    return 1; // Learning
  }

  return 0; // New
};

/**
 * Get next review interval based on strength level
 */
export const getNextReviewInterval = (strengthLevel: StrengthLevel): number => {
  switch (strengthLevel) {
    case 0: return SRS_CONFIG.INTERVALS.NEW;
    case 1: return SRS_CONFIG.INTERVALS.LEARNING;
    case 2: return SRS_CONFIG.INTERVALS.FAMILIAR;
    case 3: return SRS_CONFIG.INTERVALS.MASTERED;
    default: return SRS_CONFIG.INTERVALS.NEW;
  }
};

// ============================================================================
// MEMORY STATE UPDATES
// ============================================================================

/**
 * Update memory state after a correct answer
 */
export const updateMemoryStateCorrect = <T>(
  state: MemoryState<T>,
  responseTime: number,
  currentQuestionIndex: number
): MemoryState<T> => {
  const newCorrectCount = state.correctCount + 1;
  const newErrorHistory = [...state.errorHistory, 1].slice(-SRS_CONFIG.MAX_ERROR_HISTORY);

  const newStrengthLevel = calculateStrengthLevel(
    newCorrectCount,
    state.incorrectCount,
    newErrorHistory
  );

  const newAverageResponseTime = state.totalExposures === 0
    ? responseTime
    : (state.averageResponseTime * state.totalExposures + responseTime) / (state.totalExposures + 1);

  return {
    ...state,
    correctCount: newCorrectCount,
    strengthLevel: newStrengthLevel,
    lastSeenTimestamp: currentQuestionIndex,
    nextReviewAfter: getNextReviewInterval(newStrengthLevel),
    totalExposures: state.totalExposures + 1,
    averageResponseTime: Math.round(newAverageResponseTime),
    errorHistory: newErrorHistory,
  };
};

/**
 * Update memory state after an incorrect answer
 */
export const updateMemoryStateIncorrect = <T>(
  state: MemoryState<T>,
  responseTime: number,
  currentQuestionIndex: number
): MemoryState<T> => {
  const newIncorrectCount = state.incorrectCount + 1;
  const newErrorHistory = [...state.errorHistory, 0].slice(-SRS_CONFIG.MAX_ERROR_HISTORY);

  // Apply forgetting penalty - drop strength level
  const penalty = SRS_CONFIG.FORGETTING_PENALTY[
    state.strengthLevel === 3 ? 'MASTERED' :
    state.strengthLevel === 2 ? 'FAMILIAR' : 'LEARNING'
  ];

  const newStrengthLevel = Math.max(
    0,
    state.strengthLevel - penalty
  ) as StrengthLevel;

  const newAverageResponseTime = state.totalExposures === 0
    ? responseTime
    : (state.averageResponseTime * state.totalExposures + responseTime) / (state.totalExposures + 1);

  return {
    ...state,
    incorrectCount: newIncorrectCount,
    strengthLevel: newStrengthLevel,
    lastSeenTimestamp: currentQuestionIndex,
    nextReviewAfter: getNextReviewInterval(newStrengthLevel),
    totalExposures: state.totalExposures + 1,
    averageResponseTime: Math.round(newAverageResponseTime),
    errorHistory: newErrorHistory,
  };
};

// ============================================================================
// ITEM SELECTION ALGORITHM
// ============================================================================

/**
 * Check if item is due for review
 */
export const isDueForReview = <T>(
  state: MemoryState<T>,
  currentQuestionIndex: number
): boolean => {
  const questionsSinceLastSeen = currentQuestionIndex - state.lastSeenTimestamp;
  return questionsSinceLastSeen >= state.nextReviewAfter;
};

/**
 * Calculate priority score for item selection
 * Higher score = higher priority to show
 */
export const calculatePriority = <T>(
  state: MemoryState<T>,
  currentQuestionIndex: number
): number => {
  let priority = 0;

  // Priority 1: Due for review
  if (isDueForReview(state, currentQuestionIndex)) {
    priority += 1000;
  }

  // Priority 2: Weaker items get higher priority
  priority += (3 - state.strengthLevel) * 100;

  // Priority 3: Recent errors increase priority
  const recentErrorRate = state.errorHistory.length > 0
    ? state.errorHistory.filter(x => x === 0).length / state.errorHistory.length
    : 0;
  priority += recentErrorRate * 50;

  // Priority 4: Never seen items get medium priority
  if (state.totalExposures === 0) {
    priority += 150;
  }

  // Priority 5: Items not seen in a while get bonus
  const questionsSinceLastSeen = currentQuestionIndex - state.lastSeenTimestamp;
  priority += Math.min(questionsSinceLastSeen * 2, 100);

  return priority;
};

/**
 * Select next item to quiz using weighted random selection
 */
export const selectNextItem = <T>(
  memoryStates: readonly MemoryState<T>[],
  currentQuestionIndex: number,
  excludeItems: readonly T[] = []
): MemoryState<T> | null => {
  if (memoryStates.length === 0) return null;

  // Filter out excluded items
  const availableStates = memoryStates.filter(
    state => !excludeItems.includes(state.itemId)
  );

  if (availableStates.length === 0) return null;

  // Calculate priorities
  const priorities = availableStates.map(state => ({
    state,
    priority: calculatePriority(state, currentQuestionIndex),
  }));

  // Sort by priority (descending)
  priorities.sort((a, b) => b.priority - a.priority);

  // Use weighted random selection from top 30%
  const topPercentile = Math.max(1, Math.ceil(priorities.length * 0.3));
  const topCandidates = priorities.slice(0, topPercentile);

  // Weighted random selection
  const totalWeight = topCandidates.reduce((sum, item) => sum + item.priority, 0);
  let random = Math.random() * totalWeight;

  for (const candidate of topCandidates) {
    random -= candidate.priority;
    if (random <= 0) {
      return candidate.state;
    }
  }

  // Fallback: return highest priority
  return topCandidates[0].state;
};

/**
 * Get weak items that need practice (strength level 0-1)
 */
export const getWeakItems = <T>(
  memoryStates: readonly MemoryState<T>[]
): readonly MemoryState<T>[] => {
  return memoryStates.filter(state => state.strengthLevel <= 1);
};

/**
 * Get mastered items (strength level 3)
 */
export const getMasteredItems = <T>(
  memoryStates: readonly MemoryState<T>[]
): readonly MemoryState<T>[] => {
  return memoryStates.filter(state => state.strengthLevel === 3);
};

/**
 * Get overall progress percentage
 */
export const getOverallProgress = <T>(
  memoryStates: readonly MemoryState<T>[]
): number => {
  if (memoryStates.length === 0) return 0;

  const totalStrength = memoryStates.reduce(
    (sum, state) => sum + state.strengthLevel,
    0
  );
  const maxStrength = memoryStates.length * 3;

  return Math.round((totalStrength / maxStrength) * 100);
};

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Get SRS statistics for analytics
 */
export const getSRSStats = <T>(memoryStates: readonly MemoryState<T>[]) => {
  const levelCounts = {
    new: 0,
    learning: 0,
    familiar: 0,
    mastered: 0,
  };

  memoryStates.forEach(state => {
    switch (state.strengthLevel) {
      case 0: levelCounts.new++; break;
      case 1: levelCounts.learning++; break;
      case 2: levelCounts.familiar++; break;
      case 3: levelCounts.mastered++; break;
    }
  });

  return {
    total: memoryStates.length,
    ...levelCounts,
    progressPercentage: getOverallProgress(memoryStates),
    averageStrength: memoryStates.length > 0
      ? memoryStates.reduce((sum, s) => sum + s.strengthLevel, 0) / memoryStates.length
      : 0,
  };
};
