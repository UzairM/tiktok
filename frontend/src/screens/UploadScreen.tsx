import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { commonStyles } from '../styles/common';

export function UploadScreen() {
  return (
    <SafeAreaView style={commonStyles.fullScreen}>
      <View style={commonStyles.centerContent}>
        <Text style={commonStyles.title}>Upload Video</Text>
        <Text style={commonStyles.subtitle}>Record or select a video to upload</Text>
        <AnimatedButton title="Record Video" onPress={() => console.log('Record video')} />
        <AnimatedButton
          title="Select from Gallery"
          onPress={() => console.log('Select video')}
          variant="secondary"
        />
      </View>
    </SafeAreaView>
  );
}
