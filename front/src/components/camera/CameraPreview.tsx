import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { BottomControls } from './BottomControls';
import { CaptureButton } from './CaptureButton';

export interface CameraPreviewProps {
  onPhotoCaptured: (uri: string) => void;
  isProcessing?: boolean;
}

export function CameraPreview({ onPhotoCaptured, isProcessing }: CameraPreviewProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    // Uprawnienia się ładują
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    // Brak uprawnień do aparatu
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  const handleCapture = async () => {
    if (cameraRef.current && !isProcessing) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: true,
        });
        if (photo) {
          onPhotoCaptured(photo.uri);
        }
      } catch (error) {
        console.error("Failed to take photo:", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} />
      <BottomControls>
        <CaptureButton onCapture={handleCapture} disabled={isProcessing} />
      </BottomControls>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    borderRadius: 16,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 20,
    color: 'white',
  },
});
