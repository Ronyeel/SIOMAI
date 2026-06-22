import Constants from 'expo-constants';

/**
 * Dynamically resolves the backend base URL.
 * In development mode with Expo Go, this automatically uses the host computer's IP address.
 */
const getBackendUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    return `http://${hostIp}:3000`;
  }
  // Default fallback local development IP
  return 'http://192.168.1.8:3000';
};

export const API_URL = getBackendUrl();

export const SUPABASE_URL = 'https://jwqrbyhpnnnvosqogbry.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3cXJieWhwbm5udm9zcW9nYnJ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDg5MTk4MiwiZXhwIjoyMDk2NDY3OTgyfQ.9JpYgVQrPtibNbLViHaTaxiHnCvXED8a41f93xttWHw';
