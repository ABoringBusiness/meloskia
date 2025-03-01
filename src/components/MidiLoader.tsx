import * as React from 'react';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { addSongFromMidiUrl } from '../utils/songs';
import { cn } from '../utils/utils';

interface MidiLoaderProps {
  onSongAdded: () => void;
}

const MidiLoader: React.FC<MidiLoaderProps> = ({ onSongAdded }) => {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [generateDifficulties, setGenerateDifficulties] = useState(true);

  const handleLoadMidi = async () => {
    if (!url) {
      Alert.alert('Error', 'Please enter a MIDI file URL');
      return;
    }

    if (!name) {
      Alert.alert('Error', 'Please enter a name for the song');
      return;
    }

    setLoading(true);
    try {
      console.log(`Loading MIDI file from URL: ${url}`);
      
      // Check if the URL is valid
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        throw new Error('URL must start with http:// or https://');
      }
      
      // Try to load the MIDI file with difficulty levels
      await addSongFromMidiUrl(url, name, generateDifficulties);
      
      // Clear the form and notify the user
      setUrl('');
      setName('');
      onSongAdded();
      Alert.alert('Success', 'MIDI file loaded successfully');
    } catch (error) {
      console.error('Error loading MIDI file:', error);
      
      // Provide more detailed error messages based on the error type
      let errorMessage = error.message || 'Unknown error';
      
      if (errorMessage.includes('CORS')) {
        errorMessage = 'CORS error: The MIDI file server does not allow cross-origin requests. Try a different MIDI file URL.';
      } else if (errorMessage.includes('Network Error')) {
        errorMessage = 'Network error: Could not connect to the MIDI file server. Check your internet connection and try again.';
      } else if (errorMessage.includes('404')) {
        errorMessage = 'File not found: The MIDI file could not be found at the specified URL.';
      }
      
      Alert.alert('Error', `Failed to load MIDI file: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="w-full p-4 bg-neutral-900 rounded-lg">
      <Text className="text-lg font-bold text-white mb-2">Load MIDI File</Text>
      
      <Text className="text-sm text-neutral-400 mb-1">Song Name</Text>
      <TextInput
        className="w-full bg-neutral-800 text-white p-2 rounded-md mb-2"
        value={name}
        onChangeText={setName}
        placeholder="Enter song name"
        placeholderTextColor="#666"
      />
      
      <Text className="text-sm text-neutral-400 mb-1">MIDI File URL</Text>
      <TextInput
        className="w-full bg-neutral-800 text-white p-2 rounded-md mb-2"
        value={url}
        onChangeText={setUrl}
        placeholder="Enter MIDI file URL"
        placeholderTextColor="#666"
      />
      
      <View className="flex-row items-center mb-4">
        <TouchableOpacity
          onPress={() => setGenerateDifficulties(!generateDifficulties)}
          className="mr-2"
        >
          <View className={cn(
            "w-5 h-5 border rounded",
            generateDifficulties ? "bg-cyan-600 border-cyan-600" : "bg-neutral-800 border-neutral-600"
          )}>
            {generateDifficulties && (
              <Text className="text-white text-center">✓</Text>
            )}
          </View>
        </TouchableOpacity>
        <Text className="text-neutral-400">Generate difficulty levels</Text>
      </View>
      
      <TouchableOpacity
        className={cn(
          "w-full py-3 rounded-md flex items-center justify-center",
          loading ? "bg-neutral-700" : "bg-cyan-600"
        )}
        onPress={handleLoadMidi}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold">Load MIDI</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default MidiLoader;
