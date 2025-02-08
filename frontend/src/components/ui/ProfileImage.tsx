import { useState } from 'react';
import { Image, TouchableOpacity, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ProfileImageProps {
  size?: number;
  imageUrl?: string | null;
  userId: string;
  onImageSelected?: (uri: string) => Promise<void>;
  editable?: boolean;
  style?: ViewStyle;
}

export function ProfileImage({ 
  size = 100, 
  imageUrl, 
  userId,
  onImageSelected,
  editable = false,
  style
}: ProfileImageProps) {
  const [isLoading, setIsLoading] = useState(false);

  const getFallbackUrl = () => {
    return `https://api.dicebear.com/7.x/big-smile/png?seed=${userId}&size=${size * 2}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
  };

  const handleImagePick = async () => {
    if (!editable || !onImageSelected) return;

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access media library was denied');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setIsLoading(true);
        await onImageSelected(result.assets[0].uri);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setIsLoading(false);
    }
  };

  const imageSource = imageUrl 
    ? { uri: imageUrl }
    : { uri: getFallbackUrl() };

  return (
    <TouchableOpacity 
      onPress={handleImagePick}
      disabled={!editable || isLoading}
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
        style
      ]}
    >
      <Image
        source={imageSource}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: size / 2 }
        ]}
      />
      {isLoading && (
        <ActivityIndicator 
          style={StyleSheet.absoluteFill} 
          color="#000"
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
}); 