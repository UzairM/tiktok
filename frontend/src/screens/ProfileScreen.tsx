import { View, Text, StyleSheet, ActivityIndicator, FlatList, Image, Pressable, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useUserVideos } from '../hooks/useUserVideos';
import { useUserMedia } from '../hooks/useUserMedia';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatNumber } from '../utils/format';
import type { VideoMetadata } from '../types/video';
import type { Media } from '../hooks/useUserMedia';
import type { Plant } from '../types/plant';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { auth } from '../config/firebase';
import { ProfileImage } from '../components/ui/ProfileImage';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { authApi } from '../api/auth';
import { useEffect, useState, useMemo } from 'react';
import { Video, ResizeMode } from 'expo-av';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

function getAvatarUrl(username: string) {
  return `https://api.dicebear.com/7.x/avataaars/png?seed=${username}&backgroundColor=random`;
}

export function ProfileScreen() {
  const { user } = useAuth();
  const { videos, isLoading: videosLoading } = useUserVideos(user?.uid);
  const { media, isLoading: mediaLoading } = useUserMedia(user?.uid);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedTab, setSelectedTab] = useState<'videos' | 'plants'>('plants');

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
      grouped.set(plant.id, media.filter(m => m.plantId === plant.id));
    });
    return grouped;
  }, [media, plants]);

  useEffect(() => {
    console.log('Current user:', {
      uid: user?.uid,
      photoURL: user?.photoURL,
      displayName: user?.displayName,
      email: user?.email
    });
  }, [user]);

  const handleImageSelected = async (uri: string) => {
    try {
      console.log('Selected image URI:', uri);
      await authApi.updateProfileImage(uri);
      console.log('Profile image updated successfully');
    } catch (error) {
      console.error('Profile image update error:', error);
      Alert.alert('Error', 'Failed to update profile image');
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const renderVideoItem = ({ item: video }: { item: VideoMetadata }) => (
    <Pressable
      style={styles.videoItem}
      onPress={() => navigation.navigate('VideoDetail', { videoId: video.id })}
    >
      <Image
        source={{ uri: video.thumbnailUrl }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.videoStats}>
        <MaterialCommunityIcons name="play" size={16} color="#fff" />
        <Text style={styles.statsText}>{formatNumber(video.views)}</Text>
      </View>
    </Pressable>
  );

  const renderMediaItem = ({ item }: { item: Media }) => {
    const isVideo = item.mediaUrl.endsWith('.mp4');
    
    return (
      <Pressable
        style={styles.mediaItem}
        onPress={() => {
          // TODO: Navigate to media detail screen
          console.log('Media pressed:', item);
        }}
      >
        {isVideo ? (
          <Video
            source={{ uri: item.mediaUrl }}
            style={styles.mediaThumbnail}
            resizeMode={ResizeMode.COVER}
            shouldPlay={false}
            isMuted={true}
            useNativeControls={false}
          />
        ) : (
          <Image
            source={{ uri: item.mediaUrl }}
            style={styles.mediaThumbnail}
            resizeMode="cover"
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
          <Text style={styles.plantName}>{plant.name}</Text>
          <Text style={styles.plantType}>{plant.type}</Text>
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

  if (videosLoading || mediaLoading || plantsLoading) {
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
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <MaterialCommunityIcons name="logout" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <ProfileImage
          size={120}
          imageUrl={user.photoURL}
          userId={user.uid}
          onImageSelected={handleImageSelected}
          editable
        />
        <Text style={[styles.username, { marginTop: 12 }]}>@{user?.displayName || 'User'}</Text>
      </View>

      <View style={styles.profileInfo}>
        <View style={styles.stats}>
          <StatItem label="Videos" value={videos.length.toString()} />
          <StatItem label="Plants" value={(plants?.length || 0).toString()} />
          <StatItem label="Media" value={media.length.toString()} />
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'videos' && styles.selectedTab]}
          onPress={() => setSelectedTab('videos')}
        >
          <Text style={[styles.tabText, selectedTab === 'videos' && styles.selectedTabText]}>Videos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'plants' && styles.selectedTab]}
          onPress={() => setSelectedTab('plants')}
        >
          <Text style={[styles.tabText, selectedTab === 'plants' && styles.selectedTabText]}>Plants</Text>
        </TouchableOpacity>
      </View>

      {selectedTab === 'videos' ? (
        <FlatList
          data={videos}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.videoGrid}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No videos yet</Text>
            </View>
          }
        />
      ) : (
        <ScrollView style={styles.plantsContainer}>
          {plants?.map(renderPlantSection)}
          {(!plants || plants.length === 0) && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No plants yet</Text>
            </View>
          )}
        </ScrollView>
      )}
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
    justifyContent: 'flex-end',
    padding: 16,
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  profileInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
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
  videoGrid: {
    padding: 1,
  },
  videoItem: {
    flex: 1/3,
    aspectRatio: 1,
    margin: 1,
  },
  thumbnail: {
    flex: 1,
  },
  videoStats: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 4,
    borderRadius: 4,
  },
  statsText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
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
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectedTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  selectedTabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  plantsContainer: {
    flex: 1,
  },
  plantSection: {
    marginBottom: 24,
  },
  plantHeader: {
    padding: 16,
    backgroundColor: '#f8f9fa',
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
});

