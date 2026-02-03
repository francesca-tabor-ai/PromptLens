# PromptLens

Turn any image into a structured visual prompt and generate controlled variations for A/B testing.

## Features

- **Image to Visual Prompt**: Upload an image and get a structured breakdown of its visual components
- **Structured Analysis**: 10 visual components analyzed (storytelling, composition, lighting, color, style, mood, etc.)
- **Model-Specific Formatting**: Optimized prompts for Midjourney, Stable Diffusion, and DALL-E
- **Variation Generator**: Create controlled variations with locked/variable attributes
- **A/B Test Workspace**: Save, organize, and export your experiments
- **Export Options**: JSON and CSV export for prompts and variations

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Anthropic API key (for image analysis)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Upload Image**: Drag and drop or click to upload a JPG, PNG, or WEBP image
2. **Review Analysis**: See the structured visual prompt breakdown with 10 components
3. **Edit Components**: Click "Edit" on any component to refine the prompt
4. **Generate Variations**:
   - Lock attributes you want to keep fixed
   - Select variation axes and options
   - Generate 2-12 variations
5. **Save A/B Test**: Create named tests with tags for organization
6. **Export**: Download as JSON or CSV for use in your workflow

## Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- Anthropic Claude API (Vision)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/     # Image analysis endpoint
│   │   └── variations/  # Variation generation endpoint
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ABTestWorkspace.tsx
│   ├── ImageUpload.tsx
│   ├── ModelSelector.tsx
│   ├── PromptDisplay.tsx
│   └── VariationGenerator.tsx
├── lib/
└── types/
    └── index.ts
```

## License

MIT
