const fs = require('fs');

let code = fs.readFileSync('src/pages/public/ProductDetails.tsx', 'utf8');

code = code.replace(/if \(!product\) {[\s\S]*?\} className="btn-primary">Return to Shop<\/button>\n      <\/div>\n    \);\n  \}/, `if (!product) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <div className="text-xl text-gray-500">Product not found</div>
        <button onClick={() => navigate('/shop')} className="btn-primary">Return to Shop</button>
      </div>
    );
  }`);

fs.writeFileSync('src/pages/public/ProductDetails.tsx', code);
