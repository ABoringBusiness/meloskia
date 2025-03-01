import { loadMidiFromUrl } from './midiUtils';

export interface SongData {
  name: string,
  bpm: number,
  durationInBars?: number,
  notes: { noteName: string, startAtBar: number, durationInBars: number }[],
  difficulty?: 'easy' | 'medium' | 'hard',
}

/**
 * Generate a song with a specific difficulty level
 * @param song Original song data
 * @param difficulty Difficulty level to generate
 * @returns New song data with the specified difficulty
 */
export const generateDifficultyLevel = (
  song: SongData, 
  difficulty: 'easy' | 'medium' | 'hard'
): SongData => {
  // Create a copy of the song
  const newSong: SongData = {
    ...song,
    name: `${song.name} (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})`,
    difficulty,
  };
  
  // Modify notes based on difficulty
  if (difficulty === 'easy') {
    // For easy, remove some notes to make it simpler
    // Keep only every other note, and make durations slightly longer
    newSong.notes = song.notes
      .filter((_, index) => index % 2 === 0)
      .map(note => ({
        ...note,
        durationInBars: Math.min(note.durationInBars * 1.2, note.durationInBars + 0.25),
      }));
  } else if (difficulty === 'medium') {
    // Medium is the default, just copy the notes
    newSong.notes = [...song.notes];
  } else if (difficulty === 'hard') {
    // For hard, add more notes or make existing notes shorter
    newSong.notes = song.notes.map(note => ({
      ...note,
      durationInBars: Math.max(note.durationInBars * 0.8, 0.25), // Make notes shorter but not too short
    }));
    
    // Add some additional notes
    const additionalNotes = song.notes
      .filter(note => note.durationInBars > 0.5)
      .map(note => ({
        noteName: note.noteName,
        startAtBar: note.startAtBar + note.durationInBars / 2,
        durationInBars: Math.max(note.durationInBars / 4, 0.25),
      }));
    
    newSong.notes = [...newSong.notes, ...additionalNotes].sort((a, b) => a.startAtBar - b.startAtBar);
  }
  
  return newSong;
};

/**
 * Generate all difficulty levels for a song
 * @param song Original song data
 * @returns Array of songs with different difficulty levels
 */
export const generateAllDifficultyLevels = (song: SongData): SongData[] => {
  return [
    { ...song, name: `${song.name} (Medium)`, difficulty: 'medium' },
    generateDifficultyLevel(song, 'easy'),
    generateDifficultyLevel(song, 'hard'),
  ];
};

export const songs: SongData[] = [
  {
    name: 'All-notes Demo',
    bpm: 160,
    // durationInBars: 17,
    notes: [
      { noteName: 'C3', startAtBar: 0, durationInBars: 1 },
      { noteName: 'D3', startAtBar: 1, durationInBars: 1 },
      { noteName: 'E3', startAtBar: 2, durationInBars: 1 },
      { noteName: 'F3', startAtBar: 3, durationInBars: 1 },
      { noteName: 'G3', startAtBar: 4, durationInBars: 1 },
      { noteName: 'A3', startAtBar: 5, durationInBars: 1 },
      { noteName: 'B3', startAtBar: 6, durationInBars: 1 },
      { noteName: 'C4', startAtBar: 7, durationInBars: 1 },
      { noteName: 'D4', startAtBar: 8, durationInBars: 1 },
      { noteName: 'E4', startAtBar: 9, durationInBars: 1 },
      { noteName: 'D#4', startAtBar: 10, durationInBars: 1 },
      { noteName: 'C#4', startAtBar: 11, durationInBars: 1 },
      { noteName: 'A#3', startAtBar: 12, durationInBars: 1 },
      { noteName: 'G#3', startAtBar: 13, durationInBars: 1 },
      { noteName: 'F#3', startAtBar: 14, durationInBars: 1 },
      { noteName: 'D#3', startAtBar: 15, durationInBars: 1 },
      { noteName: 'C#3', startAtBar: 16, durationInBars: 1 },
    ],
  },
  {
    name: 'All-notes Demo (reversed)',
    bpm: 160,
    // durationInBars: 17,
    notes: [
      { noteName: 'C#3', startAtBar: 0, durationInBars: 1 },
      { noteName: 'D#3', startAtBar: 1, durationInBars: 1 },
      { noteName: 'F#3', startAtBar: 2, durationInBars: 1 },
      { noteName: 'G#3', startAtBar: 3, durationInBars: 1 },
      { noteName: 'A#3', startAtBar: 4, durationInBars: 1 },
      { noteName: 'C#4', startAtBar: 5, durationInBars: 1 },
      { noteName: 'D#4', startAtBar: 6, durationInBars: 1 },
      { noteName: 'E4', startAtBar: 7, durationInBars: 1 },
      { noteName: 'D4', startAtBar: 8, durationInBars: 1 },
      { noteName: 'C4', startAtBar: 9, durationInBars: 1 },
      { noteName: 'B3', startAtBar: 10, durationInBars: 1 },
      { noteName: 'A3', startAtBar: 11, durationInBars: 1 },
      { noteName: 'G3', startAtBar: 12, durationInBars: 1 },
      { noteName: 'F3', startAtBar: 13, durationInBars: 1 },
      { noteName: 'E3', startAtBar: 14, durationInBars: 1 },
      { noteName: 'D3', startAtBar: 15, durationInBars: 1 },
      { noteName: 'C3', startAtBar: 16, durationInBars: 1 },
    ],
  },
  {
    name: 'E-Z Song',
    bpm: 60,
    durationInBars: 34,
    notes: [
      { noteName: 'C3', startAtBar: 0, durationInBars: 1 },
      { noteName: 'C3', startAtBar: 1.5, durationInBars: 1 },
      { noteName: 'D3', startAtBar: 3, durationInBars: 1 },
      { noteName: 'D3', startAtBar: 4.5, durationInBars: 1 },
      { noteName: 'E3', startAtBar: 6, durationInBars: 1 },
      { noteName: 'E3', startAtBar: 7.5, durationInBars: 1 },
      { noteName: 'F3', startAtBar: 9, durationInBars: 1 },
      { noteName: 'F3', startAtBar: 10.5, durationInBars: 1 },
      { noteName: 'G3', startAtBar: 12, durationInBars: 1 },
      { noteName: 'G3', startAtBar: 13.5, durationInBars: 1 },
      { noteName: 'A3', startAtBar: 15, durationInBars: 1 },
      { noteName: 'A3', startAtBar: 16.5, durationInBars: 1 },
      { noteName: 'B3', startAtBar: 18, durationInBars: 1 },
      { noteName: 'B3', startAtBar: 19.5, durationInBars: 1 },
      { noteName: 'C4', startAtBar: 21, durationInBars: 1 },
      { noteName: 'C4', startAtBar: 22.5, durationInBars: 1 },
      { noteName: 'D4', startAtBar: 24, durationInBars: 1 },
      { noteName: 'D4', startAtBar: 25.5, durationInBars: 1 },
      { noteName: 'E4', startAtBar: 27, durationInBars: 1 },
      { noteName: 'E4', startAtBar: 28.5, durationInBars: 1 },
    ],
  },
  {
    name: 'The Final Tech Stack',
    bpm: 120,
    // durationInBars: 30,
    notes: [
      { noteName: 'C#4', startAtBar: 0, durationInBars: 0.25 }, // 1
      { noteName: 'B3', startAtBar: 0.25, durationInBars: 0.25 }, // 1
      { noteName: 'C#4', startAtBar: 0.5, durationInBars: 1 }, // 2
      { noteName: 'F#3', startAtBar: 1.5, durationInBars: 1.5 }, // 4

      // GAP * 2

      { noteName: 'D4', startAtBar: 4, durationInBars: 0.25 }, // 1
      { noteName: 'C#4', startAtBar: 4.25, durationInBars: 0.25 }, // 1
      { noteName: 'D4', startAtBar: 4.5, durationInBars: 0.25 }, // 1
      // GAP
      { noteName: 'C#4', startAtBar: 5, durationInBars: 0.25 }, // 1
      // GAP
      { noteName: 'B3', startAtBar: 5.5, durationInBars: 1.25 }, // 4

      // GAP * 2

      { noteName: 'D4', startAtBar: 8, durationInBars: 0.25 }, // 1
      { noteName: 'C#4', startAtBar: 8.25, durationInBars: 0.25 }, // 1
      { noteName: 'D4', startAtBar: 8.5, durationInBars: 1 }, // 2
      { noteName: 'F#3', startAtBar: 9.5, durationInBars: 1.5 }, // 4

      // GAP * 2

      { noteName: 'B3', startAtBar: 12, durationInBars: 0.25 }, // 1
      { noteName: 'A3', startAtBar: 12.25, durationInBars: 0.25 }, // 1
      { noteName: 'B3', startAtBar: 12.5, durationInBars: 0.25 }, // 1
      // GAP
      { noteName: 'A3', startAtBar: 13, durationInBars: 0.25 }, // 1
      // GAP
      { noteName: 'G#3', startAtBar: 13.5, durationInBars: 0.25 }, // 1
      // GAP
      { noteName: 'B3', startAtBar: 14, durationInBars: 0.25 }, // 1
      // GAP
      { noteName: 'A3', startAtBar: 14.5, durationInBars: 1.25 }, // 4

      // TODO: intro x2 !

      { noteName: 'G#3', startAtBar: 16, durationInBars: 0.25 }, // 1
      { noteName: 'A3', startAtBar: 16.25, durationInBars: 0.25 }, // 1
      { noteName: 'B3', startAtBar: 16.5, durationInBars: 1.25 }, // 4
      // GAP
      { noteName: 'A3', startAtBar: 18, durationInBars: 0.25 }, // 1
      { noteName: 'B3', startAtBar: 18.25, durationInBars: 0.25 }, // 1
      { noteName: 'C#4', startAtBar: 18.5, durationInBars: 0.5 }, // 1.5
      { noteName: 'B3', startAtBar: 19, durationInBars: 0.5 }, // 1.5
      { noteName: 'A3', startAtBar: 19.5, durationInBars: 0.5 }, // 1.5
      { noteName: 'G#3', startAtBar: 20, durationInBars: 0.5 }, // 1 / 1.5?
      { noteName: 'F#3', startAtBar: 20.5, durationInBars: 1 }, // 2
      { noteName: 'D4', startAtBar: 21.5, durationInBars: 1 }, // 2
      { noteName: 'C#4', startAtBar: 22.5, durationInBars: 2 }, // 4
      // GAP
      { noteName: 'C#4', startAtBar: 24.75, durationInBars: 0.5 }, // 1
      { noteName: 'D4', startAtBar: 25.25, durationInBars: 0.5 }, // 1
      { noteName: 'C#4', startAtBar: 25.75, durationInBars: 0.5 }, // 1
      { noteName: 'B3', startAtBar: 26.25, durationInBars: 0.5 }, // 1
      { noteName: 'C#4', startAtBar: 26.75, durationInBars: 3 }, // 4

    ],
  },
];

// Function to add a new song from a MIDI URL
export const addSongFromMidiUrl = async (
  url: string, 
  name: string,
  generateDifficulties: boolean = true
): Promise<SongData[]> => {
  try {
    console.log('Loading MIDI from URL:', url);
    const songData = await loadMidiFromUrl(url, name);
    console.log('MIDI loaded successfully:', songData);
    
    if (generateDifficulties) {
      // Generate all difficulty levels
      const allDifficulties = generateAllDifficultyLevels(songData);
      songs.push(...allDifficulties);
      return allDifficulties;
    } else {
      // Just add the original song
      songs.push(songData);
      return [songData];
    }
  } catch (error) {
    console.error('Error adding song from MIDI URL:', error);
    throw new Error(`Failed to add song from MIDI URL: ${error.message || 'Unknown error'}`);
  }
};
