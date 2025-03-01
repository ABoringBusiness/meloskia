import { songs, SongData, addSongFromMidiUrl } from '../utils/songs';

// Export the necessary functions and types for integration with styley-mobile-AI
export {
  songs,
  SongData,
  addSongFromMidiUrl,
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
