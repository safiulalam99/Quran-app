/**
 * Comprehensive Type Definitions for Quiz System
 * Following SOLID principles and designed for scalability
 */

// ============================================================================
// CORE LEARNING TYPES
// ============================================================================

/**
 * Memory state for spaced repetition system
 * Tracks learning progress for individual items
 */
export interface MemoryState<T = string> {
  readonly itemId: T;
  readonly strengthLevel: StrengthLevel;
  readonly correctCount: number;
  readonly incorrectCount: number;
  readonly lastSeenTimestamp: number;
  readonly nextReviewAfter: number; // Questions until next review
  readonly totalExposures: number;
  readonly averageResponseTime: number; // ms
  readonly errorHistory: readonly number[]; // Last 5 attempts (1=correct, 0=incorrect)
}

export type StrengthLevel = 0 | 1 | 2 | 3; // 0=new, 1=learning, 2=familiar, 3=mastered

// ============================================================================
// GAMIFICATION TYPES
// ============================================================================

/**
 * Experience points and leveling system
 */
export interface XPSystem {
  readonly totalXP: number;
  readonly currentLevel: number;
  readonly xpToNextLevel: number;
  readonly xpInCurrentLevel: number;
}

/**
 * XP reward configuration
 */
export interface XPRewards {
  readonly correctAnswer: number;
  readonly perfectRound: number; // No mistakes
  readonly speedBonus: number; // < 3 seconds
  readonly streakBonus: number; // Per consecutive correct
  readonly firstTimeCorrect: number;
  readonly mastery: number; // Item reaches level 3
  readonly comboMultiplier: number; // Multiplier after 5+ streak
}

/**
 * Streak tracking system
 */
export interface StreakData {
  readonly currentStreak: number; // Consecutive correct answers
  readonly longestStreak: number;
  readonly dailyStreak: number; // Consecutive days
  readonly longestDailyStreak: number;
  readonly lastPracticeDate: string; // ISO date
  readonly freezeAvailable: boolean;
}

/**
 * Achievement definition
 */
export interface Achievement {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly rarity: 'common' | 'rare' | 'epic' | 'legendary';
  readonly condition: (stats: UserProgress) => boolean;
  readonly reward: number; // XP reward
}

/**
 * Unlocked achievement instance
 */
export interface UnlockedAchievement {
  readonly achievementId: string;
  readonly unlockedAt: string; // ISO timestamp
  readonly seen: boolean; // Has user seen the unlock popup
}

/**
 * Lives/Hearts system
 */
export interface LivesSystem {
  readonly maxLives: number;
  readonly currentLives: number;
  readonly lastLossTimestamp: number;
  readonly regenerationRate: number; // Minutes per life
}

// ============================================================================
// QUIZ SESSION TYPES
// ============================================================================

/**
 * Question type enum for variety
 */
export enum QuestionType {
  TAP_WHAT_YOU_HEAR = 'tap_what_you_hear',
  WHICH_SOUND = 'which_sound',
  MATCH_PAIR = 'match_pair',
  FILL_MISSING = 'fill_missing',
  SPEED_ROUND = 'speed_round',
  STORY_MODE = 'story_mode',
}

/**
 * Base question interface - all question types extend this
 */
export interface BaseQuestion<T = any> {
  readonly id: string;
  readonly type: QuestionType;
  readonly targetItem: T;
  readonly difficulty: DifficultyLevel;
  readonly timeLimit?: number; // seconds
  readonly attempts: number;
  readonly startTime: number;
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

/**
 * Multiple choice question
 */
export interface MultipleChoiceQuestion<T> extends BaseQuestion<T> {
  readonly choices: readonly T[];
  readonly correctIndex: number;
}

/**
 * Answer result
 */
export interface AnswerResult {
  readonly isCorrect: boolean;
  readonly responseTime: number; // ms
  readonly attempts: number;
  readonly xpEarned: number;
  readonly feedbackMessage: string;
}

/**
 * Quiz session statistics
 */
export interface QuizSessionStats {
  readonly totalQuestions: number;
  readonly correctAnswers: number;
  readonly wrongAnswers: number;
  readonly accuracy: number; // percentage
  readonly averageResponseTime: number; // ms
  readonly timeSpent: number; // seconds
  readonly xpEarned: number;
  readonly perfectRound: boolean;
  readonly newAchievements: readonly string[]; // Achievement IDs
}

// ============================================================================
// USER PROGRESS TYPES
// ============================================================================

/**
 * Complete user progress data
 */
export interface UserProgress {
  // Learning data
  readonly memoryStates: Record<string, MemoryState>;

  // Gamification
  readonly xp: XPSystem;
  readonly streak: StreakData;
  readonly lives: LivesSystem;
  readonly achievements: readonly UnlockedAchievement[];

  // Statistics
  readonly totalSessions: number;
  readonly totalQuestionsAnswered: number;
  readonly totalCorrectAnswers: number;
  readonly globalAccuracy: number;
  readonly totalTimeSpent: number; // seconds
  readonly totalXPEarned: number;

  // History
  readonly sessionHistory: readonly QuizSessionRecord[];

  // Preferences
  readonly soundEnabled: boolean;
  readonly hapticEnabled: boolean;
  readonly difficulty: DifficultyLevel;
  readonly lastUpdated: string; // ISO timestamp
}

/**
 * Quiz session record for history
 */
export interface QuizSessionRecord {
  readonly id: string;
  readonly quizId: string;
  readonly date: string; // ISO timestamp
  readonly stats: QuizSessionStats;
  readonly itemsPracticed: readonly string[]; // Item IDs
}

// ============================================================================
// QUIZ CONFIGURATION TYPES
// ============================================================================

/**
 * Quiz configuration for different quiz modes
 */
export interface QuizConfig {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly totalQuestions: number;
  readonly questionTypes: readonly QuestionType[];
  readonly allowedDifficulties: readonly DifficultyLevel[];
  readonly timeLimit?: number; // seconds per question
  readonly passingScore: number; // percentage
  readonly xpMultiplier: number;
  readonly livesEnabled: boolean;
}

// ============================================================================
// FATHA-SPECIFIC TYPES
// ============================================================================

/**
 * Fatha letter item
 */
export interface FathaLetter {
  readonly letter: string;
  readonly letterWithFatha: string;
  readonly sound: string;
  readonly name: string;
  readonly englishName: string;
  readonly baseColor: string;
  readonly fathaColor: string;
  readonly category: 'vowels' | 'consonants';
  readonly examples: readonly string[];
}

/**
 * Fatha quiz specific question
 */
export interface FathaQuestion extends MultipleChoiceQuestion<FathaLetter> {
  readonly audioPath: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Result wrapper for operations that can fail
 */
export type Result<T, E = Error> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

/**
 * Storage keys for localStorage
 */
export enum StorageKey {
  USER_PROGRESS = 'fatha_quiz_progress',
  ACHIEVEMENTS = 'fatha_achievements',
  SETTINGS = 'fatha_settings',
}
