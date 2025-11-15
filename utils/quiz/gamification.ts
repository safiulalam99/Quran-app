/**
 * Gamification Engine
 * Handles XP, levels, achievements, and streaks
 */

import type {
  XPSystem,
  XPRewards,
  StreakData,
  Achievement,
  UnlockedAchievement,
  UserProgress,
  AnswerResult,
  QuizSessionStats,
} from '../../types/quiz.types';

// ============================================================================
// XP CONFIGURATION
// ============================================================================

export const XP_REWARDS: XPRewards = {
  correctAnswer: 10,
  perfectRound: 50,
  speedBonus: 5,      // < 3 seconds
  streakBonus: 2,     // Per consecutive correct
  firstTimeCorrect: 15,
  mastery: 100,       // Item reaches level 3
  comboMultiplier: 1.5, // After 5+ streak
} as const;

/**
 * XP needed for each level (exponential growth)
 */
const calculateXPForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// ============================================================================
// XP SYSTEM
// ============================================================================

/**
 * Create initial XP system
 */
export const createXPSystem = (): XPSystem => ({
  totalXP: 0,
  currentLevel: 1,
  xpToNextLevel: calculateXPForLevel(1),
  xpInCurrentLevel: 0,
});

/**
 * Calculate XP earned for an answer
 */
export const calculateXPForAnswer = (
  result: AnswerResult,
  currentStreak: number,
  isFirstTimeCorrect: boolean
): number => {
  if (!result.isCorrect) return 0;

  let xp = XP_REWARDS.correctAnswer;

  // Speed bonus
  if (result.responseTime < 3000) {
    xp += XP_REWARDS.speedBonus;
  }

  // Streak bonus
  if (currentStreak > 0) {
    xp += currentStreak * XP_REWARDS.streakBonus;
  }

  // Combo multiplier for long streaks
  if (currentStreak >= 5) {
    xp = Math.floor(xp * XP_REWARDS.comboMultiplier);
  }

  // First time bonus
  if (isFirstTimeCorrect) {
    xp += XP_REWARDS.firstTimeCorrect;
  }

  return xp;
};

/**
 * Add XP and check for level up
 */
export const addXP = (
  xpSystem: XPSystem,
  xpGained: number
): { system: XPSystem; leveledUp: boolean; newLevel: number } => {
  const newTotalXP = xpSystem.totalXP + xpGained;
  let newXPInLevel = xpSystem.xpInCurrentLevel + xpGained;
  let newLevel = xpSystem.currentLevel;
  let xpToNextLevel = xpSystem.xpToNextLevel;
  let leveledUp = false;

  // Check for level up (can level up multiple times)
  while (newXPInLevel >= xpToNextLevel) {
    newXPInLevel -= xpToNextLevel;
    newLevel++;
    xpToNextLevel = calculateXPForLevel(newLevel);
    leveledUp = true;
  }

  return {
    system: {
      totalXP: newTotalXP,
      currentLevel: newLevel,
      xpToNextLevel,
      xpInCurrentLevel: newXPInLevel,
    },
    leveledUp,
    newLevel,
  };
};

// ============================================================================
// STREAK SYSTEM
// ============================================================================

/**
 * Create initial streak data
 */
export const createStreakData = (): StreakData => ({
  currentStreak: 0,
  longestStreak: 0,
  dailyStreak: 0,
  longestDailyStreak: 0,
  lastPracticeDate: new Date().toISOString().split('T')[0],
  freezeAvailable: true,
});

/**
 * Update streak after an answer
 */
export const updateStreak = (
  streakData: StreakData,
  isCorrect: boolean
): StreakData => {
  if (isCorrect) {
    const newStreak = streakData.currentStreak + 1;
    return {
      ...streakData,
      currentStreak: newStreak,
      longestStreak: Math.max(streakData.longestStreak, newStreak),
    };
  } else {
    // Reset streak on wrong answer
    return {
      ...streakData,
      currentStreak: 0,
    };
  }
};

/**
 * Update daily streak
 */
export const updateDailyStreak = (streakData: StreakData): StreakData => {
  const today = new Date().toISOString().split('T')[0];
  const lastDate = new Date(streakData.lastPracticeDate);
  const todayDate = new Date(today);

  const daysDiff = Math.floor(
    (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff === 0) {
    // Same day, no change
    return streakData;
  }

  if (daysDiff === 1) {
    // Consecutive day
    const newDailyStreak = streakData.dailyStreak + 1;
    return {
      ...streakData,
      dailyStreak: newDailyStreak,
      longestDailyStreak: Math.max(streakData.longestDailyStreak, newDailyStreak),
      lastPracticeDate: today,
      freezeAvailable: true, // Refresh freeze
    };
  }

  if (daysDiff === 2 && streakData.freezeAvailable) {
    // Missed one day but can use freeze
    const newDailyStreak = streakData.dailyStreak + 1;
    return {
      ...streakData,
      dailyStreak: newDailyStreak,
      longestDailyStreak: Math.max(streakData.longestDailyStreak, newDailyStreak),
      lastPracticeDate: today,
      freezeAvailable: false, // Used freeze
    };
  }

  // Streak broken
  return {
    ...streakData,
    dailyStreak: 1, // Start new streak
    lastPracticeDate: today,
    freezeAvailable: true,
  };
};

// ============================================================================
// ACHIEVEMENTS
// ============================================================================

/**
 * Define all achievements
 */
export const ACHIEVEMENTS: readonly Achievement[] = [
  // Beginner achievements
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first quiz',
    icon: '🎯',
    rarity: 'common',
    reward: 20,
    condition: (stats) => stats.totalSessions >= 1,
  },
  {
    id: 'quick_learner',
    name: 'Quick Learner',
    description: 'Answer 10 questions correctly',
    icon: '⚡',
    rarity: 'common',
    reward: 30,
    condition: (stats) => stats.totalCorrectAnswers >= 10,
  },

  // Streak achievements
  {
    id: 'on_fire',
    name: 'On Fire',
    description: 'Get 5 correct answers in a row',
    icon: '🔥',
    rarity: 'common',
    reward: 50,
    condition: (stats) => stats.streak.longestStreak >= 5,
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Get 10 correct answers in a row',
    icon: '💪',
    rarity: 'rare',
    reward: 100,
    condition: (stats) => stats.streak.longestStreak >= 10,
  },
  {
    id: 'legendary_streak',
    name: 'Legendary Streak',
    description: 'Get 20 correct answers in a row',
    icon: '👑',
    rarity: 'legendary',
    reward: 300,
    condition: (stats) => stats.streak.longestStreak >= 20,
  },

  // Daily streak achievements
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Practice 7 days in a row',
    icon: '📅',
    rarity: 'rare',
    reward: 150,
    condition: (stats) => stats.streak.dailyStreak >= 7,
  },
  {
    id: 'month_master',
    name: 'Month Master',
    description: 'Practice 30 days in a row',
    icon: '🌟',
    rarity: 'epic',
    reward: 500,
    condition: (stats) => stats.streak.dailyStreak >= 30,
  },

  // Accuracy achievements
  {
    id: 'perfect_ten',
    name: 'Perfect 10',
    description: 'Complete a quiz with 100% accuracy',
    icon: '💯',
    rarity: 'rare',
    reward: 100,
    condition: (stats) => stats.sessionHistory.some(s => s.stats.accuracy === 100),
  },
  {
    id: 'accuracy_ace',
    name: 'Accuracy Ace',
    description: 'Maintain 90%+ average accuracy',
    icon: '🎓',
    rarity: 'epic',
    reward: 200,
    condition: (stats) => stats.globalAccuracy >= 90,
  },

  // Mastery achievements
  {
    id: 'fatha_master',
    name: 'Fatha Master',
    description: 'Master all 28 Fatha letters',
    icon: '🏆',
    rarity: 'legendary',
    reward: 500,
    condition: (stats) => {
      const masteredCount = Object.values(stats.memoryStates)
        .filter(s => s.strengthLevel === 3).length;
      return masteredCount === 28;
    },
  },

  // Volume achievements
  {
    id: 'dedicated_learner',
    name: 'Dedicated Learner',
    description: 'Complete 10 quizzes',
    icon: '📚',
    rarity: 'common',
    reward: 50,
    condition: (stats) => stats.totalSessions >= 10,
  },
  {
    id: 'quiz_champion',
    name: 'Quiz Champion',
    description: 'Complete 50 quizzes',
    icon: '🏅',
    rarity: 'rare',
    reward: 200,
    condition: (stats) => stats.totalSessions >= 50,
  },
  {
    id: 'century_club',
    name: 'Century Club',
    description: 'Complete 100 quizzes',
    icon: '💎',
    rarity: 'epic',
    reward: 500,
    condition: (stats) => stats.totalSessions >= 100,
  },

  // Speed achievements
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Answer 10 questions in under 2 seconds each',
    icon: '⚡',
    rarity: 'rare',
    reward: 150,
    condition: (stats) => {
      // Check if any recent session had average response time < 2000ms
      return stats.sessionHistory.some(
        s => s.stats.averageResponseTime < 2000 && s.stats.totalQuestions >= 10
      );
    },
  },
] as const;

/**
 * Check for newly unlocked achievements
 */
export const checkAchievements = (
  userProgress: UserProgress
): readonly Achievement[] => {
  const unlockedIds = new Set(
    userProgress.achievements.map(a => a.achievementId)
  );

  return ACHIEVEMENTS.filter(
    achievement =>
      !unlockedIds.has(achievement.id) &&
      achievement.condition(userProgress)
  );
};

/**
 * Unlock an achievement
 */
export const unlockAchievement = (
  achievementId: string,
  currentAchievements: readonly UnlockedAchievement[]
): readonly UnlockedAchievement[] => {
  const newAchievement: UnlockedAchievement = {
    achievementId,
    unlockedAt: new Date().toISOString(),
    seen: false,
  };

  return [...currentAchievements, newAchievement];
};

// ============================================================================
// FEEDBACK MESSAGES
// ============================================================================

/**
 * Get encouraging feedback message
 */
export const getFeedbackMessage = (
  isCorrect: boolean,
  streak: number,
  responseTime: number
): string => {
  if (!isCorrect) {
    const messages = [
      "Try again! You've got this! 💪",
      "So close! Listen carefully 🎧",
      "Don't give up! 🌈",
      "Keep trying! You're learning! ⭐",
      "Almost there! 🎯",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Speed-based messages
  if (responseTime < 2000) {
    const speedMessages = [
      "Lightning fast! ⚡",
      "Wow! So quick! 🚀",
      "Speed master! 💨",
    ];
    return speedMessages[Math.floor(Math.random() * speedMessages.length)];
  }

  // Streak-based messages
  if (streak >= 10) {
    return "Unstoppable! 👑";
  }
  if (streak >= 5) {
    return "You're on fire! 🔥";
  }
  if (streak >= 3) {
    return "Amazing streak! ⭐";
  }

  // General positive messages
  const messages = [
    "Great job! 🎉",
    "Perfect! ⭐",
    "Fantastic! 🌟",
    "Excellent! ✨",
    "Well done! 👏",
    "Brilliant! 💫",
    "Superb! 🎊",
  ];

  return messages[Math.floor(Math.random() * messages.length)];
};

// ============================================================================
// SESSION SUMMARY
// ============================================================================

/**
 * Calculate session summary with gamification elements
 */
export const calculateSessionSummary = (
  stats: QuizSessionStats,
  xpEarned: number,
  newAchievements: readonly Achievement[]
): string => {
  const parts: string[] = [];

  // XP earned
  parts.push(`+${xpEarned} XP`);

  // Accuracy
  if (stats.accuracy === 100) {
    parts.push("Perfect score! 💯");
  } else if (stats.accuracy >= 90) {
    parts.push("Excellent! 🌟");
  } else if (stats.accuracy >= 75) {
    parts.push("Great job! ✨");
  } else if (stats.accuracy >= 50) {
    parts.push("Good effort! 💪");
  }

  // New achievements
  if (newAchievements.length > 0) {
    parts.push(`${newAchievements.length} new achievement${newAchievements.length > 1 ? 's' : ''}! 🏆`);
  }

  return parts.join(" • ");
};
