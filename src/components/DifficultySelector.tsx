import * as React from 'react';
import { View, Text, Pressable } from 'react-native';
import { DifficultyLevel } from '../utils/difficulty';

interface DifficultySelectorProps {
  currentDifficulty: DifficultyLevel;
  onSelectDifficulty: (difficulty: DifficultyLevel) => void;
  availableDifficulties: DifficultyLevel[];
}

/**
 * Component to select difficulty level for a song
 */
const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  currentDifficulty,
  onSelectDifficulty,
  availableDifficulties,
}) => {
  return (
    <View style={{ 
      flexDirection: 'row', 
      justifyContent: 'center',
      marginVertical: 10,
      gap: 8
    }}>
      {availableDifficulties.map((difficulty) => (
        <Pressable
          key={difficulty}
          style={{ 
            backgroundColor: currentDifficulty === difficulty ? '#3b82f6' : '#1f2937',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: currentDifficulty === difficulty ? '#60a5fa' : '#374151',
          }}
          onPress={() => onSelectDifficulty(difficulty)}
        >
          <Text style={{ 
            color: 'white',
            fontWeight: currentDifficulty === difficulty ? 'bold' : 'normal',
            textTransform: 'capitalize',
          }}>
            {difficulty}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

export default DifficultySelector;
