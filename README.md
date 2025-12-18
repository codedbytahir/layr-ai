# Layr JS

An AI-powered text overlay generator that intelligently places text on images using [OpenRouter](https://openrouter.ai) API and vision models.

## Features

- 🎨 **AI-Powered Text Placement**: Uses the Nemotron model to analyze images and find optimal text placement
- 📝 **Multiple Text Styles**: Bold, Modern, Sci-Fi, Horror, Handwritten, Retro, and Elegant
- 🎯 **Smart Fallback**: Graceful fallback to rule-based placement if AI analysis fails
- 📊 **Canvas Rendering**: High-quality text rendering with stroke outlines
- ⚡ **Built with Next.js**: Modern full-stack framework with API routes

## Prerequisites

- Node.js 18+
- OpenRouter API key (get one at [openrouter.ai](https://openrouter.ai))

## Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd layr-js
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set environment variable** (on Windows PowerShell)
   ```powershell
   $env:OPENROUTER_API_KEY='your-api-key-here'
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Usage

### POST `/api/generate`

Sends an image with text to be overlaid and returns a processed image with AI-optimized text placement.

**Parameters:**
- `image` (FormData File): The image file to process
- `text` (string): The text to overlay on the image
- `style` (string): Text style - `bold`, `modern`, `handwritten`, `scifi`, `horror`, `retro`, `elegant`

**Example:**
```bash
curl -X POST http://localhost:3000/api/generate \
  -F "image=@myimage.jpg" \
  -F "text=Hello World" \
  -F "style=modern"
```

## Supported Models

- **Nemotron Nano 12B V2**: Free vision model via OpenRouter (`nvidia/nemotron-nano-12b-v2-vl:free`)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Architecture

- **Frontend**: React + Next.js
- **Backend**: Next.js API routes
- **Image Processing**: Sharp (format conversion) + Canvas (text rendering)
- **AI Analysis**: OpenRouter API with Nemotron vision model
- **Styling**: Tailwind CSS

## Testing

Run the test script to verify OpenRouter API connectivity:
```bash
node test-openrouter.js
```

## Troubleshooting

- **"OPENROUTER_API_KEY not set"**: Make sure to set the environment variable before running the app
- **"AI analysis failed"**: Check your API key validity and OpenRouter service status
- **Fallback mode**: If AI analysis fails, the app will use rule-based text placement

## License

MIT
