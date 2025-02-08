import { View, Text, StyleSheet, ActivityIndicator, FlatList, Image, Pressable, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useUserVideos } from '../hooks/useUserVideos';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatNumber } from '../utils/format';
import type { VideoMetadata } from '../types/video';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { auth } from '../config/firebase';
import { ProfileImage } from '../components/ui/ProfileImage';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { authApi } from '../api/auth';
import { useEffect } from 'react';

function getAvatarUrl(username: string) {
  return `https://api.dicebear.com/7.x/avataaars/png?seed=${username}&backgroundColor=random`;
}

export function ProfileScreen() {
  const { user } = useAuth();
  const { videos, isLoading } = useUserVideos(user?.uid);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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

  if (isLoading) {
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
          <StatItem label="Followers" value="0" />
          <StatItem label="Following" value="0" />
        </View>
      </View>

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
});
