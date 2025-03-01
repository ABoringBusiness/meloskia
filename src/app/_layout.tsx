import { SplashScreen, Stack } from 'expo-router';
import { View } from 'react-native';

// Import custom error boundary
import ErrorBoundary from '../components/ErrorBoundary';

// Import your global CSS file
import '../../global.css';

// Export custom error boundary instead of the default one
export { ErrorBoundary };

// eslint-disable-next-line @typescript-eslint/naming-convention
export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="intro" options={{ headerShown: false }} />
        <Stack.Screen name="play/[songId]" options={{ headerShown: false }} />
        <Stack.Screen name="credits" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
  );
}

export default function RootLayout() {
  return <RootLayoutNav />;
}
