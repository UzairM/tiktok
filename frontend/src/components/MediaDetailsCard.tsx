import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { MediaItem } from '../types/media';
import { Ionicons } from '@expo/vector-icons';
import { useMediaAnalysis } from '../hooks/useMediaAnalysis';
import Markdown from 'react-native-markdown-display';

interface MediaDetailsCardProps {
  media: MediaItem;
  onClose: () => void;
}

export function MediaDetailsCard({ media, onClose }: MediaDetailsCardProps) {
  const getMediaType = (url: string): 'image' | 'video' => {
    const extension = url.split('.').pop()?.toLowerCase();
    return extension === 'mp4' ? 'video' : 'image';
  };

  const mediaType = media.type || getMediaType(media.mediaUrl);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  
  const { isLoadingHealth, analyzeHealth } = useMediaAnalysis({
    mediaId: media.id,
  });

  function renderMedia() {
    if (mediaType === 'video') {
      return (
        <Video
          source={{ uri: media.mediaUrl }}
          style={styles.media}
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          onLoadStart={() => setIsVideoLoading(true)}
          onLoad={() => setIsVideoLoading(false)}
          onError={(error) => {
            console.error('Video loading error:', error);
          }}
        />
      );
    }
    return (
      <Image
        source={{ uri: media.mediaUrl }}
        style={styles.media}
        resizeMode="contain"
        onError={(error) => {
          console.error('Image loading error:', error.nativeEvent.error);
        }}
      />
    );
  }

  function renderAnalysisContent(content: string | undefined) {
    if (!content) return null;
    return (
      <View style={styles.dataContainer}>
        <Markdown style={{
          body: styles.analysisText,
          heading1: styles.heading1,
          heading2: styles.heading2,
          heading3: styles.heading3,
          heading4: styles.heading4,
          heading5: styles.heading5,
          heading6: styles.heading6,
          paragraph: styles.paragraph,
          link: styles.link,
          list: styles.list,
          listItem: styles.listItem,
          listUnorderedItemIcon: styles.listUnorderedItemIcon,
          listOrderedItemIcon: styles.listOrderedItemIcon,
          blockquote: styles.blockquote,
          inlineCode: styles.inlineCode,
          code_block: styles.codeBlock,
        }}>
          {content}
        </Markdown>
      </View>
    );
  }

  function renderHealthData() {
    if (!media.aiResult?.healthAnalysis) {
      return (
        <View style={styles.loadingContainer}>
          <TouchableOpacity 
            style={styles.analyzeButton}
            onPress={analyzeHealth}
            disabled={isLoadingHealth}
          >
            {isLoadingHealth ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="medkit" size={24} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Analyze Health</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    return renderAnalysisContent(media.aiResult.healthAnalysis);
  }

  return (
    <View style={styles.container}>
      <View style={styles.mediaContainer}>
        {renderMedia()}
        {mediaType === 'video' && isVideoLoading && (
          <ActivityIndicator style={styles.videoLoader} />
        )}
      </View>

      <View style={styles.header}>
        <Text style={styles.headerText}>Health & Disease</Text>
      </View>

      <ScrollView style={styles.contentContainer}>
        {renderHealthData()}
      </ScrollView>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: height * 0.9,
  },
  mediaContainer: {
    width: '100%',
    height: width * 0.75,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  videoLoader: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2196F3',
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  analyzeButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dataContainer: {
    padding: 16,
  },
  analysisText: {
    fontSize: 16,
    color: '#333',
  },
  heading1: { fontSize: 24, fontWeight: 'bold', marginVertical: 12 },
  heading2: { fontSize: 22, fontWeight: 'bold', marginVertical: 10 },
  heading3: { fontSize: 20, fontWeight: 'bold', marginVertical: 8 },
  heading4: { fontSize: 18, fontWeight: 'bold', marginVertical: 8 },
  heading5: { fontSize: 16, fontWeight: 'bold', marginVertical: 8 },
  heading6: { fontSize: 14, fontWeight: 'bold', marginVertical: 8 },
  paragraph: { marginVertical: 8 },
  link: { color: '#2196F3' },
  list: { marginVertical: 8 },
  listItem: { marginVertical: 4 },
  listUnorderedItemIcon: { fontSize: 16, color: '#333' },
  listOrderedItemIcon: { fontSize: 16, color: '#333' },
  blockquote: { borderLeftWidth: 4, borderLeftColor: '#e0e0e0', paddingLeft: 16, marginVertical: 8 },
  inlineCode: { backgroundColor: '#f5f5f5', padding: 4, borderRadius: 4 },
  codeBlock: { backgroundColor: '#f5f5f5', padding: 16, borderRadius: 8, marginVertical: 8 },
}); 