const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/EditProduct.tsx', 'utf8');

const importsToAdd = `import { RefreshCw } from 'lucide-react';
`;
code = code.replace("import { Upload, X, Save, ArrowLeft, Loader2, Image as ImageIcon } from 'lucide-react';", 
"import { Upload, X, Save, ArrowLeft, Loader2, Image as ImageIcon, RefreshCw } from 'lucide-react';");

const parseMetadataCode = `
  const [regeneratingTypes, setRegeneratingTypes] = useState<string[]>([]);

  const handleRegenerateCreative = async (creativeType: string, sourceImageUrl: string) => {
    if (!formData) return;
    setRegeneratingTypes(prev => [...prev, creativeType]);
    try {
      const res = await fetch('/api/importer/generate-creative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productData: formData,
          sourceImageUrl,
          creativeType
        })
      });
      
      const data = await res.json();
      if (res.ok && data.imageUrl) {
        // Upload to Cloudinary
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
        
        if (cloudName && uploadPreset) {
          const uploadUrl = \`https://api.cloudinary.com/v1_1/\${cloudName}/image/upload\`;
          const fd = new FormData();
          fd.append('file', data.imageUrl);
          fd.append('upload_preset', uploadPreset);
          
          const cRes = await fetch(uploadUrl, { method: 'POST', body: fd });
          const cData = await cRes.json();
          if (cData.secure_url) {
            // Replace the old creative with the new one
            let newImages = [...(formData.images || [])];
            let newMetadata = [...aiCreatives];
            
            const existingMetaIndex = newMetadata.findIndex(m => m.creativeType === creativeType);
            if (existingMetaIndex >= 0) {
              const oldUrl = newMetadata[existingMetaIndex].url;
              newMetadata[existingMetaIndex].url = cData.secure_url;
              
              const imgIndex = newImages.indexOf(oldUrl);
              if (imgIndex >= 0) {
                newImages[imgIndex] = cData.secure_url;
              } else {
                newImages.push(cData.secure_url);
              }
            }
            
            setFormData({
              ...formData,
              images: newImages,
              specifications: {
                ...(formData.specifications || {}),
                aiCreatives: JSON.stringify(newMetadata)
              }
            });
            toast.success(\`Regenerated \${creativeType} successfully\`);
          }
        }
      } else {
        throw new Error(data.error || 'Failed to generate');
      }
    } catch(e) {
      toast.error('Failed to regenerate creative');
    } finally {
      setRegeneratingTypes(prev => prev.filter(t => t !== creativeType));
    }
  };

  let aiCreatives: any[] = [];
  try {
    if (formData?.specifications?.aiCreatives) {
      aiCreatives = JSON.parse(formData.specifications.aiCreatives);
    }
  } catch(e) {}
  
  const aiCreativeUrls = aiCreatives.map(c => c.url);
  const originalImages = formData?.images?.filter(url => !aiCreativeUrls.includes(url)) || [];
`;

code = code.replace('const [uploadingImage, setUploadingImage] = useState(false);', 
'const [uploadingImage, setUploadingImage] = useState(false);\n' + parseMetadataCode);

const uiCode = `
            {/* Product Media */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900">Original Product Images <span className="text-red-500">*</span></h2>
                <span className="text-xs text-gray-500">First image is the thumbnail</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {originalImages.map((url, index) => {
                  const globalIndex = formData?.images?.indexOf(url) || index;
                  return (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                    <img src={url} alt={\`Product \${index + 1}\`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        type="button"
                        onClick={() => removeImage(globalIndex)}
                        className="p-2 bg-white/20 hover:bg-red-500 text-white rounded-full backdrop-blur-sm transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    {index === 0 && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-white text-[10px] font-bold uppercase rounded">
                        Main
                      </div>
                    )}
                  </div>
                )})}
                
                <label className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-4 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer aspect-square">
                  {uploadingImage ? (
                    <Loader2 size={24} className="text-gray-400 animate-spin mb-2" />
                  ) : (
                    <Upload size={24} className="text-gray-400 mb-2" />
                  )}
                  <span className="text-xs font-medium text-gray-500 text-center">
                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                  </span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    multiple 
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
              </div>
            </div>

            {aiCreatives.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-1 rounded text-xs">AI</span>
                  AN Mart AI Creatives
                </h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {aiCreatives.map((creative, index) => {
                  const globalIndex = formData?.images?.indexOf(creative.url) || -1;
                  const isRegenerating = regeneratingTypes.includes(creative.creativeType);
                  return (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                    <img src={creative.url} alt={creative.creativeType} className={\`w-full h-full object-cover \${isRegenerating ? 'opacity-50 blur-sm' : ''}\`} />
                    
                    {!isRegenerating && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <button 
                          type="button"
                          onClick={() => window.open(creative.url, '_blank')}
                          className="px-3 py-1.5 bg-white/20 hover:bg-white text-white hover:text-gray-900 rounded-lg backdrop-blur-sm transition-colors text-xs font-medium w-24 text-center"
                        >
                          Preview
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleRegenerateCreative(creative.creativeType, originalImages[0])}
                          className="px-3 py-1.5 bg-primary/80 hover:bg-primary text-white rounded-lg backdrop-blur-sm transition-colors text-xs font-medium w-24 flex items-center justify-center gap-1"
                        >
                          <RefreshCw size={12} /> Regenerate
                        </button>
                        <button 
                          type="button"
                          onClick={() => removeImage(globalIndex)}
                          className="px-3 py-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg backdrop-blur-sm transition-colors text-xs font-medium w-24 flex items-center justify-center gap-1"
                        >
                          <X size={12} /> Delete
                        </button>
                      </div>
                    )}

                    {isRegenerating && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm">
                        <RefreshCw size={24} className="text-primary animate-spin mb-2" />
                        <span className="text-xs font-bold text-gray-800">Regenerating...</span>
                      </div>
                    )}
                    
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white text-[10px] font-bold uppercase rounded backdrop-blur-md">
                      {creative.creativeType.replace('-', ' ')}
                    </div>
                  </div>
                )})}
              </div>
            </div>
            )}
`;

code = code.replace(
  /<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">[\s\S]*?{uploadingImage \? 'Uploading\.\.\.' : 'Upload Image'}[\s\S]*?<\/label>\s*<\/div>\s*<\/div>/,
  uiCode
);

fs.writeFileSync('src/pages/admin/EditProduct.tsx', code);
