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
import { useAuth } from '../contexts/AuthContext';
import { commonStyles } from '../styles/common';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootStackParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: '#ff2d55',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: '#000',
        }
      }}
    >
      <Tab.Screen 
        name="Feed" 
        component={FeedScreen}
        options={{ 
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="Upload" 
        component={UploadScreen}
        options={{ 
          tabBarLabel: 'Upload',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="plus-box" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={commonStyles.fullScreen}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen 
              name="VideoDetail" 
              component={VideoDetailScreen}
              options={{
                headerShown: true,
                presentation: 'modal',
                title: 'Video',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
