import { NextRequest, NextResponse } from 'next/server';
import { VisualPrompt, Variation, VariationAxis } from '@/types';

interface VariationSettings {
  axis: VariationAxis;
  options: string[];
}

function generateVariationId(): string {
  return `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function applyVariation(
  basePrompt: VisualPrompt,
  axis: VariationAxis,
  value: string
): VisualPrompt {
  const modified = { ...basePrompt };

  switch (axis) {
    case 'lighting':
      modified.lighting = value + ' lighting';
      break;
    case 'colorScheme':
      modified.colorScheme = value + ' color palette';
      break;
    case 'expression':
      modified.expression = value + ' expression';
      break;
    case 'style':
      modified.style = value + ' style';
      break;
    case 'mood':
      modified.mood = value + ' mood';
      break;
    case 'composition':
      modified.composition = value + ' composition';
      break;
  }

  return modified;
}

function buildPromptFromStructured(structured: VisualPrompt): string {
  const parts = [];

  if (structured.visualStorytelling && structured.visualStorytelling !== 'N/A') {
    parts.push(structured.visualStorytelling);
  }
  if (structured.objects) {
    parts.push(structured.objects);
  }
  if (structured.actions && structured.actions !== 'static scene') {
    parts.push(structured.actions);
  }
  if (structured.composition) {
    parts.push(structured.composition);
  }
  if (structured.lighting) {
    parts.push(structured.lighting);
  }
  if (structured.colorScheme) {
    parts.push(structured.colorScheme);
  }
  if (structured.depthOfField) {
    parts.push(structured.depthOfField);
  }
  if (structured.expression && structured.expression !== 'N/A') {
    parts.push(structured.expression);
  }
  if (structured.style) {
    parts.push(structured.style);
  }
  if (structured.mood) {
    parts.push(structured.mood);
  }

  return parts.join('. ');
}

function generateCombinations(
  variationSettings: VariationSettings[],
  count: number
): Array<Record<VariationAxis, string>> {
  const combinations: Array<Record<VariationAxis, string>> = [];

  // Generate all possible combinations
  const generateCombos = (
    index: number,
    current: Record<string, string>
  ): void => {
    if (index === variationSettings.length) {
      combinations.push(current as Record<VariationAxis, string>);
      return;
    }

    const setting = variationSettings[index];
    for (const option of setting.options) {
      generateCombos(index + 1, { ...current, [setting.axis]: option });
    }
  };

  generateCombos(0, {});

  // Shuffle and limit
  const shuffled = combinations.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export async function POST(request: NextRequest) {
  try {
    const { basePrompt, lockedAxes, variationSettings, count = 4 } = await request.json();

    if (!basePrompt || !variationSettings || variationSettings.length === 0) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Filter out locked axes from variation settings
    const activeSettings = variationSettings.filter(
      (s: VariationSettings) => !lockedAxes.includes(s.axis)
    );

    if (activeSettings.length === 0) {
      return NextResponse.json(
        { error: 'All variation axes are locked' },
        { status: 400 }
      );
    }

    // Generate combinations
    const combinations = generateCombinations(activeSettings, count);

    // Create variations
    const variations: Variation[] = combinations.map((combo, index) => {
      let modifiedPrompt = basePrompt.structured;

      // Apply each variation axis
      Object.entries(combo).forEach(([axis, value]) => {
        modifiedPrompt = applyVariation(modifiedPrompt, axis as VariationAxis, value);
      });

      const changelog = Object.entries(combo).map(
        ([axis, value]) => `${axis}: ${value}`
      );

      return {
        id: generateVariationId(),
        name: `Variation ${index + 1}`,
        changedAxes: combo,
        modifiedPrompt: buildPromptFromStructured(modifiedPrompt),
        changelog,
      };
    });

    return NextResponse.json({ variations });
  } catch (error) {
    console.error('Variation generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate variations' },
      { status: 500 }
    );
  }
}
