import { Midi } from '@tonejs/midi';
import axios from 'axios';
import { SongData } from './songs';

// Function to fetch a MIDI file from a URL
export const fetchMidiFile = async (url: string): Promise<ArrayBuffer> => {
  try {
    console.log('Fetching MIDI file from URL:', url);
    
    // Try to use a CORS proxy if direct fetch fails
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
      });
      console.log('Successfully fetched MIDI file directly');
      return response.data;
    } catch (directError) {
      console.warn('Direct fetch failed, trying with CORS proxy:', directError);
      
      // Try with CORS proxy
      const corsProxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const proxyUrl = corsProxyUrl + url;
      
      const proxyResponse = await axios.get(proxyUrl, {
        responseType: 'arraybuffer',
      });
      
      console.log('Successfully fetched MIDI file with CORS proxy');
      return proxyResponse.data;
    }
  } catch (error) {
    console.error('Error fetching MIDI file:', error);
    throw new Error(`Failed to fetch MIDI file: ${error.message || 'Unknown error'}`);
  }
};

// Function to parse a MIDI file and convert it to SongData format
export const parseMidiToSongData = (midiData: ArrayBuffer, name: string): SongData => {
  // Parse the MIDI data using @tonejs/midi
  const midi = new Midi(midiData);
  
  // Extract BPM from the MIDI file (default to 120 if not found)
  const bpm = midi.header.tempos.length > 0 ? midi.header.tempos[0].bpm : 120;
  
  // Convert MIDI notes to SongData notes format
  const notes: { noteName: string, startAtBar: number, durationInBars: number }[] = [];
  
  // Process each track
  midi.tracks.forEach(track => {
    // Process each note in the track
    track.notes.forEach(note => {
      // Convert time and duration from seconds to bars
      // Assuming 4/4 time signature
      const secondsPerBeat = 60 / bpm;
      const beatsPerBar = 4;
      const secondsPerBar = secondsPerBeat * beatsPerBar;
      
      const startAtBar = note.time / secondsPerBar;
      const durationInBars = note.duration / secondsPerBar;
      
      // Get note name
      const noteName = note.name;
      
      notes.push({
        noteName,
        startAtBar,
        durationInBars,
      });
    });
  });
  
  return {
    name,
    bpm,
    notes,
  };
};

// Function to load a MIDI file from a URL and convert it to SongData
export const loadMidiFromUrl = async (url: string, name: string): Promise<SongData> => {
  try {
    console.log('Loading MIDI from URL:', url);
    const midiData = await fetchMidiFile(url);
    console.log('MIDI data fetched, parsing...');
    const songData = parseMidiToSongData(midiData, name);
    console.log('MIDI parsed successfully:', songData);
    return songData;
  } catch (error) {
    console.error('Error loading MIDI file:', error);
    throw new Error(`Failed to load MIDI file: ${error.message || 'Unknown error'}`);
  }
};
