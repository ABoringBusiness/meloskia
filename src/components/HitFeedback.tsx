import * as React from 'react';
import { View, Text } from 'react-native';
import { HitType } from '../utils/scoring';

interface HitFeedbackProps {
  hitType: HitType;
  position: { x: number, y: number };
}

/**
 * Component to display visual feedback for note hits
 */
const HitFeedback: React.FC<HitFeedbackProps> = ({ hitType, position }) => {
  const [visible, setVisible] = React.useState(false);
  const [opacity, setOpacity] = React.useState(1);
  const [scale, setScale] = React.useState(1);
  
  React.useEffect(() => {
    if (hitType) {
      // Reset values
      setVisible(true);
      setOpacity(1);
      setScale(1.2);
      
      // Animate with setTimeout
      const fadeIn = setTimeout(() => {
        setScale(1.5);
      }, 100);
      
      const fadeOut = setTimeout(() => {
        setOpacity(0);
        setScale(1);
      }, 300);
      
      const hide = setTimeout(() => {
        setVisible(false);
      }, 600);
      
      return () => {
        clearTimeout(fadeIn);
        clearTimeout(fadeOut);
        clearTimeout(hide);
      };
    }
  }, [hitType]);
  
  // Don't render if no hit type or not visible
  if (!hitType || !visible) return null;
  
  // Get color based on hit type
  const getHitColor = () => {
    switch (hitType) {
      case 'perfect': return '#4ade80';
      case 'great': return '#60a5fa';
      case 'good': return '#facc15';
      case 'miss': return '#f87171';
      default: return '#ffffff';
    }
  };
  
  return (
    <View style={{ 
      position: 'absolute',
      left: position.x,
      top: position.y,
      opacity: opacity,
      transform: [{ scale: scale }],
      // Center the text
      alignItems: 'center',
      justifyContent: 'center',
      width: 100,
      marginLeft: -50, // Center horizontally
    }}>
      <Text 
        style={{
          fontSize: 20, 
          fontWeight: 'bold', 
          textAlign: 'center',
          color: getHitColor()
        }}
      >
        {hitType.toUpperCase()}
      </Text>
    </View>
  );
};

export default HitFeedback;
