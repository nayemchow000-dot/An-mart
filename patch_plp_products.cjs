const fs = require('fs');

let plp = fs.readFileSync('src/pages/public/ProductLandingPage.tsx', 'utf8');
plp = plp.replace(/const { products, isLoading: productsLoading } = useProductStore\(\);/,
  `const { products, isLoading: productsLoading, initializeStore: initProducts } = useProductStore();

  useEffect(() => {
    const unsubscribe = initProducts();
    return () => { if (unsubscribe) unsubscribe(); };
  }, [initProducts]);`);
fs.writeFileSync('src/pages/public/ProductLandingPage.tsx', plp);
