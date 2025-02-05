import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useAuthContext } from '../contexts/AuthContext';
import type { LoginPayload, SignupPayload } from '../types/api';

export function useAuth() {
  const { setAuth, clearAuth } = useAuthContext();

  const login = useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      setAuth(data);
    },
  });

  const signup = useMutation({
    mutationFn: (payload: SignupPayload) => authApi.signup(payload),
    onSuccess: (data) => {
      setAuth(data);
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      await authApi.logout();
      await clearAuth();
    },
  });

  return {
    login,
    signup,
    logout,
  };
}
