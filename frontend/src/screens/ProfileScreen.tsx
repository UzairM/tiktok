import { View, Text, StyleSheet, ActivityIndicator, FlatList, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useUserVideos } from '../hooks/useUserVideos';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatNumber } from '../utils/format';
import type { VideoMetadata } from '../types/video';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

function getAvatarUrl(username: string) {
  return `https://api.dicebear.com/7.x/avataaars/png?seed=${username}&backgroundColor=random`;
}

export function ProfileScreen() {
  const { user } = useAuth();
  const { videos, isLoading } = useUserVideos(user?.uid);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <Image
            source={{ uri: user?.photoURL || getAvatarUrl(user?.displayName || user?.email || 'user') }}
            style={styles.avatar}
          />
          <Text style={styles.username}>@{user?.displayName || 'User'}</Text>
        </View>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
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
