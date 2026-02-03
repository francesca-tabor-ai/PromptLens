'use client';

import { useState } from 'react';
import { ABTest, Variation, PromptAnalysis } from '@/types';

interface ABTestWorkspaceProps {
  tests: ABTest[];
  onCreateTest: (name: string, tags: string[]) => void;
  onExport: (test: ABTest, format: 'json' | 'csv') => void;
  currentImage: string | null;
  currentPrompt: PromptAnalysis | null;
  currentVariations: Variation[];
}

export default function ABTestWorkspace({
  tests,
  onCreateTest,
  onExport,
  currentImage,
  currentPrompt,
  currentVariations,
}: ABTestWorkspaceProps) {
  const [testName, setTestName] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleCreateTest = () => {
    if (testName.trim()) {
      onCreateTest(testName.trim(), tags);
      setTestName('');
      setTags([]);
      setShowCreateForm(false);
    }
  };

  const canCreateTest = currentImage && currentPrompt && currentVariations.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">A/B Test Workspace</h3>
          <p className="text-sm text-gray-500">Save and manage your experiments</p>
        </div>
        {canCreateTest && !showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-sm font-medium transition-colors"
          >
            + New Test
          </button>
        )}
      </div>

      {/* Create test form */}
      {showCreateForm && (
        <div className="p-6 bg-primary-50 border-b border-primary-100">
          <h4 className="font-medium text-gray-800 mb-4">Create New A/B Test</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Name</label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="e.g., Homepage hero v1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="Add tag..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">This test will include:</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Base image and prompt</li>
                <li>• {currentVariations.length} variation(s)</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateTest}
                disabled={!testName.trim()}
                className={`
                  flex-1 py-2 rounded-lg font-medium transition-colors
                  ${testName.trim()
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                Create Test
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tests list */}
      <div className="p-6">
        {tests.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-gray-500 mb-2">No tests yet</p>
            <p className="text-sm text-gray-400">
              {canCreateTest
                ? 'Click "New Test" to save your current experiment'
                : 'Generate variations first to create a test'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tests.map((test) => (
              <div
                key={test.id}
                className={`
                  border rounded-lg p-4 transition-all cursor-pointer
                  ${selectedTest?.id === test.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => setSelectedTest(selectedTest?.id === test.id ? null : test)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">{test.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {test.variations.length} variation(s) • Created{' '}
                      {new Date(test.createdAt).toLocaleDateString()}
                    </p>
                    {test.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {test.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onExport(test, 'json');
                      }}
                      className="text-xs text-primary-600 hover:text-primary-700 px-2 py-1"
                    >
                      JSON
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onExport(test, 'csv');
                      }}
                      className="text-xs text-primary-600 hover:text-primary-700 px-2 py-1"
                    >
                      CSV
                    </button>
                  </div>
                </div>

                {/* Expanded view */}
                {selectedTest?.id === test.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Base prompt preview */}
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs font-medium text-gray-500 mb-2">BASE PROMPT</p>
                        <p className="text-sm text-gray-700 line-clamp-3 font-mono">
                          {test.basePrompt.fullPrompt}
                        </p>
                      </div>
                      {/* Variations preview */}
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs font-medium text-gray-500 mb-2">VARIATIONS</p>
                        <div className="space-y-2">
                          {test.variations.slice(0, 3).map((v) => (
                            <div key={v.id} className="text-sm">
                              <span className="font-medium text-gray-700">{v.name}:</span>
                              <span className="text-gray-500 ml-1">
                                {v.changelog.join(', ')}
                              </span>
                            </div>
                          ))}
                          {test.variations.length > 3 && (
                            <p className="text-xs text-gray-400">
                              +{test.variations.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
