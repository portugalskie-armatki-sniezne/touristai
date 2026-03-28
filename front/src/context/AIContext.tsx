import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLLM } from 'react-native-executorch';
import { LFM2_VL_1_6B_QUANTIZED } from '../constants/models';

type AIContextType = {
  isReady: boolean;
  isGenerating: boolean;
  response: string;
  generate: (messages: any[]) => Promise<string>;
  downloadProgress: number;
};

const AIContext = createContext<AIContextType | null>(null);

export const AIProvider = ({ children }: { children: React.ReactNode }) => {
  const llm = useLLM({ model: LFM2_VL_1_6B_QUANTIZED });

  useEffect(() => {
    if (llm.isReady) {
      console.log('AI System: Model initialized and ready in background.');
    }
  }, [llm.isReady]);

  return (
    <AIContext.Provider value={{
      isReady: llm.isReady,
      isGenerating: llm.isGenerating,
      response: llm.response,
      generate: llm.generate,
      downloadProgress: llm.downloadProgress
    }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
