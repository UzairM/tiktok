import { View, Text, StyleSheet } from 'react-native';

interface VideoOverlayProps {
  username: string;
  description: string;
}

export function VideoOverlay({ username, description }: VideoOverlayProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.username}>@{username}</Text>
        <Text style={styles.description} numberOfLines={1}>
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: '100%',
  },
  username: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  description: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
}); 