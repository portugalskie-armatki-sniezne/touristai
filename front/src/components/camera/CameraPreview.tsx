import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { SymbolView } from 'expo-symbols';

export interface CameraPreviewProps {
  onPhotoCaptured: (uri: string) => void;
  isProcessing?: boolean;
}

export function CameraPreview({ onPhotoCaptured, isProcessing }: CameraPreviewProps) {
  
  const handleCamera = async () => {
    if (isProcessing) return;
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
      });
      if (!result.didCancel && result.assets && result.assets[0]?.uri) {
        onPhotoCaptured(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Failed to launch camera:", error);
    }
  };

  const handleLibrary = async () => {
    if (isProcessing) return;
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });
      if (!result.didCancel && result.assets && result.assets[0]?.uri) {
        onPhotoCaptured(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Failed to launch library:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={styles.option} 
          onPress={handleCamera}
          disabled={isProcessing}
          activeOpacity={0.7}
        >
          <View style={styles.iconCircle}>
            <SymbolView name="camera.fill" size={32} tintColor="#208AEF" />
          </View>
          <Text style={styles.text}>Take Photo</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity 
          style={styles.option} 
          onPress={handleLibrary}
          disabled={isProcessing}
          activeOpacity={0.7}
        >
          <View style={styles.iconCircle}>
            <SymbolView name="photo.on.rectangle.angled" size={32} tintColor="#208AEF" />
          </View>
          <Text style={styles.text}>Library</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.subtext}>AI will analyze your selection instantly</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 24,
    padding: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  option: {
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: '#222',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  subtext: {
    color: '#444',
    fontSize: 13,
    marginTop: 40,
  },
});
