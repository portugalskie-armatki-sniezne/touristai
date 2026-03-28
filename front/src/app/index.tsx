import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { VisionScanner } from '@/components/scanner/VisionScanner';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function CameraScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  
  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: safeAreaInsets.top,
      paddingLeft: safeAreaInsets.left,
      paddingRight: safeAreaInsets.right,
      paddingBottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
    },
    ios: {
        paddingBottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <ThemedView style={[styles.container, contentPlatformStyle]}>
      <ThemedView style={styles.wrapper}>
        <VisionScanner />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  wrapper: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
  },
});
