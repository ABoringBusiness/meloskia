import React, {
  memo, useEffect, useRef, useState,
} from 'react';
import { Canvas, Group } from '@shopify/react-native-skia';
import {
  Easing,
  Platform,
  Pressable, Text, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue, withDelay, withTiming,
} from 'react-native-reanimated';
import PianoKeyboard from './PianoKeyboard';
import NoteRoll from './NoteRoll';
import {
  countdownBars,
  gameHeight, gameWidth, getBarsFromDist, getDistFromBars, getDurationInBars, getOnPressKeyboardGestureHandler, getTimeFromBars, isGamePlaying, screenHeight, screenWidth,
} from '../utils/utils';
import useKeyboard from '../hooks/useKeyboard';
import KeyboardAudio from './KeyboardAudio';
import { SongData, generateDifficultyLevel } from '../utils/songs';
import ScoreDisplay from './ScoreDisplay';
import HitFeedback from './HitFeedback';
import { ScoreState, initialScoreState, updateScore, calculateNoteScore, HitType } from '../utils/scoring';
import DifficultySelector from './DifficultySelector';

const verbose = false;

export type PlayMode = 'start' | 'playing' | 'playback' | 'practice' | 'restart';

const PlayingUI = ({
  songData,
}:{
  songData: SongData
}) => {
  // ==============================
  //    Playing State

  const playingTimeout = useRef<NodeJS.Timeout>();

  const [playMode, setPlayMode] = useState<PlayMode>('start');
  const [practiceSpeed, setPracticeSpeed] = useState<number>(0.5); // 50% speed
  const [scoreState, setScoreState] = useState<ScoreState>(initialScoreState);
  const [lastHitType, setLastHitType] = useState<HitType>(null);
  const [hitPosition, setHitPosition] = useState({ x: 0, y: 0 });
  const [currentDifficulty, setCurrentDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [currentSongData, setCurrentSongData] = useState<SongData>(songData);
  
  // Update song data when difficulty changes
  useEffect(() => {
    if (currentDifficulty !== 'medium') {
      // Generate song with selected difficulty
      const newSongData = generateDifficultyLevel(songData, currentDifficulty);
      setCurrentSongData(newSongData);
    } else {
      // Use original song data for medium difficulty
      setCurrentSongData(songData);
    }
  }, [currentDifficulty, songData]);
  
  const restart = () => {
    setPlayMode('start');
    setScoreState(initialScoreState);
    clearTimeout(playingTimeout.current);
  };

  const startGame = (startMode: 'playing' | 'playback' | 'practice') => {
    setPlayMode(startMode);

    // TEMP: Allow the user to restart the game after the animation
    const duration = startMode === 'practice' 
      ? getTimeFromBars((songData) && (getDurationInBars(songData) + countdownBars), songData?.bpm) / practiceSpeed
      : getTimeFromBars((songData) && (getDurationInBars(songData) + countdownBars), songData?.bpm);
    
    playingTimeout.current = setTimeout(() => {
      setPlayMode('restart');
    }, duration);
  };

  // ==============================
  //    Keyboard Handler

  // Function to handle note hits and update score
  const handleNoteHit = (noteName: string, accuracy: number) => {
    // Calculate hit type based on accuracy
    const hitType = calculateNoteScore(accuracy);
    
    // Update score state
    setScoreState(prevState => updateScore(prevState, hitType));
    
    // Set hit type for visual feedback
    setLastHitType(hitType);
    
    // Set position for hit feedback (center of screen for now)
    setHitPosition({
      x: gameWidth / 2,
      y: gameHeight / 3,
    });
    
    // Clear hit type after animation
    setTimeout(() => setLastHitType(null), 500);
  };
  
  const {
    keysState, keyPressed, releaseLastKey, playNotesFromBars,
  } = useKeyboard({
    keyboardType: 'laptop', 
    playMode, 
    songData: currentSongData, 
    startGame, 
    restart,
    onNoteHit: handleNoteHit,
  });

  // ==============================
  //    Animations

  // NoteRoll Animation
  const noteRollY = useSharedValue(0);
  useEffect(() => {
    if (isGamePlaying(playMode)) {
      const songDurationWithCountdown = getDurationInBars(currentSongData) + countdownBars;
      const duration = playMode === 'practice'
        ? getTimeFromBars(songDurationWithCountdown, currentSongData.bpm) / practiceSpeed
        : getTimeFromBars(songDurationWithCountdown, currentSongData.bpm);
        
      noteRollY.value = withTiming(
        getDistFromBars(songDurationWithCountdown, currentSongData.bpm),
        {
          duration,
          easing: Easing.linear,
        },
      );
    } else if (playMode === 'start') {
      noteRollY.value = withTiming(0, {
        duration: 500,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playMode, practiceSpeed]);

  // CTA Animation
  const height = useSharedValue(0);
  useEffect(() => {
    if (playMode === 'start' && noteRollY.value === 0) {
      height.value = 0;
      height.value = withDelay(1000, withTiming((Platform.OS === 'web') ? 85 : 200, { duration: 250, easing: Easing.inOut(Easing.ease) }));
    }

    return () => {
      height.value = 0;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSongData.name]);

  // ===========================
  //        Scroll (web)

  const handleScrolling = (e: WheelEvent) => {
    if (isGamePlaying(playMode)) return false;

    // Hide the CTA
    if (height.value !== 0) {
      height.value = withTiming(0, { duration: 250, easing: Easing.inOut(Easing.ease) });
    }

    const scrolledVerticallyBy = e?.deltaY;

    const translateX = noteRollY.value - scrolledVerticallyBy;
    // Set the limit as the end of the song
    const translateEndLimit = getDistFromBars(getDurationInBars(currentSongData) + countdownBars, currentSongData.bpm) + 20;
    verbose && console.log('Scrolled!', scrolledVerticallyBy, translateX, noteRollY.value);

    // If we're in the boundaries
    if (translateX > 0 && translateX < translateEndLimit) {
      // We move the scene
      noteRollY.value = translateX;

      // Play the notes as we scroll
      const currentTimeInBars = getBarsFromDist(translateX, currentSongData.bpm);
      verbose && console.log('Scrolling', currentTimeInBars, translateX);
      playNotesFromBars(currentTimeInBars);
    }

    return false;
  };

  useEffect(() => {
    if (Platform.OS === 'web') {
      verbose && console.log('Scrolling start', window);
      window.addEventListener('wheel', handleScrolling);

      return () => {
        if (Platform.OS === 'web') {
          verbose && console.log('Scrolling removed', window);
          window.removeEventListener('wheel', handleScrolling);
        }
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSongData, playMode]);

  // ==============================
  //    CTAs

  const renderWebCTAs = () => (<View
    className="flex absolute bottom-[200px] w-full h-0 bg-neutral-950/70 overflow-hidden"
    style={{ height: height.value }}
  >
    { (playMode === 'start') ? <>
      <Text className="text-white text-lg text-center mt-5">Press Spacebar to start playing</Text>
      <Text className="text-neutral-400 text-regular text-center">Press Enter if you're feeling lazy. Or simply Scroll away.</Text>
      <Text className="text-cyan-400 text-regular text-center mb-5">Press 'P' for practice mode.</Text>
    </> : <Text className="text-white text-lg text-center my-5">Press Spacebar or Enter to restart.</Text> }
    
    {playMode === 'practice' && renderPracticeModeControls()}
  </View>);

  // Practice mode controls
  const renderPracticeModeControls = () => (
    <View className="mt-4 w-full">
      <Text className="text-white text-center mb-2">Practice Speed: {Math.round(practiceSpeed * 100)}%</Text>
      <View className="flex-row justify-center">
        <Pressable 
          className="bg-cyan-600 px-4 py-2 rounded-l-md"
          onPress={() => setPracticeSpeed(Math.max(0.25, practiceSpeed - 0.25))}
        >
          <Text className="text-white">Slower</Text>
        </Pressable>
        <Pressable 
          className="bg-cyan-600 px-4 py-2 rounded-r-md ml-1"
          onPress={() => setPracticeSpeed(Math.min(1, practiceSpeed + 0.25))}
        >
          <Text className="text-white">Faster</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderMobileCTAs = () => (<View
    className="absolute bottom-[200px] left-0 w-full pb-10"
    style={{ height: height.value }}
  >
    <Pressable onPress={() => ((playMode === 'start') ? startGame('playing') : restart()) }>
      <LinearGradient
        colors={
          (playMode === 'start') ? ['#6A8AFF', '#8A6AFF', '#FF6AFF'] : ['#FF6AFF', '#8A6AFF', '#6A8AFF']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="content-center items-center rounded-lg py-5 px-10 mx-auto"
      >
        <Text className='text-white font-medium text-2xl'>{(playMode === 'start') ? 'Start Playing' : 'Restart'}</Text>
      </LinearGradient>
    </Pressable>

    { (playMode === 'start') && (
      <>
        <Pressable
          className="content-center items-center rounded-lg py-3"
          onPress={() => startGame('playback')}
        >
          <Text className="text-neutral-400 text-lg">Feeling lazy?</Text>
        </Pressable>
        
        <Pressable
          className="content-center items-center rounded-lg py-3"
          onPress={() => startGame('practice')}
        >
          <Text className="text-cyan-400 text-lg">Practice Mode</Text>
        </Pressable>
      </>
    )}
    
    {/* Practice mode controls */}
    {playMode === 'practice' && renderPracticeModeControls()}
  </View>);

  const renderCTAs = () => (<>
    { (Platform.OS === 'web') ? renderWebCTAs() : renderMobileCTAs()}

    {/* Close icon on the top right */}
    <Link href="/" className="absolute top-3 left-3 py-3 px-5">
      <Text className="text-neutral-400 text-lg">&lt; Back</Text>
      {/* <Text className="text-neutral-200 font-medium text-3xl">x</Text> */}
    </Link>
  </>);

  // ==============================
  //    Skia Canvas

  if (songData) {
    // Calculate total notes for scoring
    const totalNotes = currentSongData.notes.length;
    
    // Available difficulties
    const availableDifficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
    
    return (
      <View className="flex-1">
        {/* Start button, centered on the screen */}
        { !isGamePlaying(playMode) && ((Platform.OS === 'web') ? renderCTAs() : renderMobileCTAs()) }

        {/* Difficulty selector - only show when not playing */}
        {playMode === 'start' && (
          <View style={{ position: 'absolute', top: 60, width: '100%', zIndex: 10 }}>
            <DifficultySelector
              currentDifficulty={currentDifficulty}
              onSelectDifficulty={setCurrentDifficulty}
              availableDifficulties={availableDifficulties}
            />
          </View>
        )}

        {/* Score display */}
        <ScoreDisplay 
          scoreState={scoreState} 
          isGameOver={playMode === 'restart'} 
          totalNotes={totalNotes} 
        />
        
        {/* Hit feedback */}
        <HitFeedback 
          hitType={lastHitType} 
          position={hitPosition} 
        />
        
        {/* Piano sound */}
        <KeyboardAudio {...{ playMode, keysState, songData: currentSongData }} />

        <GestureDetector gesture={getOnPressKeyboardGestureHandler(keyPressed, releaseLastKey)}>
          <Canvas style={{ width: screenWidth, height: screenHeight }}>
            <Group transform={[
              // Center the game
              { translateX: (screenWidth - gameWidth) / 2 },
              { translateY: (screenHeight - gameHeight) / 2 },
            ]}>
              <NoteRoll {...{
                playMode, keysState, songData: currentSongData, noteRollY,
              }} />
              <PianoKeyboard keysState={keysState} songName={currentSongData.name} />
            </Group>
          </Canvas>
        </GestureDetector>
      </View>
    );
  }

  // ==============================
  //    Invalid songData

  return <View className="flex-1 bg-neutral-950 items-center justify-center">
    <Text className="text-lg font-bold text-white">Invalid ID. This song doesn't exist.</Text>

    <Link href="/" className="mt-4 py-4">
      <Text className="text-regular text-cyan-600 web:hover:text-cyan-500">Go to home screen</Text>
    </Link>
  </View>;
};

export default memo(PlayingUI);
