import { useState, useRef, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, ViewToken, useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
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
  const isFocused = useIsFocused();
  const flatListRef = useRef<FlatList>(null);
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Calculate height accounting for bottom tab bar (which is typically 49px) and any additional bottom insets
  const TAB_BAR_HEIGHT = 49;
  const BOTTOM_SPACE = Math.max(TAB_BAR_HEIGHT, insets.bottom + TAB_BAR_HEIGHT);
  const videoHeight = windowHeight - BOTTOM_SPACE;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
    minimumViewTime: 0,
    waitForInteraction: false,
  }).current;

  const handleViewableItemsChanged = useRef(({ viewableItems }: ViewableItemsChanged) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index ?? 0;
      setActiveVideoIndex(index);
    }
  }).current;

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.y;
    const index = Math.round(offset / videoHeight);
    if (index !== activeVideoIndex) {
      setActiveVideoIndex(index);
    }
  };

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
      shouldPlay={index === activeVideoIndex && isFocused}
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
        ref={flatListRef}
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.5}
        getItemLayout={(_, index) => ({
          length: videoHeight,
          offset: videoHeight * index,
          index,
        })}
        snapToInterval={videoHeight}
        snapToAlignment="start"
        decelerationRate={0.9}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        disableIntervalMomentum={true}
        maxToRenderPerBatch={3}
        windowSize={3}
        removeClippedSubviews={true}
        scrollEventThrottle={16}
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
