import { Message, useLLM } from 'react-native-executorch';
import { LFM2_VL_1_6B_QUANTIZED } from '../constants/models';
import { Button, View, Text, ActivityIndicator } from 'react-native';


export const VisionScanner = () => {
    const llm = useLLM({ model: LFM2_VL_1_6B_QUANTIZED });

    const handleGenerate = async () => {
        if (!llm.isReady) {
            console.warn('Model is not ready yet');
            return;
        }

        const chat: Message[] = [
            { role: 'system', content: 'You are a helpful assistant' },
            { role: 'user', content: 'Hi!' },
            { role: 'assistant', content: 'Hi!, how can I help you?' },
            { role: 'user', content: 'What is the meaning of life?' },
        ];

        // Chat completion - returns the generated response
        try {
            const response = await llm.generate(chat);
            console.log('Complete response:', response);
        } catch (error) {
            console.error('Generation failed:', error);
        }
    };

    if (llm.error) {
        return (
            <View style={{ padding: 20 }}>
                <Text style={{ color: 'red' }}>Error: {llm.error.message}</Text>
            </View>
        );
    }

    return (
        <View style={{ padding: 20, alignItems: 'center' }}>
            {!llm.isReady && (
                <View style={{ marginBottom: 20, alignItems: 'center' }}>
                    <ActivityIndicator size="large" />
                    <Text>Loading model ({(llm.downloadProgress * 100).toFixed(0)}%)...</Text>
                    <Text style={{ fontSize: 10, color: 'gray', marginTop: 5 }}>
                        Large models (1.6B) can take a minute to load.
                    </Text>
                </View>
            )}
            
            <Button 
                onPress={handleGenerate} 
                title={llm.isGenerating ? "Generating..." : "Generate!"} 
                disabled={!llm.isReady || llm.isGenerating} 
            />
            
            <Text style={{ marginTop: 20 }}>{llm.response}</Text>
        </View>
    );
}