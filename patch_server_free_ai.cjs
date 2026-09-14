const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `  } catch (error: any) {
    const errorStr = String(error);
    if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED') || error?.status === 429) {
      console.log('[API] Gemini Quota Exceeded. Falling back to free text-to-image (Pollinations.ai)...');
      try {
         const fallbackPrompt = \`Premium ecommerce photography, \${productData.title}, \${creativeType} style, beautiful clean background, highly detailed, professional studio lighting\`;
         const pollinationsUrl = \`https://image.pollinations.ai/prompt/\${encodeURIComponent(fallbackPrompt)}?width=1024&height=1024&nologo=true\`;
         
         const fbRes = await fetch(pollinationsUrl);
         if (!fbRes.ok) throw new Error('Free AI fallback failed');
         
         const fbBuffer = await fbRes.arrayBuffer();
         const fbBase64 = Buffer.from(fbBuffer).toString('base64');
         const fbDataUrl = \`data:image/jpeg;base64,\${fbBase64}\`;
         
         console.log('[API] Free fallback generated successfully.');
         return res.json({ success: true, imageUrl: fbDataUrl, isFreeFallback: true });
      } catch (fbError) {
         console.error('Free AI Fallback error:', fbError);
         return res.status(429).json({ error: 'Image generation requires a paid Gemini API key. Free fallback also failed.' });
      }
    }
    console.error('Creative generation error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to generate creative' });
  }`;

code = code.replace(/  \} catch \(error: any\) \{[\s\S]*?Failed to generate creative' \}\);\n  \}/, replacement);

fs.writeFileSync('server.ts', code);
