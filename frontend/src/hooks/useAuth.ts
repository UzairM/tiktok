import { useMutation } from '@tanstack/react-query';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../config/firebase';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials extends LoginCredentials {
  username: string;
}

export function useAuth() {
  const login = useMutation({
    mutationFn: async ({ email, password }: LoginCredentials) => {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    }
  });

  const signup = useMutation({
    mutationFn: async ({ email, password, username }: SignupCredentials) => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: username
      });
      return userCredential.user;
    }
  });

  return {
    login,
    signup
  };
}
