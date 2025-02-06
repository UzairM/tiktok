import { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { useWindowDimensions } from 'react-native';
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
  const lastTap = useRef<number>(0);

  useEffect(() => {
    console.log('Video URL:', video.url); // Debug log
    console.log('Video metadata:', video); // Debug log
  }, [video]);

  useEffect(() => {
    if (videoRef.current) {
      if (shouldPlay) {
        videoRef.current.playAsync().catch(err => {
          console.error('Play error:', err); // Debug log
          setError(err.message);
        });
      } else {
        videoRef.current.pauseAsync().catch(console.error);
      }
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.unloadAsync().catch(console.error);
      }
    };
  }, [shouldPlay]);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    console.log('Playback status:', status); // Debug log
    if (status.isLoaded) {
      setIsLoading(false);
      if (status.didJustFinish) {
        videoRef.current?.replayAsync().catch(console.error);
      }
    } else if ('error' in status) {
      setError(status.error || 'Failed to load video');
    }
  };

  const handleError = (error: VideoError | string) => {
    console.error('Video error:', error); // Debug log
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
      <View style={[styles.container, { height: windowHeight }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <Pressable onPress={handlePress} style={[styles.container, { height: windowHeight }]}>
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
        isLooping
        isMuted={isMuted}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        onError={handleError as (error: string) => void}
        useNativeControls={false}
        shouldPlay={shouldPlay}
        progressUpdateIntervalMillis={500}
      />
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
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
    bottom: '40%',
  },
}); 