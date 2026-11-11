import { Redirect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingScreen } from '@/components/common/LoadingScreen';

/**
 * Entry point: redirect to dashboard if authenticated, login otherwise.
 * AuthProvider starts with isLoading=true while restoring the session,
 * so we show a spinner rather than flashing the wrong screen.
 */
export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (user) {
    return <Redirect href={user.role === 'ADMIN' ? '/admin' : '/dashboard'} />;
  }
  return <Redirect href="/(auth)/login" />;
}
