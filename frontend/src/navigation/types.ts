import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Feed: undefined;
  Upload: undefined;
  Profile: undefined;
  // Add other screen params as needed
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
