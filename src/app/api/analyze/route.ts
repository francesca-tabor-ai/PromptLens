import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { VisualPrompt, PromptAnalysis, TargetModel } from '@/types';

const anthropic = new Anthropic();

const ANALYSIS_PROMPT = `You are an expert visual prompt engineer. Analyze this image and extract a structured visual prompt that could recreate it in an AI image generator.

Output a JSON object with these exact fields (provide specific, detailed descriptions):

{
  "visualStorytelling": "Describe the scene narrative and intent - what story is being told",
  "composition": "Describe framing, perspective, focal point, and spatial arrangement",
  "depthOfField": "Describe depth characteristics - shallow/deep, bokeh, focus areas",
  "lighting": "Describe light direction, quality, softness, contrast, and sources",
  "colorScheme": "Describe the color palette, temperature, saturation levels",
  "objects": "List key elements, subjects, foreground/background objects",
  "expression": "Describe any faces, body language, emotional cues (or 'N/A' if none)",
  "actions": "Describe what is happening, movement, activity (or 'static scene' if none)",
  "style": "Describe the visual style - photographic, cinematic, illustrative, etc.",
  "mood": "Describe the emotional tone and atmosphere"
}

Be specific and descriptive. Each field should contain enough detail to recreate this specific look.
Output ONLY the JSON object, no other text.`;

function buildFullPrompt(structured: VisualPrompt, model: TargetModel): string {
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

  let prompt = parts.join('. ');

  // Model-specific formatting
  if (model === 'midjourney') {
    prompt = prompt + ' --v 6 --ar 16:9';
  } else if (model === 'stable-diffusion') {
    prompt = prompt + ', highly detailed, 8k, professional';
  } else if (model === 'dalle') {
    prompt = 'Create an image: ' + prompt;
  }

  return prompt;
}

function buildModelSpecificPrompts(structured: VisualPrompt): Record<string, string> {
  return {
    midjourney: buildFullPrompt(structured, 'midjourney'),
    stableDiffusion: buildFullPrompt(structured, 'stable-diffusion'),
    dalle: buildFullPrompt(structured, 'dalle'),
  };
}

export async function POST(request: NextRequest) {
  try {
    const { imageData, targetModel = 'generic' } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      );
    }

    // Extract base64 data and media type
    const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json(
        { error: 'Invalid image data format' },
        { status: 400 }
      );
    }

    const mediaType = matches[1] as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    const base64Data = matches[2];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: ANALYSIS_PROMPT,
            },
          ],
        },
      ],
    });

    // Extract text from response
    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // Parse the JSON response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response');
    }

    const structured: VisualPrompt = JSON.parse(jsonMatch[0]);
    const fullPrompt = buildFullPrompt(structured, targetModel as TargetModel);
    const modelSpecific = buildModelSpecificPrompts(structured);

    const analysis: PromptAnalysis = {
      structured,
      fullPrompt,
      modelSpecific,
    };

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
