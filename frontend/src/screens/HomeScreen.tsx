import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles } from '../styles/common';

export function HomeScreen() {
  return (
    <SafeAreaView style={commonStyles.fullScreen}>
      <View style={commonStyles.centerContent}>
        <Text>Home Screen</Text>
      </View>
    </SafeAreaView>
  );
}
