/**
 * Difficulty level utilities for Meloskia
 * Handles generating different difficulty levels from a base song
 */
import { SongData } from './songs';

// Define Note type since it's not exported from songs.ts
type Note = { noteName: string, startAtBar: number, durationInBars: number };

/**
 * Difficulty level options
 */
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

/**
 * Generate a song with a specific difficulty level
 * @param song Original song data
 * @param level Difficulty level to generate
 * @returns Modified song data with appropriate difficulty
 */
export const generateDifficultySong = (
  song: SongData,
  level: DifficultyLevel
): SongData => {
  // Create a copy of the song to modify
  const newSong: SongData = {
    ...song,
    name: `${song.name} (${level.charAt(0).toUpperCase() + level.slice(1)})`,
    difficulty: level,
    notes: [...song.notes], // Clone notes array
  };
  
  // Apply difficulty-specific modifications
  switch (level) {
    case 'easy':
      return generateEasyVersion(newSong);
    case 'medium':
      return song; // Medium is the base difficulty
    case 'hard':
      return generateHardVersion(newSong);
    default:
      return song;
  }
};

/**
 * Generate an easy version of the song
 * - Reduces note density
 * - Removes complex chords
 * - Slows down tempo slightly
 */
const generateEasyVersion = (song: SongData): SongData => {
  // Reduce tempo slightly for easier play
  const easySong = {
    ...song,
    bpm: Math.max(60, Math.floor(song.bpm * 0.9)), // Reduce tempo by 10%, but not below 60 BPM
  };
  
  // Filter notes to reduce density
  const filteredNotes: Note[] = [];
  const chordMap = new Map<number, Note[]>();
  
  // Group notes by start time to identify chords
  song.notes.forEach(note => {
    const startTime = Math.floor(note.startAtBar * 100); // Quantize to handle floating point
    if (!chordMap.has(startTime)) {
      chordMap.set(startTime, []);
    }
    chordMap.get(startTime)?.push(note);
  });
  
  // For each chord, keep only the most important notes
  chordMap.forEach((chord, _) => {
    if (chord.length <= 2) {
      // Keep all notes for simple chords (1-2 notes)
      filteredNotes.push(...chord);
    } else {
      // For complex chords, keep only the highest and lowest notes
      chord.sort((a, b) => {
        // Sort by note name (C, C#, D, etc.)
        const noteA = a.noteName.replace(/[0-9]/g, '');
        const noteB = b.noteName.replace(/[0-9]/g, '');
        return noteA.localeCompare(noteB);
      });
      
      // Keep the lowest and highest notes
      filteredNotes.push(chord[0]); // Lowest
      filteredNotes.push(chord[chord.length - 1]); // Highest
    }
  });
  
  easySong.notes = filteredNotes;
  return easySong;
};

/**
 * Generate a hard version of the song
 * - Adds additional notes
 * - Creates more complex patterns
 */
const generateHardVersion = (song: SongData): SongData => {
  // Create a copy of the song
  const hardSong = { ...song };
  const newNotes: Note[] = [...song.notes];
  
  // Add additional notes to create more complex patterns
  song.notes.forEach((note, index) => {
    // Skip the last note to avoid out-of-bounds
    if (index === song.notes.length - 1) return;
    
    const currentNote = note;
    const nextNote = song.notes[index + 1];
    
    // If there's enough space between notes, add a note in between
    if (nextNote.startAtBar - currentNote.startAtBar > 0.25) {
      // Calculate position between notes
      const midPoint = (currentNote.startAtBar + nextNote.startAtBar) / 2;
      
      // Create a new note
      const newNote: Note = {
        noteName: currentNote.noteName, // Use same note for simplicity
        startAtBar: midPoint,
        durationInBars: 0.125, // Short duration
      };
      
      newNotes.push(newNote);
    }
  });
  
  // Sort notes by start time
  hardSong.notes = newNotes.sort((a, b) => a.startAtBar - b.startAtBar);
  
  return hardSong;
};

/**
 * Generate an expert version of the song
 * - Increases tempo
 * - Adds more complex patterns
 * - Creates challenging sequences
 */
const generateExpertVersion = (song: SongData): SongData => {
  // Start with the hard version and make it even more challenging
  const hardVersion = generateHardVersion(song);
  
  // Increase tempo for expert mode
  const expertSong = {
    ...hardVersion,
    bpm: Math.floor(song.bpm * 1.1), // Increase tempo by 10%
  };
  
  // Add chord variations
  const newNotes: Note[] = [...expertSong.notes];
  
  // For every 4th note, add a chord
  for (let i = 0; i < expertSong.notes.length; i += 4) {
    const note = expertSong.notes[i];
    
    // Create a chord by adding a third and fifth
    const noteBase = note.noteName.replace(/[0-9]/g, '');
    const octave = note.noteName.match(/[0-9]/)?.[0] || '4';
    
    // Simple mapping for thirds and fifths (not musically accurate for all keys but works for demo)
    const thirdMap: Record<string, string> = {
      'C': 'E', 'C#': 'F', 'D': 'F#', 'D#': 'G', 'E': 'G#', 
      'F': 'A', 'F#': 'A#', 'G': 'B', 'G#': 'C', 'A': 'C#', 
      'A#': 'D', 'B': 'D#'
    };
    
    const fifthMap: Record<string, string> = {
      'C': 'G', 'C#': 'G#', 'D': 'A', 'D#': 'A#', 'E': 'B', 
      'F': 'C', 'F#': 'C#', 'G': 'D', 'G#': 'D#', 'A': 'E', 
      'A#': 'F', 'B': 'F#'
    };
    
    // Add third
    if (thirdMap[noteBase]) {
      newNotes.push({
        noteName: `${thirdMap[noteBase]}${octave}`,
        startAtBar: note.startAtBar,
        durationInBars: note.durationInBars,
      });
    }
    
    // Add fifth
    if (fifthMap[noteBase]) {
      newNotes.push({
        noteName: `${fifthMap[noteBase]}${octave}`,
        startAtBar: note.startAtBar,
        durationInBars: note.durationInBars,
      });
    }
  }
  
  // Sort notes by start time
  expertSong.notes = newNotes.sort((a, b) => a.startAtBar - b.startAtBar);
  
  return expertSong;
};

/**
 * Generate all difficulty levels for a song
 * @param song Original song data
 * @returns Object with all difficulty levels
 */
export const generateAllDifficulties = (
  song: SongData
): Record<DifficultyLevel, SongData> => {
  return {
    easy: generateDifficultySong(song, 'easy'),
    medium: song, // Original song is medium difficulty
    hard: generateDifficultySong(song, 'hard'),
  };
};
