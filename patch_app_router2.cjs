const fs = require('fs');
let code = fs.readFileSync('src/routes/AppRouter.tsx', 'utf8');

// Replace the bad redirect with a component-based redirect
const newRedirect = `
const LandingRedirect = () => {
  const { slug } = useParams();
  return <Navigate to={\`/product/\${slug}\`} replace />;
};
`;

if (!code.includes('LandingRedirect')) {
  code = code.replace(/export default function AppRouter/, newRedirect + '\nexport default function AppRouter');
  code = code.replace(/<Route path="landing\/:slug" element={<Navigate to="\/product\/:slug" replace \/>} \/>/, 
    `<Route path="landing/:slug" element={<LandingRedirect />} />`);
}

if (!code.includes('useParams')) {
  code = code.replace(/import { Routes, Route, Navigate } from 'react-router-dom';/, "import { Routes, Route, Navigate, useParams } from 'react-router-dom';");
}

fs.writeFileSync('src/routes/AppRouter.tsx', code);
