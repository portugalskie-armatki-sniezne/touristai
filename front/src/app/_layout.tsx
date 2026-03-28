import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React from 'react';
import { useColorScheme, ActivityIndicator, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { LoginScreen } from '@/components/LoginScreen';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AIProvider } from '@/context/AIContext';

import { initExecutorch } from 'react-native-executorch';
import { ExpoResourceFetcher } from 'react-native-executorch-expo-resource-fetcher';

initExecutorch({ resourceFetcher: ExpoResourceFetcher });

import { PreferencesScreen } from '@/components/PreferencesScreen';

const RootNavigator = () => {
  const { user, loading, hasSeenPreferences } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#70E1E1" />
      </View>
    );
  }

  // Jeśli nie ma użytkownika, ZAWSZE pokazuj LoginScreen
  if (!user) {
    return <LoginScreen />;
  }

  // Jeśli jest użytkownik, ale nie widział preferencji, pokazuj PreferencesScreen
  if (!hasSeenPreferences) {
    return <PreferencesScreen />;
  }

  return (
    <>
      <AnimatedSplashOverlay />
      <AppTabs />
    </>
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AIProvider>
          <RootNavigator />
        </AIProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
