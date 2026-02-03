'use client';

import { useState } from 'react';
import { VariationAxis, Variation, PromptAnalysis } from '@/types';

interface VariationGeneratorProps {
  basePrompt: PromptAnalysis | null;
  onGenerateVariations: (lockedAxes: VariationAxis[], variationAxes: VariationSettings[]) => void;
  variations: Variation[];
  isGenerating: boolean;
}

interface VariationSettings {
  axis: VariationAxis;
  options: string[];
}

const variationOptions: Record<VariationAxis, { label: string; icon: string; presets: string[] }> = {
  lighting: {
    label: 'Lighting',
    icon: '💡',
    presets: ['soft natural', 'dramatic', 'golden hour', 'studio', 'neon', 'candlelit', 'overcast'],
  },
  colorScheme: {
    label: 'Color Scheme',
    icon: '🎨',
    presets: ['warm tones', 'cool tones', 'monochromatic', 'vibrant', 'muted', 'pastel', 'high contrast'],
  },
  expression: {
    label: 'Expression',
    icon: '😊',
    presets: ['neutral', 'confident', 'joyful', 'contemplative', 'intense', 'serene', 'mysterious'],
  },
  style: {
    label: 'Style',
    icon: '✨',
    presets: ['photorealistic', 'cinematic', 'editorial', 'minimalist', 'vintage', 'modern', 'artistic'],
  },
  mood: {
    label: 'Mood',
    icon: '🌈',
    presets: ['energetic', 'calm', 'dramatic', 'romantic', 'professional', 'playful', 'mysterious'],
  },
  composition: {
    label: 'Composition',
    icon: '📐',
    presets: ['centered', 'rule of thirds', 'symmetrical', 'dynamic', 'minimal', 'layered', 'close-up'],
  },
};

export default function VariationGenerator({
  basePrompt,
  onGenerateVariations,
  variations,
  isGenerating,
}: VariationGeneratorProps) {
  const [lockedAxes, setLockedAxes] = useState<VariationAxis[]>(['composition', 'style']);
  const [selectedVariations, setSelectedVariations] = useState<VariationSettings[]>([
    { axis: 'lighting', options: ['soft natural', 'dramatic'] },
  ]);
  const [variationCount, setVariationCount] = useState(4);

  if (!basePrompt) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        </div>
        <p className="text-gray-500">Analyze an image first to generate variations</p>
      </div>
    );
  }

  const toggleLock = (axis: VariationAxis) => {
    setLockedAxes((prev) =>
      prev.includes(axis) ? prev.filter((a) => a !== axis) : [...prev, axis]
    );
  };

  const addVariationAxis = (axis: VariationAxis) => {
    if (!selectedVariations.find((v) => v.axis === axis)) {
      setSelectedVariations([
        ...selectedVariations,
        { axis, options: variationOptions[axis].presets.slice(0, 2) },
      ]);
    }
  };

  const removeVariationAxis = (axis: VariationAxis) => {
    setSelectedVariations(selectedVariations.filter((v) => v.axis !== axis));
  };

  const toggleOption = (axis: VariationAxis, option: string) => {
    setSelectedVariations((prev) =>
      prev.map((v) => {
        if (v.axis !== axis) return v;
        const newOptions = v.options.includes(option)
          ? v.options.filter((o) => o !== option)
          : [...v.options, option];
        return { ...v, options: newOptions };
      })
    );
  };

  const handleGenerate = () => {
    onGenerateVariations(lockedAxes, selectedVariations);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Variation Generator</h3>
        <p className="text-sm text-gray-500">Control what stays fixed and what changes</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Locked Attributes */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <span>🔒</span> Keep Fixed
          </h4>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(variationOptions) as VariationAxis[]).map((axis) => (
              <button
                key={axis}
                onClick={() => toggleLock(axis)}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium transition-all
                  ${lockedAxes.includes(axis)
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {variationOptions[axis].icon} {variationOptions[axis].label}
              </button>
            ))}
          </div>
        </div>

        {/* Variation Axes */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <span>🔄</span> Vary These
          </h4>

          {/* Add axis buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(Object.keys(variationOptions) as VariationAxis[])
              .filter((axis) => !selectedVariations.find((v) => v.axis === axis) && !lockedAxes.includes(axis))
              .map((axis) => (
                <button
                  key={axis}
                  onClick={() => addVariationAxis(axis)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                >
                  + {variationOptions[axis].label}
                </button>
              ))}
          </div>

          {/* Selected variation axes */}
          <div className="space-y-4">
            {selectedVariations.map(({ axis, options }) => (
              <div key={axis} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-800 flex items-center gap-2">
                    {variationOptions[axis].icon} {variationOptions[axis].label}
                  </span>
                  <button
                    onClick={() => removeVariationAxis(axis)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {variationOptions[axis].presets.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => toggleOption(axis, preset)}
                      className={`
                        px-3 py-1.5 rounded-lg text-sm transition-all
                        ${options.includes(preset)
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'
                        }
                      `}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Variation count */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Number of Variations</h4>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="2"
              max="12"
              value={variationCount}
              onChange={(e) => setVariationCount(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-lg font-semibold text-primary-600 w-8 text-center">
              {variationCount}
            </span>
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || selectedVariations.length === 0}
          className={`
            w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2
            ${isGenerating || selectedVariations.length === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-primary-500 text-white hover:bg-primary-600 shadow-md hover:shadow-lg'
            }
          `}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              Generate {variationCount} Variations
            </>
          )}
        </button>
      </div>

      {/* Variations display */}
      {variations.length > 0 && (
        <div className="border-t border-gray-200 p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Generated Variations</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {variations.map((variation) => (
              <div
                key={variation.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">{variation.name}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(variation.modifiedPrompt)}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-2 line-clamp-3 font-mono bg-white p-2 rounded border border-gray-100">
                  {variation.modifiedPrompt}
                </p>
                <div className="flex flex-wrap gap-1">
                  {variation.changelog.map((change, i) => (
                    <span
                      key={i}
                      className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full"
                    >
                      {change}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
