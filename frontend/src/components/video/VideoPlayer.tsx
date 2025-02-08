import { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LikeButton } from './LikeButton';
import { VideoOverlay } from './VideoOverlay';
import { formatNumber } from '../../utils/format';
import { ProfileImage } from '../ui/ProfileImage';
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
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const lastTap = useRef<number>(0);

  // Calculate height and bottom position for like button
  const TAB_BAR_HEIGHT = 49;
  const BOTTOM_SPACE = Math.max(TAB_BAR_HEIGHT, insets.bottom + TAB_BAR_HEIGHT);
  const videoHeight = windowHeight - BOTTOM_SPACE;

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
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ 
            uri: video.url,
            overrideFileExtensionAndroid: 'm3u8',
            headers: {
              'Accept': '*/*',
            }
          }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={shouldPlay}
          isLooping
          isMuted={isMuted}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          onError={handleError}
          useNativeControls={false}
          progressUpdateIntervalMillis={500}
        />
      </View>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
      <VideoOverlay
        username={video.username}
        description={video.description}
      />
      <View style={[styles.likeButtonContainer, { bottom: 120 }]}>
        <ProfileImage
          size={40}
          userId={video.userId}
          imageUrl={null}
          style={styles.profileImage}
        />
        <LikeButton
          isLiked={video.isLiked}
          onPress={onLike}
        />
        <Text style={styles.likeCount}>{formatNumber(video.likes)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
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
  profileImage: {
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  likeButtonContainer: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
    alignItems: 'center',
  },
  likeCount: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
}); 