import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { commonStyles } from '../styles/common';

export function FeedScreen() {
  return (
    <SafeAreaView style={commonStyles.fullScreen}>
      <View style={commonStyles.centerContent}>
        <Text style={commonStyles.title}>Feed Screen</Text>
        <Text style={commonStyles.subtitle}>Videos will appear here</Text>
        <AnimatedButton
          title="Refresh Feed"
          onPress={() => console.log('Refresh feed')}
          variant="secondary"
        />
      </View>
    </SafeAreaView>
  );
}
