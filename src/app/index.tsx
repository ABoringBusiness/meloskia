import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { songs } from '../utils/songs';
import { cn } from '../utils/utils';
import MidiLoader from '../components/MidiLoader';
import { useState, useEffect } from 'react';

export default function App() {
  const [songList, setSongList] = useState(songs);

  // Update the song list when songs change
  useEffect(() => {
    setSongList([...songs]);
  }, [songs]);

  const handleSongAdded = () => {
    setSongList([...songs]);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView className="flex-1 bg-neutral-950">
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-4xl font-bold text-white mb-5">Welcome to Melo'Skia!</Text>
          
          <MidiLoader onSongAdded={handleSongAdded} />
          
          <Text className="text-xl text-neutral-400 mt-8 mb-2">Available songs:</Text>

          <View className="border-t border-neutral-900 w-full mb-5">
            {songList.map((song, i) => {
              let textColor = 'text-pastels-0';
              switch (i % 10) {
                case 0: textColor = 'text-pastels-0'; break;
                case 1: textColor = 'text-pastels-1'; break;
                case 2: textColor = 'text-pastels-2'; break;
                case 3: textColor = 'text-pastels-3'; break;
                case 4: textColor = 'text-pastels-4'; break;
                case 5: textColor = 'text-pastels-5'; break;
                case 6: textColor = 'text-pastels-6'; break;
                case 7: textColor = 'text-pastels-7'; break;
                case 8: textColor = 'text-pastels-8'; break;
                case 9: textColor = 'text-pastels-9'; break;
                default: textColor = 'text-pastels-0'; break;
              }

              return <Link
                key={`song_${i}`}
                href={`/play/${i}`}
                className={cn(
                  'py-5 border-b border-neutral-900 text-center w-full hover:bg-neutral-900',
                  textColor,
                )}
              >
                <Text key={`song_${i}`} className="text-lg">{song.name}</Text>
              </Link>;
            })}
          </View>

          <StatusBar style="auto" />
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
}
