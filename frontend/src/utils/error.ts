import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

export function getErrorMessage(error: unknown): ApiError {
  if (error instanceof Error) {
    // Handle Axios errors
    const axiosError = error as AxiosError<{ message: string; code?: string; field?: string }>;
    if (axiosError.response?.data) {
      return {
        message: axiosError.response.data.message || 'Something went wrong',
        code: axiosError.response.data.code,
        field: axiosError.response.data.field,
      };
    }
    // Handle network errors
    if (axiosError.message === 'Network Error') {
      return {
        message: 'Unable to connect to server. Please check your internet connection.',
        code: 'NETWORK_ERROR',
      };
    }
    return {
      message: axiosError.message,
    };
  }
  return {
    message: 'An unexpected error occurred',
  };
}
