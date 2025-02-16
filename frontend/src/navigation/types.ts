import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MediaItem } from '../types/media';

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Feed: undefined;
  Upload: undefined;
  Profile: undefined;
  VideoDetail: { videoId: string };
  MediaDetails: { media: MediaItem };
  GrowthAnalysis: {
    plantId: string;
    plantName: string;
  };
  // Add other screen params as needed
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
