import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image as RNImage, ActivityIndicator, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { SymbolView } from 'expo-symbols';
import * as Location from 'expo-location';

export const VisionScanner = () => {
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [analyzeResult, setAnalyzeResult] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Otwórz kamerę natychmiast przy montowaniu
    useEffect(() => {
        openCamera();
    }, []);

    const openCamera = async () => {
        try {
            const result = await launchCamera({ mediaType: 'photo', quality: 0.8 });
            if (!result.didCancel && result.assets?.[0]?.uri) {
                setCapturedImage(result.assets[0].uri);
                setAnalyzeResult(null); // Wyczyść poprzedni wynik przy nowym zdjęciu
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
                setAnalyzeResult(null); // Wyczyść poprzedni wynik przy nowym zdjęciu
            }
        } catch (error) {
            console.error('Library failed:', error);
        }
    };

    const analyzeImage = async () => {
        if (!capturedImage) return;

        setIsAnalyzing(true);
        setAnalyzeResult(null);

        try {
            // Pobieranie lokalizacji GPS
            let { status } = await Location.requestForegroundPermissionsAsync();
            let lat = '52.2297'; // Domyślne wartości jeśli nie przyznano uprawnień
            let lon = '21.0122';

            if (status === 'granted') {
                try {
                    const location = await Location.getCurrentPositionAsync({});
                    lat = location.coords.latitude.toString();
                    lon = location.coords.longitude.toString();
                } catch (locationError) {
                    console.warn('Could not fetch location:', locationError);
                }
            }

            const formData = new FormData();
            
            // Dołączenie obrazka do formularza
            const filename = capturedImage.split('/').pop() || 'photo.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;

            formData.append('image', {
                uri: capturedImage,
                name: filename,
                type: type,
            } as any);

            // Koordynaty z GPS
            formData.append('mag', lat);
            formData.append('long', lon);
            
            // Preferencje: informacje testowe o sztuce
            formData.append('preferences', JSON.stringify({ 
                focus: 'art',
                description: 'Tell me mostly about art and history related to this place.'
            }));

            // Adres API
            const apiUrl = 'http://10.0.2.2:8000/api/v1/uploads/analyze';

            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`API Error: ${response.status} - ${errText}`);
            }

            const data = await response.json();
            setAnalyzeResult(JSON.stringify(data, null, 2));

        } catch (error: any) {
            console.error('Analyze failed:', error);
            setAnalyzeResult(`Error: ${error.message || 'Unknown error occurred'}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Widok zdjęcia - Zajmuje całą górę */}
            <View style={styles.photoContainer}>
                {capturedImage ? (
                    <View style={{ flex: 1, width: '100%' }}>
                        <Image 
                            source={{ uri: capturedImage }} 
                            style={styles.fullImage} 
                            contentFit="cover" 
                        />
                        
                        <View style={styles.analyzeOverlay}>
                            <TouchableOpacity 
                                style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]} 
                                onPress={analyzeImage}
                                disabled={isAnalyzing}
                            >
                                {isAnalyzing ? (
                                    <ActivityIndicator color="#000" size="small" />
                                ) : (
                                    <SymbolView name="sparkles" size={20} tintColor="#000" />
                                )}
                                <Text style={styles.analyzeButtonText}>
                                    {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <RNImage 
                            source={require('@/assets/images/tabIcons/camera.png')} 
                            style={{ width: 48, height: 48, tintColor: '#333' }} 
                        />
                        <Text style={styles.emptyText}>Camera Ready</Text>
                    </View>
                )}
            </View>

            {/* Kontener na wynik analizy */}
            {analyzeResult && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultTitle}>Output:</Text>
                    <ScrollView style={styles.resultScroll} nestedScrollEnabled={true}>
                        <Text style={styles.resultText}>{analyzeResult}</Text>
                    </ScrollView>
                </View>
            )}

            {/* Panel dolny - Tylko przyciski akcji */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.button} onPress={openCamera}>
                    <RNImage 
                        source={require('@/assets/images/tabIcons/camera.png')} 
                        style={{ width: 24, height: 24, tintColor: '#000' }} 
                    />
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
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24, // Extra padding to sit above the navigation bar comfortably
        gap: 16,
        backgroundColor: '#000',
        borderTopWidth: 1,
        borderTopColor: '#111',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
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
    },
    analyzeOverlay: {
        position: 'absolute',
        bottom: 120, // Zwiększony odstęp od dołu, aby nie chował się za czarnym paskiem nav
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
    },
    analyzeButton: {
        flexDirection: 'row',
        backgroundColor: '#00FFFF',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 24,
        alignItems: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    analyzeButtonDisabled: {
        opacity: 0.7,
    },
    analyzeButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resultContainer: {
        maxHeight: 200,
        backgroundColor: '#111',
        borderTopWidth: 1,
        borderTopColor: '#222',
        padding: 16,
        paddingBottom: 100, // Zapewnia miejsce nad dolnym menu akcji
    },
    resultTitle: {
        color: '#00FFFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    resultScroll: {
        flexGrow: 0,
    },
    resultText: {
        color: '#FFF',
        fontSize: 13,
        fontFamily: 'monospace',
    }
});