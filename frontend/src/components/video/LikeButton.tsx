import { Pressable, StyleSheet, ViewStyle, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRef, useEffect } from 'react';

interface LikeButtonProps {
  isLiked: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function LikeButton({ isLiked, onPress, style }: LikeButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isLiked) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLiked]);

  return (
    <Pressable onPress={onPress} style={[styles.container, style]}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <MaterialCommunityIcons
          name={isLiked ? 'heart' : 'heart-outline'}
          size={35}
          color={isLiked ? '#ff2d55' : '#fff'}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
}); 