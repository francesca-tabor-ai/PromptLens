'use client';

import { useState } from 'react';
import { PromptAnalysis, VisualPrompt } from '@/types';

interface PromptDisplayProps {
  analysis: PromptAnalysis | null;
  isLoading: boolean;
  onPromptEdit: (field: keyof VisualPrompt, value: string) => void;
}

const promptFields: { key: keyof VisualPrompt; label: string; icon: string }[] = [
  { key: 'visualStorytelling', label: 'Visual Storytelling', icon: '📖' },
  { key: 'composition', label: 'Composition', icon: '📐' },
  { key: 'depthOfField', label: 'Depth of Field', icon: '🔭' },
  { key: 'lighting', label: 'Lighting', icon: '💡' },
  { key: 'colorScheme', label: 'Color Scheme', icon: '🎨' },
  { key: 'objects', label: 'Objects', icon: '🎯' },
  { key: 'expression', label: 'Expression', icon: '😊' },
  { key: 'actions', label: 'Actions', icon: '🎬' },
  { key: 'style', label: 'Style', icon: '✨' },
  { key: 'mood', label: 'Mood', icon: '🌈' },
];

export default function PromptDisplay({ analysis, isLoading, onPromptEdit }: PromptDisplayProps) {
  const [editingField, setEditingField] = useState<keyof VisualPrompt | null>(null);
  const [editValue, setEditValue] = useState('');
  const [viewMode, setViewMode] = useState<'structured' | 'full' | 'json'>('structured');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/6"></div>
              <div className="h-8 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-500 mt-4">Analyzing your image...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <p className="text-gray-500">Upload an image to generate a visual prompt</p>
      </div>
    );
  }

  const handleEdit = (field: keyof VisualPrompt) => {
    setEditingField(field);
    setEditValue(analysis.structured[field]);
  };

  const handleSave = () => {
    if (editingField) {
      onPromptEdit(editingField, editValue);
      setEditingField(null);
    }
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* View mode tabs */}
      <div className="flex border-b border-gray-200">
        {(['structured', 'full', 'json'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`
              flex-1 px-4 py-3 text-sm font-medium transition-colors
              ${viewMode === mode
                ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-600 hover:bg-gray-50'
              }
            `}
          >
            {mode === 'structured' ? 'Structured' : mode === 'full' ? 'Full Prompt' : 'JSON'}
          </button>
        ))}
      </div>

      <div className="p-6">
        {viewMode === 'structured' && (
          <div className="space-y-4">
            {promptFields.map(({ key, label, icon }) => (
              <div key={key} className="group">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <span>{icon}</span>
                    {label}
                  </label>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={() => handleEdit(key)}
                      className="text-xs text-primary-600 hover:text-primary-700 px-2 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => copyToClipboard(analysis.structured[key], key)}
                      className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                    >
                      {copiedField === key ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                {editingField === key ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      autoFocus
                    />
                    <button
                      onClick={handleSave}
                      className="px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingField(null)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                    {analysis.structured[key] || <span className="text-gray-400 italic">Not detected</span>}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {viewMode === 'full' && (
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={analysis.fullPrompt}
                readOnly
                className="w-full h-64 px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-sm font-mono resize-none focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(analysis.fullPrompt, 'full')}
                className="absolute top-2 right-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 shadow-sm"
              >
                {copiedField === 'full' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {viewMode === 'json' && (
          <div className="relative">
            <pre className="w-full h-64 px-4 py-3 border border-gray-200 rounded-lg bg-gray-900 text-green-400 text-sm font-mono overflow-auto">
              {JSON.stringify(analysis.structured, null, 2)}
            </pre>
            <button
              onClick={() => copyToClipboard(JSON.stringify(analysis.structured, null, 2), 'json')}
              className="absolute top-2 right-2 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-700"
            >
              {copiedField === 'json' ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
