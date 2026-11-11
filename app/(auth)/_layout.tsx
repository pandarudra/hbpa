import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingScreen } from '@/components/common/LoadingScreen';

/** Redirect authenticated users away from the login screen. */
export default function AuthLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (user) return <Redirect href="/(protected)/dashboard" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
