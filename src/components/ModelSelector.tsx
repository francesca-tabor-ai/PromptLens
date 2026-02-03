'use client';

import { TargetModel } from '@/types';

interface ModelSelectorProps {
  selectedModel: TargetModel;
  onModelChange: (model: TargetModel) => void;
}

const models: { id: TargetModel; name: string; description: string }[] = [
  { id: 'generic', name: 'Generic', description: 'Universal prompt format' },
  { id: 'midjourney', name: 'Midjourney', description: 'Optimized for MJ v5/v6' },
  { id: 'stable-diffusion', name: 'Stable Diffusion', description: 'SDXL compatible' },
  { id: 'dalle', name: 'DALL-E', description: 'OpenAI format' },
];

export default function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {models.map((model) => (
        <button
          key={model.id}
          onClick={() => onModelChange(model.id)}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${selectedModel === model.id
              ? 'bg-primary-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
          title={model.description}
        >
          {model.name}
        </button>
      ))}
    </div>
  );
}
