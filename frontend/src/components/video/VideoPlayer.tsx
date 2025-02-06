import { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LikeButton } from './LikeButton';
import { VideoOverlay } from './VideoOverlay';
import type { VideoMetadata } from '../../types/video';

interface VideoError {
  error: {
    message?: string;
    code?: string;
  };
}

interface VideoPlayerProps {
  video: VideoMetadata;
  shouldPlay?: boolean;
  isMuted?: boolean;
  onLike?: () => void;
  onDoubleTap?: () => void;
}

export function VideoPlayer({
  video,
  shouldPlay = false,
  isMuted = false,
  onLike,
  onDoubleTap,
}: VideoPlayerProps) {
  const videoRef = useRef<Video>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const lastTap = useRef<number>(0);

  // Calculate height accounting for tab bar (which is typically 49px) and bottom inset
  const videoHeight = windowHeight - (49 + insets.bottom);

  useEffect(() => {
    if (videoRef.current) {
      if (shouldPlay) {
        videoRef.current.playAsync().catch(console.error);
      } else {
        videoRef.current.pauseAsync().catch(console.error);
      }
    }
  }, [shouldPlay]);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsLoading(false);
      if (status.didJustFinish) {
        videoRef.current?.replayAsync().catch(console.error);
      }
    } else {
      setError(status.error || 'Failed to load video');
    }
  };

  const handleError = (error: VideoError | string) => {
    if (typeof error === 'string') {
      setError(error);
    } else {
      setError(error.error?.message || 'Failed to load video');
    }
    setIsLoading(false);
  };

  const handlePress = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      onDoubleTap?.();
    }
    lastTap.current = now;
  };

  if (error) {
    return (
      <View style={[styles.container, { height: videoHeight }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <Pressable 
      style={[styles.container, { height: videoHeight }]} 
      onPress={handlePress}
    >
      <Video
        ref={videoRef}
        source={{ 
          uri: video.url,
          headers: {
            'Accept': 'video/mp4',
            'Content-Type': 'video/mp4',
          }
        }}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay={shouldPlay}
        isLooping
        isMuted={isMuted}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        onError={handleError}
      />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
      <VideoOverlay
        username={video.username}
        description={video.description}
        likes={video.likes}
      />
      <LikeButton
        isLiked={video.isLiked}
        onPress={onLike}
        style={styles.likeButton}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
  },
  likeButton: {
    position: 'absolute',
    right: 16,
    bottom: 100,
  },
}); 