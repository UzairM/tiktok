import { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AnimatedButton } from '../components/ui';
import { uploadVideo } from '../api/videos';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

export function UploadScreen() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Please grant camera roll permissions to upload videos'
        );
      }
    })();
  }, []);

  const handleSelectVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'videos',
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploading(true);
        const video = result.assets[0];
        
        await uploadVideo({
          uri: video.uri,
          type: 'video/mp4',
          name: 'video.mp4',
        }, (progress) => {
          setUploadProgress(progress);
        });

        setIsUploading(false);
        navigation.navigate('Profile');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      Alert.alert('Error', 'Failed to upload video');
    }
  };

  return (
    <View style={styles.container}>
      <AnimatedButton
        title={isUploading ? `Uploading ${uploadProgress}%` : "Select Video"}
        onPress={handleSelectVideo}
        disabled={isUploading}
        isLoading={isUploading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
});
