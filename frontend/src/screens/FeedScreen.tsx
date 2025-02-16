import { useState, useRef, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, ViewToken, useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { useAllMedia } from '../hooks/useAllMedia';
import type { Media } from '../hooks/useUserMedia';
import { Video, ResizeMode } from 'expo-av';

interface ViewableItemsChanged {
  viewableItems: ViewToken[];
  changed: ViewToken[];
}

export function FeedScreen() {
  const { media, isLoading, error, fetchNextPage, hasNextPage } = useAllMedia();
  const [activeIndex, setActiveIndex] = useState(0);
  const isFocused = useIsFocused();
  const flatListRef = useRef<FlatList>(null);
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Calculate height accounting for bottom tab bar (which is typically 49px) and any additional bottom insets
  const TAB_BAR_HEIGHT = 49;
  const BOTTOM_SPACE = Math.max(TAB_BAR_HEIGHT, insets.bottom + TAB_BAR_HEIGHT);
  const mediaHeight = windowHeight - BOTTOM_SPACE;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
    minimumViewTime: 0,
    waitForInteraction: false,
  }).current;

  const handleViewableItemsChanged = useRef(({ viewableItems }: ViewableItemsChanged) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index ?? 0;
      setActiveIndex(index);
    }
  }).current;

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.y;
    const index = Math.round(offset / mediaHeight);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const handleEndReached = () => {
    if (hasNextPage && !isLoading) {
      fetchNextPage();
    }
  };

  const renderItem = ({ item, index }: { item: Media; index: number }) => {
    const isVideo = item.mediaUrl.endsWith('.mp4');

    return (
      <View style={[styles.mediaContainer, { height: mediaHeight }]}>
        {isVideo ? (
          <Video
            source={{ uri: item.mediaUrl }}
            style={styles.media}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={index === activeIndex && isFocused}
            isLooping
            isMuted={false}
          />
        ) : (
          <Image
            source={{ uri: item.mediaUrl }}
            style={styles.media}
            resizeMode="contain"
          />
        )}
        {index === media.length - 1 && !hasNextPage && (
          <View style={styles.endOfFeedContainer}>
            <Text style={styles.endOfFeedText}>No more content</Text>
          </View>
        )}
      </View>
    );
  };

  if (isLoading && !media.length) {
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
          <Text style={styles.errorText}>Failed to load media</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={media}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.id}-${item.createdAt}`}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        getItemLayout={(_, index) => ({
          length: mediaHeight,
          offset: mediaHeight * index,
          index,
        })}
        snapToInterval={mediaHeight}
        snapToAlignment="start"
        decelerationRate={0.9}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        disableIntervalMomentum={true}
        maxToRenderPerBatch={3}
        windowSize={3}
        removeClippedSubviews={true}
        scrollEventThrottle={16}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10
        }}
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
  mediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  endOfFeedContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
  },
  endOfFeedText: {
    color: '#fff',
    fontSize: 14,
  },
});
