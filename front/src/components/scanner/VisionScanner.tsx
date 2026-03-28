import React, { useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Button, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Message, useLLM } from 'react-native-executorch';
import { LFM2_VL_1_6B_QUANTIZED } from '../../constants/models';
import { CameraPreview } from '../camera/CameraPreview';

export const VisionScanner = () => {
    const llm = useLLM({ model: LFM2_VL_1_6B_QUANTIZED });
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    const handlePhotoCaptured = async (uri: string) => {
        setCapturedImage(uri);
        
        if (!llm.isReady) {
            console.warn('Model is not ready yet');
            return;
        }

        const chat: Message[] = [
            { role: 'system', content: 'You are a helpful assistant that can see images.' },
            { role: 'user', content: '<image>\nDescribe what you see in this image.', mediaPath: uri },
        ];

        try {
            await llm.generate(chat);
        } catch (error) {
            console.error('Generation failed:', error);
        }
    };

    if (llm.error) {
        return (
            <View style={styles.center}>
                <Text style={{ color: 'red' }}>Error: {llm.error.message}</Text>
            </View>
        );
    }

    if (!llm.isReady) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#208AEF" />
                <Text style={styles.loadingText}>Loading model ({(llm.downloadProgress * 100).toFixed(0)}%)...</Text>
                <Text style={styles.hint}>
                    Large models (1.6B) can take a minute to load on the first run.
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {!capturedImage ? (
                <CameraPreview 
                    onPhotoCaptured={handlePhotoCaptured} 
                    isProcessing={llm.isGenerating} 
                />
            ) : (
                <View style={styles.resultContainer}>
                    <Image 
                        source={{ uri: capturedImage }} 
                        style={styles.previewImage}
                        contentFit="cover"
                        transition={200}
                    />
                    
                    <ScrollView style={styles.responseContainer}>
                        <Text style={styles.label}>AI Analysis:</Text>
                        {llm.isGenerating && !llm.response ? (
                            <View style={styles.generatingState}>
                                <ActivityIndicator size="small" color="#fff" />
                                <Text style={styles.generatingText}>Analyzing image...</Text>
                            </View>
                        ) : (
                            <Text style={styles.responseText}>
                                {llm.response || "Waiting for analysis..."}
                            </Text>
                        )}
                    </ScrollView>
                    
                    <View style={styles.buttonWrapper}>
                        <Button 
                            title="Take another photo" 
                            onPress={() => {
                                setCapturedImage(null);
                                llm.interrupt();
                            }} 
                            disabled={llm.isGenerating && !llm.response}
                        />
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#000',
    },
    center: {
        flex: 1,
        padding: 20, 
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 400,
    },
    loadingText: {
        marginTop: 10,
        fontWeight: '600',
    },
    hint: {
        fontSize: 12, 
        color: 'gray', 
        marginTop: 8,
        textAlign: 'center',
    },
    resultContainer: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    previewImage: {
        width: '100%',
        height: 300,
        backgroundColor: '#333',
    },
    responseContainer: {
        flex: 1,
        padding: 20,
    },
    label: {
        color: '#aaa',
        fontSize: 12,
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 1,
    },
    responseText: {
        color: 'white',
        fontSize: 16,
        lineHeight: 24,
    },
    generatingState: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    generatingText: {
        color: '#208AEF',
        fontSize: 14,
    },
    buttonWrapper: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#333',
    }
});
