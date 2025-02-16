import React from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { MediaDetailsCard } from '../components/MediaDetailsCard';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'MediaDetails'>;

export function MediaDetailsScreen({ route, navigation }: Props) {
  const { media: initialMedia } = route.params;
  const insets = useSafeAreaInsets();

  // Fetch latest media data
  const { data: media, isLoading } = useQuery({
    queryKey: ['media', initialMedia.id],
    queryFn: () => api.get(`/media/${initialMedia.id}`).then(res => res.data),
    initialData: initialMedia,
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <MediaDetailsCard 
        media={media} 
        onClose={() => {}} // Empty function since we're not using the close button
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
}); 