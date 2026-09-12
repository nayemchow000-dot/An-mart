import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import * as cheerio from 'cheerio';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const productSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Product Title in English" },
    titleBn: { type: Type.STRING, description: "Product Title in Bengali" },
    brand: { type: Type.STRING, description: "Brand name" },
    sku: { type: Type.STRING, description: "Product SKU or ID" },
    category: { type: Type.STRING, description: "Main category" },
    shortDescription: { type: Type.STRING, description: "Short description in English" },
    description: { type: Type.STRING, description: "Full detailed description in English" },
    descriptionBn: { type: Type.STRING, description: "Full detailed description in Bengali" },
    ingredients: { type: Type.STRING, description: "Ingredients if applicable" },
    benefits: { type: Type.STRING, description: "Benefits if applicable" },
    howToUse: { type: Type.STRING, description: "How to use instructions if applicable" },
    price: { type: Type.NUMBER, description: "Regular price as a number" },
    discountPrice: { type: Type.NUMBER, description: "Discount price if available" },
    stockStatus: { type: Type.STRING, enum: ["in_stock", "out_of_stock"], description: "Stock availability" },
    images: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Array of absolute image URLs found for the product" 
    },
    features: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Key features as an array of strings"
    }
  },
  required: ["title", "description", "price"]
};

app.post('/api/importer/extract', async (req, res) => {
  console.log(`[API] Received request for URL: ${req.body?.url}`);
  try {
    const { url } = req.body;
    if (!url) {
      console.log(`[API] URL missing`);
      return res.status(400).json({ error: 'URL is required' });
    }
    
    if (!process.env.GEMINI_API_KEY) {
      console.log(`[API] GEMINI_API_KEY missing`);
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    // 1. Fetch the URL content
    console.log(`[API] Fetching URL content...`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    
    // 2. Extract clean text and image candidates using cheerio
    const $ = cheerio.load(html);
    
    // Remove unnecessary elements to save tokens
    $('script, style, noscript, iframe, nav, footer, header, svg').remove();
    
    // Get visible text
    const cleanText = $('body').text().replace(/\s+/g, ' ').trim();
    
    // Collect potential image URLs
    const imageUrls: string[] = [];
    $('img').each((_, el) => {
      let src = $(el).attr('src') || $(el).attr('data-src');
      if (src) {
        // Resolve relative URLs
        try {
          src = new URL(src, url).href;
          if (src.startsWith('http') && !src.includes('data:image')) {
            imageUrls.push(src);
          }
        } catch (e) {
          // ignore invalid URLs
        }
      }
    });

    // Take top 15 images to avoid context explosion
    const topImages = Array.from(new Set(imageUrls)).slice(0, 15);

    // 3. Ask Gemini to extract data
    console.log(`[API] Extracted ${cleanText.length} chars of text, ${topImages.length} images. Calling Gemini...`);
    const prompt = `
    Analyze the following product page text and list of image URLs extracted from ${url}.
    Extract the product information accurately according to the schema.
    DO NOT invent claims. Translate English content to Bengali for the *Bn fields accurately.
    For images, pick only the most relevant product images from the list provided.
    
    TEXT:
    ${cleanText.substring(0, 15000)} // Limiting text length to avoid token limits
    
    POTENTIAL IMAGE URLS:
    ${JSON.stringify(topImages)}
    `;

    const result = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: productSchema,
        temperature: 0.1
      }
    });

    console.log(`[API] Gemini returned successfully.`);
    const parsedData = JSON.parse(result.text || '{}');
    parsedData.sourceUrl = url;

    res.json(parsedData);
  } catch (error: any) {
    console.error('Extraction error:', error);
    res.status(500).json({ error: error.message || 'Failed to extract product data' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
