import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/components/auth/AuthContext';

function RootLayoutContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or loading spinner
  }

  if (!user) {
    // Show only Login and Signup screens for unauthenticated users
    return (
      <Stack
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" />
        <Stack.Screen name="Signup" />
      </Stack>
    );
  }

  // Authenticated users see the main app (tabs)
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <RootLayoutContent />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}