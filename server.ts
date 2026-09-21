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
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

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
      return res.status(400).json({ error: 'URL is required' });
    }
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    $('script, style, noscript, iframe, nav, footer, header, svg').remove();
    const cleanText = $('body').text().replace(/\s+/g, ' ').trim();
    
    const imageUrls: string[] = [];
    $('img').each((_, el) => {
      let src = $(el).attr('src') || $(el).attr('data-src');
      if (src) {
        try {
          src = new URL(src, url).href;
          if (src.startsWith('http') && !src.includes('data:image')) {
            imageUrls.push(src);
          }
        } catch (e) {}
      }
    });

    const topImages = Array.from(new Set(imageUrls)).slice(0, 15);

    const prompt = `
    Analyze the following product page text and list of image URLs extracted from ${url}.
    Extract the product information accurately according to the schema.
    DO NOT invent claims. Translate English content to Bengali for the *Bn fields accurately.
    For images, pick only the most relevant product images from the list provided.
    
    TEXT:
    ${cleanText.substring(0, 15000)}
    
    POTENTIAL IMAGE URLS:
    ${JSON.stringify(topImages)}
    `;

    let parsedData: any = null;
    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
    let lastApiError: any = null;

    for (const modelName of modelsToTry) {
      // Try each model
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(`[API] Attempting extraction with ${modelName} (attempt ${attempt})...`);
          const result = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: productSchema,
              temperature: 0.1
            }
          });

          if (result && result.text) {
            parsedData = JSON.parse(result.text);
            console.log(`[API] Successfully extracted product using ${modelName}`);
            break;
          }
        } catch (apiErr: any) {
          lastApiError = apiErr;
          const errStr = String(apiErr) + ' ' + (apiErr?.message || '');
          const isTemporary = errStr.includes('503') || errStr.includes('UNAVAILABLE') || errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED');
          console.log(`[API] ${modelName} busy/unavailable (attempt ${attempt}), checking fallback...`);

          if (isTemporary && attempt === 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            break;
          }
        }
      }

      if (parsedData) {
        break;
      }
    }

    // If Gemini models all experienced temporary 503/429 spikes or were unavailable,
    // gracefully fall back to heuristic extraction rather than crashing with 500
    if (!parsedData) {
      console.warn('[API] All Gemini models were unavailable or rate-limited. Falling back to heuristic HTML extraction.');
      
      const ogTitle = $('meta[property="og:title"]').attr('content');
      const h1Title = $('h1').first().text().trim();
      const pageTitle = $('title').text().trim();
      const title = ogTitle || h1Title || pageTitle || 'Imported Product';

      const ogDesc = $('meta[property="og:description"]').attr('content');
      const metaDesc = $('meta[name="description"]').attr('content');
      const desc = ogDesc || metaDesc || cleanText.substring(0, 500);

      const ogBrand = $('meta[property="og:site_name"]').attr('content') || $('meta[name="brand"]').attr('content') || '';

      let price = 0;
      const metaPrice = $('meta[property="product:price:amount"]').attr('content') || $('meta[property="og:price:amount"]').attr('content');
      if (metaPrice) {
        price = parseFloat(metaPrice.replace(/[^\d.]/g, '')) || 0;
      }
      if (!price) {
        const priceMatch = cleanText.match(/(?:৳|BDT|TK\.?|Price:?)\s*([\d,]+(?:\.\d{1,2})?)/i);
        if (priceMatch && priceMatch[1]) {
          price = parseFloat(priceMatch[1].replace(/,/g, '')) || 0;
        }
      }

      const features: string[] = [];
      $('ul li').each((_, el) => {
        const txt = $(el).text().trim();
        if (txt.length > 5 && txt.length < 150 && features.length < 6) {
          features.push(txt);
        }
      });

      parsedData = {
        title,
        titleBn: title,
        brand: ogBrand,
        sku: '',
        category: '',
        shortDescription: desc.substring(0, 160),
        description: desc,
        descriptionBn: desc,
        ingredients: '',
        benefits: '',
        howToUse: '',
        price: price || 1000,
        discountPrice: undefined,
        stockStatus: 'in_stock',
        images: topImages,
        features
      };
    }

    parsedData.sourceUrl = url;
    res.json(parsedData);

  } catch (error: any) {
    console.error('Extraction error:', error);
    res.status(500).json({ error: error.message || 'Failed to extract product data' });
  }
});

app.post('/api/importer/generate-creative', async (req, res) => {
  try {
    const { productData, sourceImageUrl, creativeType } = req.body;
    
    if (!productData || !sourceImageUrl || !creativeType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const imgResponse = await fetch(sourceImageUrl);
    if (!imgResponse.ok) throw new Error('Failed to fetch source image');
    
    const arrayBuffer = await imgResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');
    const mimeType = imgResponse.headers.get('content-type') || 'image/jpeg';
    
    let prompt = '';
    
    if (creativeType === 'hero') {
      prompt = `Generate a premium ecommerce product hero image of this exact product. Preserve the original product packaging, colors, labels, logo, and proportions exactly. Remove the original background and place the product in a premium AN Mart environment with warm ivory, creamy white, soft blush pink, or dusty rose tones. Use bright diffused studio lighting, realistic soft contact shadows, and luxury ecommerce photography style.`;
    } else if (creativeType === 'details') {
      prompt = `Generate a premium sales poster for this product. Use this exact text on the poster: "${productData.title}".Do not invent any benefits or prices. The product must remain clearly visible. Use a premium luxury layout with readable text. Preserve the original product packaging, colors, labels, logo, and proportions exactly.`;
    } else if (creativeType === 'branding') {
      prompt = `Generate a luxury AN Mart branding image featuring this exact product. Preserve the original product packaging, colors, labels, logo, and proportions exactly.Place it in a premium studio environment with soft shadows, elegant depth of field, on a premium surface or pedestal with minimal botanical styling. High-end beauty editorial photography. Colors should be warm ivory, soft blush, or sage green. Do not add fake logos.`;
    } else if (creativeType === 'multi-view') {
      prompt = `Generate a high-quality product quality showcase image featuring this exact product. Show a premium single-product quality presentation. Preserve packaging text and artwork exactly. Use clean studio lighting and a subtle champagne gold or creamy white background.`;
    }
    
    console.log(`[API] Generating ${creativeType} creative for ${productData.title}`);
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: '1:1'
        }
      }
    });
    
    let generatedBase64 = null;
    let generatedMimeType = null;
    
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          generatedBase64 = part.inlineData.data;
          generatedMimeType = part.inlineData.mimeType || 'image/png';
          break;
        }
      }
    }
    
    if (!generatedBase64) {
      throw new Error('No image was generated by the AI');
    }
    
    const dataUrl = `data:${generatedMimeType};base64,${generatedBase64}`;
    res.json({ success: true, imageUrl: dataUrl });
    
  } catch (error: any) {
    const errorStr = String(error);
    if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED') || error?.status === 429 || errorStr.includes('503') || errorStr.includes('UNAVAILABLE') || error?.status === 503) {
      console.log('[API] Gemini limit/overload. Falling back to free text-to-image (Pollinations.ai)...');
      try {
         const fallbackPrompt = `Premium ecommerce photography, ${req.body?.productData?.title || 'Product'}, ${req.body?.creativeType || 'hero'} style, beautiful clean background, highly detailed, professional studio lighting`;
         const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fallbackPrompt)}?width=1024&height=1024&nologo=true`;
         
         const fbRes = await fetch(pollinationsUrl);
         if (!fbRes.ok) throw new Error('Free AI fallback failed');
         
         const fbBuffer = await fbRes.arrayBuffer();
         const fbBase64 = Buffer.from(fbBuffer).toString('base64');
         const fbDataUrl = `data:image/jpeg;base64,${fbBase64}`;
         
         console.log('[API] Free fallback generated successfully.');
         return res.json({ success: true, imageUrl: fbDataUrl, isFreeFallback: true });
      } catch (fbError) {
         console.error('Free AI Fallback error:', fbError);
         return res.status(503).json({ error: 'Image generation requires a paid Gemini API key. Free fallback also failed.' });
      }
    }
    console.error('Creative generation error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to generate creative' });
  }
});

app.post('/api/importer/upload-image', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const cloudName = req.body.cloudName || process.env.VITE_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = req.body.uploadPreset || process.env.VITE_CLOUDINARY_UPLOAD_PRESET || process.env.CLOUDINARY_UPLOAD_PRESET;

    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }

    if (!cloudName || !uploadPreset) {
      return res.json({ secure_url: imageUrl, skipped: true, reason: 'Cloudinary not configured' });
    }

    // Step 1: Attempt direct upload to Cloudinary using remote URL
    try {
      const directForm = new FormData();
      directForm.append('file', imageUrl);
      directForm.append('upload_preset', uploadPreset);

      const directRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
        method: 'POST',
        body: directForm,
      });

      if (directRes.ok) {
        const directData = await directRes.json();
        if (directData.secure_url) {
          return res.json({ secure_url: directData.secure_url, method: 'direct' });
        }
      } else {
        const errText = await directRes.text();
        console.warn(`[Cloudinary] Direct remote fetch failed for ${imageUrl}: ${errText.substring(0, 150)}`);
      }
    } catch (directErr) {
      console.warn(`[Cloudinary] Direct upload failed, falling back to server buffer fetch:`, directErr);
    }

    // Step 2: If direct remote fetch failed (e.g. 403 Forbidden, bot protection, CORS),
    // fetch the image via our server (with browser headers) and upload as Base64/Buffer to Cloudinary
    try {
      const imgRes = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        }
      });

      if (imgRes.ok) {
        const arrayBuffer = await imgRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
        const base64Data = buffer.toString('base64');
        const dataUri = `data:${mimeType};base64,${base64Data}`;

        const bufferForm = new FormData();
        bufferForm.append('file', dataUri);
        bufferForm.append('upload_preset', uploadPreset);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
          method: 'POST',
          body: bufferForm,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          if (uploadData.secure_url) {
            return res.json({ secure_url: uploadData.secure_url, method: 'proxied_buffer' });
          }
        } else {
          const bufferErrText = await uploadRes.text();
          console.warn(`[Cloudinary] Buffer upload failed: ${bufferErrText.substring(0, 150)}`);
        }
      }
    } catch (bufferErr) {
      console.warn(`[Cloudinary] Server fetch error for ${imageUrl}:`, bufferErr);
    }

    // Step 3: Gracefully return original imageUrl so the import never fails or loses images
    return res.json({ secure_url: imageUrl, fallback: true });

  } catch (error: any) {
    console.error('[API] /api/importer/upload-image error:', error);
    res.json({ secure_url: req.body?.imageUrl || '', fallback: true, error: error.message });
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
