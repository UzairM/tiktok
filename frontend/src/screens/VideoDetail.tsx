import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { useRoute } from '@react-navigation/native';
import { useVideo } from '../hooks/useVideo';
import { useLike } from '../hooks/useLike';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';

type VideoDetailRouteProp = RouteProp<RootStackParamList, 'VideoDetail'>;

export function VideoDetailScreen() {
  const route = useRoute<VideoDetailRouteProp>();
  const { videoId } = route.params;
  const { video, isLoading, error } = useVideo(videoId);
  const { toggleLike } = useLike();

  if (isLoading || !video) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load video</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleLike = async () => {
    try {
      await toggleLike(video.id);
    } catch (error) {
      console.error('Failed to like video:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <VideoPlayer
        video={video}
        shouldPlay={true}
        isMuted={false}
        onLike={handleLike}
        onDoubleTap={handleLike}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
}); 