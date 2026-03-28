// src/constants/Models.ts

export const LFM2_VL_1_6B_QUANTIZED = {
  modelName: "lfm2.5-vl-1.6b-quantized",
  modelSource: "https://huggingface.co/software-mansion/react-native-executorch-lfm2.5-VL-1.6B/resolve/v0.8.0/quantized/lfm2_5_vl_1_6b_8da4w_xnnpack.pte",
  tokenizerConfigSource: "https://huggingface.co/software-mansion/react-native-executorch-lfm2.5-VL-1.6B/resolve/v0.8.0/tokenizer_config.json",
  tokenizerSource: "https://huggingface.co/software-mansion/react-native-executorch-lfm2.5-VL-1.6B/resolve/v0.8.0/tokenizer.json",
  capabilities: ["vision"] as const,
}as const;