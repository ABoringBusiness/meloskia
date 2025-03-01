import { songs, SongData, addSongFromMidiUrl } from '../utils/songs';
// Import the component directly to avoid circular dependencies
// This will be properly resolved when the component is used in the styley-mobile-AI app
const MeloskiaGameComponent = require('./MeloskiaGameComponent').default;

// Export the necessary functions, types, and components for integration with styley-mobile-AI
export {
  songs,
  SongData,
  addSongFromMidiUrl,
  MeloskiaGameComponent,
};

// Function to get all available songs
export const getAllSongs = (): SongData[] => {
  return [...songs];
};

// Function to get a song by index
export const getSongByIndex = (index: number): SongData | null => {
  if (index >= 0 && index < songs.length) {
    return songs[index];
  }
  return null;
};

// Function to get a song by name
export const getSongByName = (name: string): SongData | null => {
  const song = songs.find(s => s.name === name);
  return song || null;
};

// Function to load a MIDI file from a URL and add it to the songs list
export const loadMidiFromUrl = async (url: string, name: string): Promise<SongData | null> => {
  try {
    const song = await addSongFromMidiUrl(url, name);
    if (Array.isArray(song)) {
      // If it returns an array (which it shouldn't), return the first song
      return song.length > 0 ? song[0] : null;
    }
    return song;
  } catch (error) {
    console.error('Error loading MIDI from URL:', error);
    return null;
  }
};
