'use client';

import { useState, useCallback } from 'react';
import ImageUpload from '@/components/ImageUpload';
import ModelSelector from '@/components/ModelSelector';
import PromptDisplay from '@/components/PromptDisplay';
import VariationGenerator from '@/components/VariationGenerator';
import ABTestWorkspace from '@/components/ABTestWorkspace';
import {
  PromptAnalysis,
  VisualPrompt,
  TargetModel,
  Variation,
  ABTest,
  VariationAxis,
} from '@/types';

interface VariationSettings {
  axis: VariationAxis;
  options: string[];
}

export default function Home() {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [targetModel, setTargetModel] = useState<TargetModel>('generic');
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);
  const [tests, setTests] = useState<ABTest[]>([]);
  const [activeTab, setActiveTab] = useState<'analyze' | 'variations' | 'tests'>('analyze');

  const handleImageUpload = useCallback(async (imageData: string) => {
    if (!imageData) {
      setCurrentImage(null);
      setAnalysis(null);
      setVariations([]);
      return;
    }

    setCurrentImage(imageData);
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData, targetModel }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [targetModel]);

  const handleModelChange = useCallback((model: TargetModel) => {
    setTargetModel(model);
    // Re-analyze if we have an image
    if (currentImage && analysis) {
      handleImageUpload(currentImage);
    }
  }, [currentImage, analysis, handleImageUpload]);

  const handlePromptEdit = useCallback((field: keyof VisualPrompt, value: string) => {
    if (!analysis) return;

    const updatedStructured = { ...analysis.structured, [field]: value };
    const updatedFullPrompt = Object.values(updatedStructured)
      .filter((v) => v && v !== 'N/A' && v !== 'static scene')
      .join('. ');

    setAnalysis({
      ...analysis,
      structured: updatedStructured,
      fullPrompt: updatedFullPrompt,
    });
  }, [analysis]);

  const handleGenerateVariations = useCallback(async (
    lockedAxes: VariationAxis[],
    variationSettings: VariationSettings[]
  ) => {
    if (!analysis) return;

    setIsGeneratingVariations(true);

    try {
      const response = await fetch('/api/variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basePrompt: analysis,
          lockedAxes,
          variationSettings,
          count: 4,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate variations');
      }

      const result = await response.json();
      setVariations(result.variations);
      setActiveTab('variations');
    } catch (error) {
      console.error('Variation error:', error);
      alert('Failed to generate variations. Please try again.');
    } finally {
      setIsGeneratingVariations(false);
    }
  }, [analysis]);

  const handleCreateTest = useCallback((name: string, tags: string[]) => {
    if (!currentImage || !analysis || variations.length === 0) return;

    const newTest: ABTest = {
      id: `test_${Date.now()}`,
      name,
      createdAt: new Date(),
      baseImage: currentImage,
      basePrompt: analysis,
      variations,
      tags,
    };

    setTests((prev) => [newTest, ...prev]);
  }, [currentImage, analysis, variations]);

  const handleExport = useCallback((test: ABTest, format: 'json' | 'csv') => {
    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(test, null, 2);
      filename = `${test.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
      mimeType = 'application/json';
    } else {
      // CSV format
      const headers = ['Name', 'Prompt', 'Changes'];
      const rows = [
        ['Base', test.basePrompt.fullPrompt, '-'],
        ...test.variations.map((v) => [
          v.name,
          v.modifiedPrompt,
          v.changelog.join('; '),
        ]),
      ];

      content = [headers, ...rows].map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
      ).join('\n');
      filename = `${test.name.replace(/\s+/g, '_')}_${Date.now()}.csv`;
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PromptLens</h1>
                <p className="text-xs text-gray-500">Image to Visual Prompt</p>
              </div>
            </div>
            <div className="hidden sm:block">
              <ModelSelector
                selectedModel={targetModel}
                onModelChange={handleModelChange}
              />
            </div>
          </div>
          {/* Mobile model selector */}
          <div className="sm:hidden mt-4">
            <ModelSelector
              selectedModel={targetModel}
              onModelChange={handleModelChange}
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 pb-4">
          {[
            { id: 'analyze' as const, label: 'Analyze', icon: '🔍' },
            { id: 'variations' as const, label: 'Variations', icon: '🔄', badge: variations.length },
            { id: 'tests' as const, label: 'A/B Tests', icon: '📊', badge: tests.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                ${activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`
                    text-xs px-1.5 py-0.5 rounded-full
                    ${activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-300 text-gray-700'
                    }
                  `}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'analyze' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left column: Image upload */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Upload Image
                </h2>
                <ImageUpload
                  onImageUpload={handleImageUpload}
                  currentImage={currentImage}
                />
              </div>

              {/* Quick stats */}
              {analysis && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                    <p className="text-2xl font-bold text-primary-600">10</p>
                    <p className="text-xs text-gray-500">Components</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                    <p className="text-2xl font-bold text-primary-600">{variations.length}</p>
                    <p className="text-xs text-gray-500">Variations</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                    <p className="text-2xl font-bold text-primary-600">{tests.length}</p>
                    <p className="text-xs text-gray-500">Tests</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right column: Prompt display */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Visual Prompt
              </h2>
              <PromptDisplay
                analysis={analysis}
                isLoading={isAnalyzing}
                onPromptEdit={handlePromptEdit}
              />
            </div>
          </div>
        )}

        {activeTab === 'variations' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Source image (smaller) */}
            <div className="lg:col-span-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Source Image
              </h2>
              {currentImage ? (
                <img
                  src={currentImage}
                  alt="Source"
                  className="w-full h-auto max-h-[300px] object-contain rounded-lg shadow-sm border border-gray-200"
                />
              ) : (
                <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
                  No image uploaded
                </div>
              )}
            </div>

            {/* Right: Variation generator */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Generate Variations
              </h2>
              <VariationGenerator
                basePrompt={analysis}
                onGenerateVariations={handleGenerateVariations}
                variations={variations}
                isGenerating={isGeneratingVariations}
              />
            </div>
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="max-w-4xl mx-auto">
            <ABTestWorkspace
              tests={tests}
              onCreateTest={handleCreateTest}
              onExport={handleExport}
              currentImage={currentImage}
              currentPrompt={analysis}
              currentVariations={variations}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>PromptLens - Turn any image into a structured visual prompt</p>
        </div>
      </footer>
    </main>
  );
}
