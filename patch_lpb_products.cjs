const fs = require('fs');

let lpb = fs.readFileSync('src/pages/admin/LandingPageBuilder.tsx', 'utf8');
lpb = lpb.replace(/const { products } = useProductStore\(\);/,
  `const { products, initializeStore: initProducts } = useProductStore();

  useEffect(() => {
    const unsubscribe = initProducts();
    return () => { if (unsubscribe) unsubscribe(); };
  }, [initProducts]);`);
fs.writeFileSync('src/pages/admin/LandingPageBuilder.tsx', lpb);
