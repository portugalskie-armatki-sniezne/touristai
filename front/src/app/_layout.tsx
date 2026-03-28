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

const RootNavigator = () => {
  // const { user, loading } = useAuth();

  // if (loading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
  //       <ActivityIndicator size="large" color="#208AEF" />
  //     </View>
  //   );
  // }

  // if (!user) {
  //   return <LoginScreen />;
  // }

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
