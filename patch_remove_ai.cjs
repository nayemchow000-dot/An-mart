const fs = require('fs');
let code = fs.readFileSync('src/store/useSmartImporterStore.ts', 'utf8');

// We want to remove the part that generates AI Creatives.
const regex = /\/\/ 4\. Generate AI Creatives[\s\S]*?(?=updateItem\(item\.id, \{ status: 'ready' \};\n      \} catch \(error: any\))/;
code = code.replace(regex, `// 4. Generate AI Creatives (Skipped per user request)
        if (!originalImages.length || !transformedProduct.images || transformedProduct.images.length === 0) {
          updateItem(item.id, { errorMessage: 'Product imported, but no usable authentic product image was found. Please upload a product image manually.' });
        }
        
        `);

fs.writeFileSync('src/store/useSmartImporterStore.ts', code);
