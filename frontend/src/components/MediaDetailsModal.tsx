import React from 'react';
import { Modal, StyleSheet, View, TouchableWithoutFeedback, Pressable } from 'react-native';
import { MediaItem } from '../types/media';
import { MediaDetailsCard } from './MediaDetailsCard';

interface MediaDetailsModalProps {
  isVisible: boolean;
  media?: MediaItem;
  onClose: () => void;
}

export function MediaDetailsModal({ isVisible, media, onClose }: MediaDetailsModalProps) {
  console.log('MediaDetailsModal render:', { isVisible, mediaId: media?.id, mediaType: media?.type });
  
  if (!media) {
    console.log('MediaDetailsModal: No media provided');
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable 
        style={styles.overlay} 
        onPress={() => {
          console.log('Overlay pressed, closing modal');
          onClose();
        }}
      >
        <Pressable 
          style={styles.content} 
          onPress={(e) => {
            console.log('Content pressed, stopping propagation');
            e.stopPropagation();
          }}
        >
          <MediaDetailsCard media={media} onClose={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
}); 