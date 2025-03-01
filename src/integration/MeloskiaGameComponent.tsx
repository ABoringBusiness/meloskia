import * as React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { SongData } from '../utils/songs';
import PlayingUI from '../components/PlayingUI';

interface MeloskiaGameComponentProps {
  songData?: SongData;
  songId?: number;
  onClose?: () => void;
  onGameComplete?: (score: number, maxCombo: number) => void;
}

/**
 * Standalone component for embedding Meloskia in other applications
 * Can be used in the styley-mobile-AI application
 */
const MeloskiaGameComponent: React.FC<MeloskiaGameComponentProps> = ({
  songData,
  songId,
  onClose,
  onGameComplete,
}) => {
  // State to track if we're showing the song selection screen
  const [showSongSelection, setShowSongSelection] = React.useState<boolean>(!songData && !songId);
  
  // Import songs dynamically to avoid circular dependencies
  const { songs, getSongByIndex } = require('../utils/songs');
  
  // Get song data if songId is provided
  const [currentSongData, setCurrentSongData] = React.useState<SongData | undefined>(songData);
  
  React.useEffect(() => {
    if (songId !== undefined && !songData) {
      const song = getSongByIndex(songId);
      if (song) {
        setCurrentSongData(song);
        setShowSongSelection(false);
      }
    } else if (songData) {
      setCurrentSongData(songData);
      setShowSongSelection(false);
    }
  }, [songId, songData]);
  
  // Render song selection screen
  const renderSongSelection = () => (
    <View style={{ flex: 1, backgroundColor: '#000', padding: 20 }}>
      <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
        Select a Song
      </Text>
      
      {songs.map((song: SongData, index: number) => (
        <Pressable
          key={index}
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#1f2937' : '#111827',
            padding: 15,
            borderRadius: 8,
            marginBottom: 10,
          })}
          onPress={() => {
            setCurrentSongData(song);
            setShowSongSelection(false);
          }}
        >
          <Text style={{ color: 'white', fontSize: 16 }}>{song.name}</Text>
          <Text style={{ color: '#9ca3af', fontSize: 12 }}>BPM: {song.bpm}</Text>
        </Pressable>
      ))}
      
      {onClose && (
        <Pressable
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#6b7280' : '#4b5563',
            padding: 15,
            borderRadius: 8,
            marginTop: 20,
          })}
          onPress={onClose}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>Close</Text>
        </Pressable>
      )}
    </View>
  );
  
  // Handle game completion
  const handleGameComplete = (score: number, maxCombo: number) => {
    if (onGameComplete) {
      onGameComplete(score, maxCombo);
    }
  };
  
  // Custom back button that calls onClose if provided
  const CustomBackButton = () => (
    <Pressable
      style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}
      onPress={() => {
        if (onClose) {
          onClose();
        } else {
          setShowSongSelection(true);
        }
      }}
    >
      <Text style={{ color: '#9ca3af', fontSize: 16 }}>&lt; Back</Text>
    </Pressable>
  );
  
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {showSongSelection ? (
        renderSongSelection()
      ) : currentSongData ? (
        <>
          <CustomBackButton />
          <PlayingUI songData={currentSongData} />
        </>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'white' }}>Loading...</Text>
        </View>
      )}
    </View>
  );
};

export default MeloskiaGameComponent;
