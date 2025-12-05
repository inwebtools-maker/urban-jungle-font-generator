export interface StylePreset {
  id: string;
  name: string;
  description: string;
  promptTemplate: string;
  previewColor: string;
}

export interface GenerationHistoryItem {
  id: string;
  text: string;
  styleName: string;
  imageUrl: string;
  timestamp: number;
}
