const fs = require('fs');

// Patch LandingPageBuilder
let lpb = fs.readFileSync('src/pages/admin/LandingPageBuilder.tsx', 'utf8');
lpb = lpb.replace(/const { pages, addPage, updatePage, isLoading: storeLoading } = useLandingPageStore\(\);/,
  `const { pages, addPage, updatePage, isLoading: storeLoading, initializeStore } = useLandingPageStore();

  useEffect(() => {
    const unsubscribe = initializeStore();
    return () => { if (unsubscribe) unsubscribe(); };
  }, [initializeStore]);`);
fs.writeFileSync('src/pages/admin/LandingPageBuilder.tsx', lpb);

// Patch ProductLandingPage
let plp = fs.readFileSync('src/pages/public/ProductLandingPage.tsx', 'utf8');
plp = plp.replace(/const { pages, isLoading: pagesLoading } = useLandingPageStore\(\);/,
  `const { pages, isLoading: pagesLoading, initializeStore } = useLandingPageStore();

  useEffect(() => {
    const unsubscribe = initializeStore();
    return () => { if (unsubscribe) unsubscribe(); };
  }, [initializeStore]);`);
fs.writeFileSync('src/pages/public/ProductLandingPage.tsx', plp);
