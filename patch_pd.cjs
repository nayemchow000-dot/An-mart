const fs = require('fs');

let code = fs.readFileSync('src/pages/public/ProductDetails.tsx', 'utf8');

// Add imports
code = code.replace(/import { useProductStore } from '\.\.\/\.\.\/store\/useProductStore';/, `import { useProductStore } from '../../store/useProductStore';
import { useLandingPageStore } from '../../store/useLandingPageStore';
import ProductLandingPage from './ProductLandingPage';`);

// Initialize landing page store
code = code.replace(/const { products, isLoading } = useProductStore\(\);/, `const { products, isLoading } = useProductStore();
  const { pages, initializeStore: initLandingPages } = useLandingPageStore();

  useEffect(() => {
    const unsubscribe = initLandingPages();
    return () => { if (unsubscribe) unsubscribe(); };
  }, [initLandingPages]);`);

// Add the conditional return statement right after the `if (!product)` block
code = code.replace(/if \(!product\) {[\s\S]*?}/, `if (!product) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-xl text-gray-500">Product not found</div>
      </div>
    );
  }

  const activeLandingPage = pages.find(p => p.id === product.id && p.status === 'active');
  if (activeLandingPage) {
    return <ProductLandingPage />;
  }`);

fs.writeFileSync('src/pages/public/ProductDetails.tsx', code);
