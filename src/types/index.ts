export interface VisualPrompt {
  visualStorytelling: string;
  composition: string;
  depthOfField: string;
  lighting: string;
  colorScheme: string;
  objects: string;
  expression: string;
  actions: string;
  style: string;
  mood: string;
}

export interface PromptAnalysis {
  structured: VisualPrompt;
  fullPrompt: string;
  modelSpecific?: {
    midjourney?: string;
    stableDiffusion?: string;
    dalle?: string;
  };
}

export type VariationAxis =
  | 'lighting'
  | 'colorScheme'
  | 'expression'
  | 'style'
  | 'mood'
  | 'composition';

export interface VariationOption {
  axis: VariationAxis;
  label: string;
  values: string[];
}

export interface Variation {
  id: string;
  name: string;
  changedAxes: Record<VariationAxis, string>;
  modifiedPrompt: string;
  changelog: string[];
}

export interface ABTest {
  id: string;
  name: string;
  createdAt: Date;
  baseImage: string;
  basePrompt: PromptAnalysis;
  variations: Variation[];
  tags: string[];
}

export type TargetModel = 'midjourney' | 'stable-diffusion' | 'dalle' | 'generic';
