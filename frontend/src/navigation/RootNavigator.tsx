import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from './types';
import { FeedScreen } from '../screens/FeedScreen';
import { UploadScreen } from '../screens/UploadScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { VideoDetailScreen } from '../screens/VideoDetail';
import { MediaDetailsScreen } from '../screens/MediaDetailsScreen';
import { GrowthAnalysisScreen } from '../screens/GrowthAnalysisScreen';
import { useAuth } from '../contexts/AuthContext';
import { commonStyles } from '../styles/common';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootStackParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Feed') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Upload') {
            iconName = focused ? 'plus-circle' : 'plus-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
        },
      })}
      initialRouteName="Profile"
    >
      {/* <Tab.Screen name="Feed" component={FeedScreen} /> */}
      <Tab.Screen name="Upload" component={UploadScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={commonStyles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="VideoDetail"
              component={VideoDetailScreen}
              options={{ title: 'Video Details' }}
            />
            <Stack.Screen
              name="MediaDetails"
              component={MediaDetailsScreen}
              options={{ 
                headerShown: false,
                presentation: 'fullScreenModal',
                animation: 'slide_from_right'
              }}
            />
            <Stack.Screen
              name="GrowthAnalysis"
              component={GrowthAnalysisScreen}
              options={{
                presentation: 'card',
                animation: 'slide_from_right'
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
