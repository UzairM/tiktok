import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatNumber } from '../../utils/format';

interface VideoOverlayProps {
  username: string;
  description: string;
  likes: number;
}

export function VideoOverlay({ username, description, likes }: VideoOverlayProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.username}>@{username}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      </View>
      <View style={styles.stats}>
        <MaterialCommunityIcons name="heart" size={20} color="#fff" />
        <Text style={styles.statsText}>{formatNumber(likes)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  content: {
    marginBottom: 16,
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    color: '#fff',
    fontSize: 14,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
  },
}); 