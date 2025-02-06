import { useState, useRef } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { useVideos } from '../hooks/useVideos';
import { useLike } from '../hooks/useLike';
import type { VideoMetadata } from '../types/video';

interface ViewableItemsChanged {
  viewableItems: ViewToken[];
  changed: ViewToken[];
}

export function FeedScreen() {
  const { videos, isLoading, error, fetchNextPage } = useVideos();
  const { toggleLike } = useLike();
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleViewableItemsChanged = useRef(({ viewableItems }: ViewableItemsChanged) => {
    if (viewableItems.length > 0) {
      setActiveVideoIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const handleLike = async (video: VideoMetadata) => {
    try {
      await toggleLike(video.id);
    } catch (error) {
      console.error('Failed to like video:', error);
    }
  };

  const renderItem = ({ item: video, index }: { item: VideoMetadata; index: number }) => (
    <VideoPlayer
      video={video}
      shouldPlay={index === activeVideoIndex}
      isMuted={false}
      onLike={() => handleLike(video)}
      onDoubleTap={() => handleLike(video)}
    />
  );

  if (isLoading && !videos.length) {
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
          <Text style={styles.errorText}>Failed to load videos</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.5}
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
