import * as React from 'react';
import { View, Text } from 'react-native';
import { ScoreState, getLetterGrade, calculateScorePercentage } from '../utils/scoring';
import { cn } from '../utils/utils';

interface ScoreDisplayProps {
  scoreState: ScoreState;
  isGameOver: boolean;
  totalNotes: number;
}

/**
 * Component to display the current score, combo, and hit statistics
 */
const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ 
  scoreState, 
  isGameOver,
  totalNotes
}) => {
  // Get combo color based on combo count
  const getComboColor = () => {
    if (scoreState.combo > 20) return "text-red-400";
    if (scoreState.combo > 15) return "text-orange-400";
    if (scoreState.combo > 10) return "text-yellow-400";
    if (scoreState.combo > 5) return "text-cyan-400";
    return "text-white";
  };

  // Calculate score percentage and letter grade for game over screen
  const scorePercentage = calculateScorePercentage(scoreState, totalNotes);
  const letterGrade = getLetterGrade(scorePercentage);

  return (
    <View className="absolute top-4 right-4 bg-neutral-900/80 p-3 rounded-lg z-10">
      <Text className="text-white text-lg font-bold">
        Score: {scoreState.totalScore}
      </Text>
      <Text className={cn(
        getComboColor(),
        "text-base font-semibold"
      )}>
        Combo: {scoreState.combo}
      </Text>
      
      {isGameOver && (
        <View className="mt-3 border-t border-neutral-700 pt-2">
          <Text className="text-white text-center font-bold text-xl mb-1">
            {letterGrade} ({scorePercentage}%)
          </Text>
          <Text className="text-white">Max Combo: {scoreState.maxCombo}</Text>
          <Text className="text-green-400">Perfect: {scoreState.perfects}</Text>
          <Text className="text-blue-400">Great: {scoreState.greats}</Text>
          <Text className="text-yellow-400">Good: {scoreState.goods}</Text>
          <Text className="text-red-400">Miss: {scoreState.misses}</Text>
        </View>
      )}
    </View>
  );
};

export default ScoreDisplay;
