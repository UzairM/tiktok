import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { FeedScreen } from '../screens/FeedScreen'
import { ProfileScreen } from '../screens/ProfileScreen'
import { UploadScreen } from '../screens/UploadScreen'
import { PlantCollectionScreen } from '../screens/PlantCollectionScreen'
import { Plant } from '../types/plant'

export type RootStackParamList = {
  Feed: undefined
  Upload: undefined
  Profile: undefined
  Plants: undefined
  PlantDetail: { plantId: string }
}

const Tab = createBottomTabNavigator<RootStackParamList>()
const Stack = createNativeStackNavigator<RootStackParamList>()

function PlantStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Plants" component={PlantCollectionScreen} />
    </Stack.Navigator>
  )
}

export function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap

          if (route.name === 'Feed') {
            iconName = focused ? 'home' : 'home-outline'
          } else if (route.name === 'Upload') {
            iconName = focused ? 'add-circle' : 'add-circle-outline'
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline'
          } else if (route.name === 'Plants') {
            iconName = focused ? 'leaf' : 'leaf-outline'
          } else {
            iconName = 'help-outline'
          }

          return <Ionicons name={iconName} size={size} color={color} />
        }
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Upload" component={UploadScreen} />
      <Tab.Screen name="Plants" component={PlantStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
} 