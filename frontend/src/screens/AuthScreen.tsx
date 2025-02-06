import { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../components/ui/Input';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { useAuth } from '../hooks/useAuth';

interface ValidationError {
  email?: string;
  password?: string;
  username?: string;
}

function validateAuth({ email, password, username, isLogin }: { 
  email: string; 
  password: string; 
  username: string; 
  isLogin: boolean; 
}): ValidationError {
  const errors: ValidationError = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'Email is invalid';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (!isLogin && !username) {
    errors.username = 'Username is required';
  }

  return errors;
}

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errors, setErrors] = useState<ValidationError>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const { login, signup } = useAuth();
  const isLoading = login.isPending || signup.isPending;

  const handleSubmit = async () => {
    setApiError(null);
    setErrors({});

    const validationErrors = validateAuth({ email, password, username, isLogin });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (isLogin) {
        await login.mutateAsync({ email, password });
      } else {
        await signup.mutateAsync({ email, password, username });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setApiError(message);
    }
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setApiError(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        {apiError && <Text style={styles.errorMessage}>{apiError}</Text>}
        {!isLogin && (
          <Input
            label="Username"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setErrors((prev) => ({ ...prev, username: undefined }));
            }}
            placeholder="Enter username"
            error={errors.username}
          />
        )}
        <Input
          label="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          placeholder="Enter email"
          error={errors.email}
        />
        <Input
          label="Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          placeholder="Enter password"
          secureTextEntry
          error={errors.password}
        />
        <AnimatedButton
          title={isLogin ? 'Login' : 'Sign Up'}
          onPress={handleSubmit}
          disabled={isLoading}
          isLoading={isLoading}
        />
        <AnimatedButton
          title={isLogin ? 'Need an account? Sign Up' : 'Have an account? Login'}
          onPress={handleToggleMode}
          variant="secondary"
          disabled={isLoading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  form: {
    padding: 20,
  },
  loader: {
    marginTop: 10,
  },
  errorMessage: {
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
});
