import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UploadScreen } from '../screens/UploadScreen';

const Stack = createNativeStackNavigator();

export function MainNavigator() {
  return (
    <Stack.Navigator>
      {/* ... other screens ... */}
      <Stack.Screen 
        name="Upload" 
        component={UploadScreen}
        options={{
          title: 'Upload Video',
          presentation: 'modal'
        }}
      />
    </Stack.Navigator>
  );
} 