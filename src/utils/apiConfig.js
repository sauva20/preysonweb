/**
 * Smart API Configuration Helper
 * Automatically detects whether the app is running locally or in production.
 */
export const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return 'https://api.preysonmoto.com/api';
    }
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

export const getBackendUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return 'https://api.preysonmoto.com';
    }
  }
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
};
