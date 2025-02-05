export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationError {
  email?: string;
  password?: string;
  username?: string;
}

export function validateAuth(values: {
  email: string;
  password: string;
  username?: string;
  isLogin?: boolean;
}): ValidationError {
  const errors: ValidationError = {};

  // Email validation
  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(values.email)) {
    errors.email = 'Invalid email format';
  }

  // Password validation
  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  // Username validation (only for signup)
  if (!values.isLogin && !values.username) {
    errors.username = 'Username is required';
  }

  return errors;
}
