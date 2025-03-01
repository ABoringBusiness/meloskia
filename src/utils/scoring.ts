/**
 * Scoring system for Meloskia
 * Handles score calculation, combo tracking, and overall score state
 */

/**
 * Calculate score based on timing accuracy
 * @param noteTime The time the note should be hit
 * @param hitTime The time the note was actually hit
 * @param maxScore The maximum score for a perfect hit
 * @returns The score for the note hit
 */
export const calculateNoteScore = (
  accuracy: number,
  maxScore: number = 100
): HitType => {
  // Perfect: within 0.05 bars, Great: within 0.1 bars, Good: within 0.2 bars, Miss: beyond 0.2 bars
  if (accuracy < 0.05) return 'perfect'; // Perfect
  if (accuracy < 0.1) return 'great'; // Great
  if (accuracy < 0.2) return 'good'; // Good
  return 'miss'; // Miss
};

/**
 * Get score value for a hit type
 */
export const getScoreForHitType = (hitType: HitType, maxScore: number = 100): number => {
  switch (hitType) {
    case 'perfect': return maxScore;
    case 'great': return Math.floor(maxScore * 0.8);
    case 'good': return Math.floor(maxScore * 0.5);
    case 'miss': return 0;
    default: return 0;
  }
};

/**
 * Hit type for visual feedback
 */
export type HitType = 'perfect' | 'great' | 'good' | 'miss' | null;

/**
 * Score state interface
 */
export interface ScoreState {
  currentScore: number;
  totalScore: number;
  combo: number;
  maxCombo: number;
  perfects: number;
  greats: number;
  goods: number;
  misses: number;
}

/**
 * Initial score state
 */
export const initialScoreState: ScoreState = {
  currentScore: 0,
  totalScore: 0,
  combo: 0,
  maxCombo: 0,
  perfects: 0,
  greats: 0,
  goods: 0,
  misses: 0,
};

/**
 * Update score state based on note hit
 * @param scoreState Current score state
 * @param noteScore Score for the current note hit
 * @param hitType Type of hit (perfect, great, good, miss)
 * @returns Updated score state
 */
export const updateScore = (
  scoreState: ScoreState,
  hitType: HitType
): ScoreState => {
  const newState = { ...scoreState };
  
  if (hitType === 'miss' || hitType === null) {
    // Miss
    newState.combo = 0;
    if (hitType === 'miss') newState.misses += 1;
  } else {
    // Hit
    newState.combo += 1;
    newState.maxCombo = Math.max(newState.maxCombo, newState.combo);
    
    // Get score for hit type
    const score = getScoreForHitType(hitType);
    newState.totalScore += score;
    
    // Update hit statistics
    if (hitType === 'perfect') newState.perfects += 1;
    else if (hitType === 'great') newState.greats += 1;
    else if (hitType === 'good') newState.goods += 1;
  }
  
  return newState;
};

/**
 * Calculate final score percentage
 * @param scoreState Current score state
 * @param totalNotes Total number of notes in the song
 * @param maxScorePerNote Maximum score per note
 * @returns Score percentage (0-100)
 */
export const calculateScorePercentage = (
  scoreState: ScoreState,
  totalNotes: number,
  maxScorePerNote: number = 100
): number => {
  const maxPossibleScore = totalNotes * maxScorePerNote;
  if (maxPossibleScore === 0) return 0;
  
  return Math.round((scoreState.totalScore / maxPossibleScore) * 100);
};

/**
 * Get letter grade based on score percentage
 * @param percentage Score percentage (0-100)
 * @returns Letter grade (S, A, B, C, D, F)
 */
export const getLetterGrade = (percentage: number): string => {
  if (percentage >= 95) return 'S';
  if (percentage >= 85) return 'A';
  if (percentage >= 75) return 'B';
  if (percentage >= 65) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
};
