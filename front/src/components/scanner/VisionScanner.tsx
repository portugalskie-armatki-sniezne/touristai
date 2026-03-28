import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { SymbolView } from 'expo-symbols';

export const VisionScanner = () => {
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    // Otwórz kamerę natychmiast przy montowaniu
    useEffect(() => {
        openCamera();
    }, []);

    const openCamera = async () => {
        try {
            const result = await launchCamera({ mediaType: 'photo', quality: 0.8 });
            if (!result.didCancel && result.assets?.[0]?.uri) {
                setCapturedImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Camera failed:', error);
        }
    };

    const openLibrary = async () => {
        try {
            const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
            if (!result.didCancel && result.assets?.[0]?.uri) {
                setCapturedImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Library failed:', error);
        }
    };

    return (
        <View style={styles.container}>
            {/* Widok zdjęcia - Zajmuje całą górę */}
            <View style={styles.photoContainer}>
                {capturedImage ? (
                    <Image 
                        source={{ uri: capturedImage }} 
                        style={styles.fullImage} 
                        contentFit="cover" 
                    />
                ) : (
                    <View style={styles.emptyState}>
                        <SymbolView name="camera.viewfinder" size={48} tintColor="#333" />
                        <Text style={styles.emptyText}>Camera Ready</Text>
                    </View>
                )}
            </View>

            {/* Panel dolny - Tylko przyciski akcji */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.button} onPress={openCamera}>
                    <SymbolView name="camera.fill" size={24} tintColor="#000" />
                    <Text style={styles.buttonText}>New Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.libraryButton]} onPress={openLibrary}>
                    <SymbolView name="photo.on.rectangle" size={24} tintColor="#00FFFF" />
                    <Text style={[styles.buttonText, { color: '#00FFFF' }]}>Library</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    photoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#050505',
    },
    fullImage: {
        width: '100%',
        height: '100%',
    },
    emptyState: {
        alignItems: 'center',
        gap: 12,
    },
    emptyText: {
        color: '#333',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    footer: {
        flexDirection: 'row',
        padding: 24,
        gap: 16,
        backgroundColor: '#000',
        borderTopWidth: 1,
        borderTopColor: '#111',
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        height: 56,
        backgroundColor: '#00FFFF',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    libraryButton: {
        backgroundColor: '#111',
        borderWidth: 1,
        borderColor: '#222',
    },
    buttonText: {
        color: '#000',
        fontSize: 15,
        fontWeight: 'bold',
    }
});