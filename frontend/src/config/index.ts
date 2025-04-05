/**
 * Application configuration
 */

// Backend API URL from environment variables
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

// Version information
export const APP_VERSION = '0.1.0';

// Other configuration values
export const CONFIG = {
  // Number of milliseconds to poll for API health status
  apiHealthPollInterval: 30000,
};
