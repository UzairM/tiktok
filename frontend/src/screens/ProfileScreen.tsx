import React, { View, Text, StyleSheet, ActivityIndicator, FlatList, Image, Pressable, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useUserMedia } from '../hooks/useUserMedia';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import type { Media } from '../hooks/useUserMedia';
import type { Plant } from '../types/plant';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { auth } from '../config/firebase';
import { ProfileImage } from '../components/ui/ProfileImage';
import { authApi } from '../api/auth';
import { useEffect, useMemo, useState } from 'react';
import { Video, ResizeMode } from 'expo-av';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { MediaDetailsModal } from '../components/MediaDetailsModal';

export function ProfileScreen() {
  const { user } = useAuth();
  const { media, isLoading: mediaLoading } = useUserMedia(user?.uid);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Fetch plants
  const { data: plants, isLoading: plantsLoading } = useQuery<Plant[]>({
    queryKey: ['plants'],
    queryFn: () => api.get('/plants').then(res => res.data)
  });

  // Group media by plant
  const mediaByPlant = useMemo(() => {
    if (!media || !plants) return new Map<string, Media[]>();
    
    const grouped = new Map<string, Media[]>();
    plants.forEach(plant => {
      grouped.set(plant.id, media.filter((m: Media) => m.plantId === plant.id));
    });
    return grouped;
  }, [media, plants]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const renderMediaItem = ({ item }: { item: Media }) => {
    const getMediaType = (url: string): 'image' | 'video' => {
      const extension = url.split('.').pop()?.toLowerCase();
      return extension === 'mp4' ? 'video' : 'image';
    };

    const mediaType = item.type || getMediaType(item.mediaUrl);
    console.log('Rendering media item:', { id: item.id, type: mediaType, url: item.mediaUrl });
    
    return (
      <Pressable
        style={styles.mediaItem}
        onPress={() => {
          console.log('Media item pressed:', { id: item.id, type: mediaType });
          navigation.navigate('MediaDetails', {
            media: {
              ...item,
              type: mediaType
            }
          });
        }}
      >
        {mediaType === 'video' ? (
          <Video
            source={{ uri: item.mediaUrl }}
            style={styles.mediaThumbnail}
            resizeMode={ResizeMode.COVER}
            shouldPlay={false}
            isMuted={true}
            useNativeControls={false}
            onError={(error) => {
              console.error('Thumbnail video error:', error);
            }}
          />
        ) : (
          <Image
            source={{ uri: item.mediaUrl }}
            style={styles.mediaThumbnail}
            resizeMode="cover"
            onError={(error) => {
              console.error('Thumbnail image error:', error.nativeEvent.error);
            }}
          />
        )}
      </Pressable>
    );
  };

  const renderPlantSection = (plant: Plant) => {
    const plantMedia = mediaByPlant.get(plant.id) || [];
    
    return (
      <View key={plant.id} style={styles.plantSection}>
        <View style={styles.plantHeader}>
          <View style={styles.plantInfo}>
            <Text style={styles.plantName}>{plant.name}</Text>
            <Text style={styles.plantType}>{plant.type}</Text>
          </View>
          <TouchableOpacity
            style={styles.growthButton}
            onPress={() => navigation.navigate('GrowthAnalysis', {
              plantId: plant.id,
              plantName: plant.name,
            })}
          >
            <Ionicons name="analytics" size={20} color="#fff" />
            <Text style={styles.growthButtonText}>Growth</Text>
          </TouchableOpacity>
        </View>
        
        {plantMedia.length > 0 ? (
          <FlatList
            horizontal
            data={plantMedia}
            renderItem={renderMediaItem}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mediaList}
          />
        ) : (
          <View style={styles.emptyPlantMedia}>
            <Text style={styles.emptyText}>No media yet for this plant</Text>
          </View>
        )}
      </View>
    );
  };

  if (mediaLoading || plantsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <ProfileImage
            size={40}
            imageUrl={user.photoURL}
            userId={user.uid}
            editable={false}
          />
          <Text style={styles.username}>@{user?.displayName || 'User'}</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <MaterialCommunityIcons name="logout" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileInfo}>
        <View style={styles.stats}>
          <StatItem label="Plants" value={(plants?.length || 0).toString()} />
          <StatItem label="Media" value={media.length.toString()} />
        </View>
      </View>

      <ScrollView style={styles.plantsContainer}>
        {plants?.map(renderPlantSection)}
        {(!plants || plants.length === 0) && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No plants yet</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  logoutButton: {
    padding: 8,
  },
  profileInfo: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  plantsContainer: {
    flex: 1,
  },
  plantSection: {
    marginBottom: 24,
  },
  plantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  plantInfo: {
    flex: 1,
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  plantType: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  mediaList: {
    padding: 8,
  },
  mediaItem: {
    width: 160,
    height: 160,
    marginHorizontal: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
  },
  emptyPlantMedia: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    margin: 8,
    borderRadius: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  growthButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  growthButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

