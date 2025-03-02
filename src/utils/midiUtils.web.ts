import axios from 'axios';
import { SongData } from './songs';

// MidiParser is a global variable provided by midi-parser-js
declare const MidiParser: any;

// Function to fetch a MIDI file from a URL
export const fetchMidiFile = async (url: string): Promise<ArrayBuffer> => {
  try {
    console.log('Fetching MIDI file from URL:', url);
    
    // List of CORS proxies to try in order
    const corsProxies = [
      '', // Direct fetch (no proxy)
      'https://api.allorigins.win/raw?url=',
      'https://corsproxy.io/?',
      'https://proxy.cors.sh/',
    ];
    
    // Try each proxy in order until one works
    let lastError = null;
    for (const proxy of corsProxies) {
      try {
        const proxyUrl = proxy ? proxy + encodeURIComponent(url) : url;
        console.log(`Trying with proxy: ${proxy || 'Direct fetch'}`);
        
        const response = await axios.get(proxyUrl, {
          responseType: 'arraybuffer',
          headers: proxy ? { 'Origin': window.location.origin } : {},
          timeout: 10000, // 10 second timeout
        });
        
        console.log(`Successfully fetched MIDI file with ${proxy || 'direct fetch'}`);
        return response.data;
      } catch (error) {
        console.warn(`Failed with ${proxy || 'direct fetch'}:`, error);
        lastError = error;
      }
    }
    
    // If all proxies fail, throw the last error
    throw lastError || new Error('Failed to fetch MIDI file with all available proxies');
  } catch (error) {
    console.error('Error fetching MIDI file:', error);
    throw new Error(`Failed to fetch MIDI file: ${error.message || 'Unknown error'}`);
  }
};

// Check if MidiParser is available
const isMidiParserAvailable = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof (window as any).MidiParser !== 'undefined';
};

// Function to ensure MidiParser is loaded
const ensureMidiParserLoaded = (): void => {
  if (!isMidiParserAvailable()) {
    throw new Error('MidiParser library is not loaded. Please refresh the page and try again.');
  }
};

// Function to parse a MIDI file and convert it to SongData format
export const parseMidiToSongData = (midiData: ArrayBuffer, name: string): SongData => {
  // Ensure MidiParser is loaded
  ensureMidiParserLoaded();
  
  // Get the MidiParser from the window object
  const MidiParser = (window as any).MidiParser;
  
  // Parse the MIDI data
  const midiFile = MidiParser.parse(new Uint8Array(midiData));
  
  // Extract BPM from the MIDI file (default to 120 if not found)
  const bpm = extractBpmFromMidi(midiFile) || 120;
  
  // Convert MIDI notes to SongData notes format
  const notes = convertMidiNotesToSongDataNotes(midiFile);
  
  return {
    name,
    bpm,
    notes,
  };
};

// Helper function to extract BPM from MIDI file
const extractBpmFromMidi = (midiFile: any): number | null => {
  // MIDI tempo is in microseconds per quarter note
  // BPM = 60,000,000 / tempo
  
  // Look for tempo events in the MIDI file
  for (const track of midiFile.track) {
    for (const event of track) {
      if (event.type === 'meta' && event.metaType === 0x51) { // Tempo event
        const tempo = (event.data[0] << 16) | (event.data[1] << 8) | event.data[2];
        return Math.round(60000000 / tempo);
      }
    }
  }
  
  return null;
};

// Helper function to convert MIDI notes to SongData notes format
const convertMidiNotesToSongDataNotes = (midiFile: any): { noteName: string, startAtBar: number, durationInBars: number }[] => {
  const notes: { noteName: string, startAtBar: number, durationInBars: number }[] = [];
  const ticksPerBeat = midiFile.timeDivision;
  
  // Process each track
  for (const track of midiFile.track) {
    let currentTick = 0;
    const noteStartTicks = {}; // To keep track of when notes start
    
    // Process each event in the track
    for (const event of track) {
      currentTick += event.deltaTime;
      
      // Note on event
      if (event.type === 'channel' && event.subtype === 0x9 && event.data[1] > 0) {
        const noteNumber = event.data[0];
        noteStartTicks[noteNumber] = currentTick;
      }
      
      // Note off event or note on with velocity 0
      if ((event.type === 'channel' && event.subtype === 0x8) || 
          (event.type === 'channel' && event.subtype === 0x9 && event.data[1] === 0)) {
        const noteNumber = event.data[0];
        
        if (noteStartTicks[noteNumber] !== undefined) {
          const startTick = noteStartTicks[noteNumber];
          const durationTicks = currentTick - startTick;
          
          // Convert ticks to bars (4 beats per bar)
          const startAtBar = startTick / (ticksPerBeat * 4);
          const durationInBars = durationTicks / (ticksPerBeat * 4);
          
          // Convert MIDI note number to note name (e.g., 60 -> C4)
          const noteName = midiNoteNumberToName(noteNumber);
          
          notes.push({
            noteName,
            startAtBar,
            durationInBars,
          });
          
          // Clear the note start time
          delete noteStartTicks[noteNumber];
        }
      }
    }
  }
  
  return notes;
};

// Helper function to convert MIDI note number to note name
const midiNoteNumberToName = (noteNumber: number): string => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(noteNumber / 12) - 1;
  const noteName = noteNames[noteNumber % 12];
  return `${noteName}${octave}`;
};

// Function to load a MIDI file from a URL and convert it to SongData
export const loadMidiFromUrl = async (url: string, name: string): Promise<SongData> => {
  try {
    // Validate URL
    if (!url.match(/^https?:\/\/.+/i)) {
      throw new Error('Invalid URL. Please enter a valid URL starting with http:// or https://');
    }
    
    console.log('Loading MIDI from URL:', url);
    
    // Fetch the MIDI file
    const midiData = await fetchMidiFile(url);
    console.log('MIDI data fetched, parsing...');
    
    // Parse the MIDI data
    try {
      const songData = parseMidiToSongData(midiData, name);
      console.log('MIDI parsed successfully:', songData);
      return songData;
    } catch (parseError) {
      console.error('Error parsing MIDI file:', parseError);
      throw new Error(`Failed to parse MIDI file: ${parseError.message}. Please ensure this is a valid MIDI file.`);
    }
  } catch (error) {
    console.error('Error loading MIDI file:', error);
    throw new Error(`Failed to load MIDI file: ${error.message || 'Unknown error'}`);
  }
};
