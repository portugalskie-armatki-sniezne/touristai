import { NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { useColorScheme, StyleSheet, View, Platform } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const cyanColor = '#00FFFF';

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={cyanColor}
      labelStyle={{ 
        default: { color: colors.textSecondary },
        selected: { color: cyanColor }
      }}>
      
      <NativeTabs.Trigger name="visited">
        <NativeTabs.Trigger.Label>Visited</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/monument.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Camera</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/camera.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/profile.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

    </NativeTabs>
  );
}

const styles = StyleSheet.create({
  cameraWrapper: {
    backgroundColor: '#000',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    // Uniesienie przycisku
    marginTop: Platform.OS === 'ios' ? -20 : -30,
    // Dodatkowa przestrzeń dla ikony wewnątrz koła
    padding: 12,
  }
});
