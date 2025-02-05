import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { useAuth } from '../hooks/useAuth';
import { commonStyles } from '../styles/common';

export function ProfileScreen() {
  const { logout } = useAuth();
  const isLoading = logout.isPending;

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={commonStyles.fullScreen}>
        <View style={commonStyles.centerContent}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.fullScreen}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={commonStyles.title}>Profile</Text>
          <View style={styles.stats}>
            <StatItem label="Posts" value="0" />
            <StatItem label="Followers" value="0" />
            <StatItem label="Following" value="0" />
          </View>
        </View>
        <View style={styles.content}>
          <Text style={commonStyles.subtitle}>No videos yet</Text>
        </View>
        <AnimatedButton 
          title="Logout" 
          onPress={handleLogout}
          variant="secondary"
          isLoading={isLoading}
        />
      </View>
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
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
