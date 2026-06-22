import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom Hook to consume AuthContext.
 * Ensures that the hook is only used within an AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
