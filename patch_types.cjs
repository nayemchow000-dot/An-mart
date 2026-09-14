const fs = require('fs');
let code = fs.readFileSync('src/types/importer.ts', 'utf8');

code = code.replace(
  "export type ImportStatus = 'waiting' | 'analyzing' | 'extracting' | 'processing' | 'uploading_images' | 'ready' | 'imported' | 'failed' | 'duplicate' | 'requires_review';",
  "export type ImportStatus = 'waiting' | 'analyzing' | 'extracting' | 'processing' | 'uploading_images' | 'generating_hero' | 'generating_details' | 'generating_branding' | 'generating_multi_view' | 'ready' | 'imported' | 'failed' | 'duplicate' | 'requires_review';"
);

fs.writeFileSync('src/types/importer.ts', code);
