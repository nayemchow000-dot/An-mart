const fs = require('fs');
let code = fs.readFileSync('src/pages/public/ProductDetails.tsx', 'utf8');

const replacement = `  if (!product) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <div className="text-xl text-gray-500">Product not found</div>
        <button onClick={() => navigate('/shop')} className="btn-primary">Return to Shop</button>
      </div>
    );
  }

  const activeLandingPage = pages.find(p => p.id === product.id && p.status === 'active');
  if (activeLandingPage) {
    return <ProductLandingPage />;
  }`;

code = code.replace(/if \(!product\) \{[\s\S]*?return to Shop<\/button>\n      <\/div>\n    \);\n  \}/i, replacement);

fs.writeFileSync('src/pages/public/ProductDetails.tsx', code);
