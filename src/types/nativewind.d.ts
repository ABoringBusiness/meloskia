import 'react-native';
import 'react-native-reanimated';

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface TextInputProps {
    className?: string;
  }
  interface TouchableOpacityProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
  }
  interface LinkProps {
    className?: string;
  }
  interface PressableProps {
    className?: string;
  }
  // Add other component props as needed
}

// Fix for Animated.View
declare module 'react-native-reanimated' {
  interface AnimateProps<T> {
    className?: string;
  }
}

// Add a global declaration to make TypeScript ignore className props
declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      className?: string;
    }
  }
}
