const fs = require('fs');
let code = fs.readFileSync('src/store/useSmartImporterStore.ts', 'utf8');

// Add new statuses
code = code.replace(
  "export type ImportStatus = 'waiting' | 'analyzing' | 'extracting' | 'processing' | 'uploading_images' | 'ready' | 'imported' | 'failed' | 'duplicate' | 'requires_review';",
  "export type ImportStatus = 'waiting' | 'analyzing' | 'extracting' | 'processing' | 'uploading_images' | 'generating_hero' | 'generating_details' | 'generating_branding' | 'generating_multi_view' | 'ready' | 'imported' | 'failed' | 'duplicate' | 'requires_review';"
);

// We need to insert the AI generation step after image upload
const aiGenCode = `
        // 4. Generate AI Creatives
        if (originalImages.length > 0 && transformedProduct.images && transformedProduct.images.length > 0) {
          const sourceImageUrl = transformedProduct.images[0];
          const aiCreativesMetadata = [];
          
          const creatives = [
            { type: 'hero', status: 'generating_hero' },
            { type: 'details', status: 'generating_details' },
            { type: 'branding', status: 'generating_branding' },
            { type: 'multi-view', status: 'generating_multi_view' }
          ];

          for (const c of creatives) {
            updateItem(item.id, { status: c.status as any });
            try {
              const res = await fetch('/api/importer/generate-creative', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  productData: transformedProduct,
                  sourceImageUrl,
                  creativeType: c.type
                })
              });
              
              const data = await res.json();
              if (res.ok && data.imageUrl) {
                // The backend returned a base64 data URL. We need to upload it to Cloudinary.
                const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
                const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
                if (cloudName && uploadPreset) {
                  // Actually, uploadToCloudinary takes a File, but we can send base64 data URL to Cloudinary API directly
                  const uploadUrl = \`https://api.cloudinary.com/v1_1/\${cloudName}/image/upload\`;
                  const formData = new FormData();
                  formData.append('file', data.imageUrl);
                  formData.append('upload_preset', uploadPreset);
                  
                  const cRes = await fetch(uploadUrl, { method: 'POST', body: formData });
                  const cData = await cRes.json();
                  if (cData.secure_url) {
                    transformedProduct.images.push(cData.secure_url);
                    aiCreativesMetadata.push({
                      url: cData.secure_url,
                      type: 'ai_creative',
                      creativeType: c.type,
                      generatedBy: 'AN Mart AI',
                      generatedAt: new Date().toISOString(),
                      source: item.sourceUrl
                    });
                  }
                }
              }
            } catch(e) {
              console.warn(\`Failed to generate \${c.type}\`, e);
            }
          }
          
          // Save metadata to specifications
          transformedProduct.specifications = {
            ...(transformedProduct.specifications || {}),
            aiCreatives: JSON.stringify(aiCreativesMetadata)
          };
          
          updateItem(item.id, { productData: transformedProduct });
        }
`;

code = code.replace(
  "updateItem(item.id, { status: 'ready' });",
  aiGenCode + "\n        updateItem(item.id, { status: 'ready' });"
);

fs.writeFileSync('src/store/useSmartImporterStore.ts', code);
