const fs = require('fs');
let code = fs.readFileSync('src/store/useSmartImporterStore.ts', 'utf8');

code = code.replace(
  "updateItem(item.id, { productData: transformedProduct });\n        }",
  `updateItem(item.id, { productData: transformedProduct });
        } else {
          updateItem(item.id, { errorMessage: 'Product imported, but no usable authentic product image was found. Please upload a product image manually.' });
        }`
);

fs.writeFileSync('src/store/useSmartImporterStore.ts', code);
