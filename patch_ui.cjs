const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/SmartImporter.tsx', 'utf8');

code = code.replace(
  "{['analyzing', 'extracting', 'processing', 'uploading_images'].includes(item.status) && <RefreshCw size={14} className=\"animate-spin\" />}",
  "{['analyzing', 'extracting', 'processing', 'uploading_images', 'generating_hero', 'generating_details', 'generating_branding', 'generating_multi_view'].includes(item.status) && <RefreshCw size={14} className=\"animate-spin\" />}"
);

fs.writeFileSync('src/pages/admin/SmartImporter.tsx', code);
