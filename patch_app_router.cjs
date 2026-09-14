const fs = require('fs');
let code = fs.readFileSync('src/routes/AppRouter.tsx', 'utf8');

// Add Navigate import if not present
if (!code.includes('Navigate')) {
  code = code.replace(/import { Routes, Route } from 'react-router-dom';/, "import { Routes, Route, Navigate } from 'react-router-dom';");
}

// Add redirect route
const redirectRoute = `<Route path="landing/:slug" element={<Navigate to="/product/:slug" replace />} />`;
if (!code.includes('landing/:slug')) {
  code = code.replace(/<Route path="product\/:slug" element={<ProductDetails \/>} \/>/, 
    `<Route path="product/:slug" element={<ProductDetails />} />\n        ${redirectRoute}`);
}

fs.writeFileSync('src/routes/AppRouter.tsx', code);
