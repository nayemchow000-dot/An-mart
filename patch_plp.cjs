const fs = require('fs');

let plp = fs.readFileSync('src/pages/public/ProductLandingPage.tsx', 'utf8');

plp = plp.replace(/const { productSlug } = useParams\(\);/, `const { productSlug, slug } = useParams();
  const targetSlug = productSlug || slug;`);

plp = plp.replace(/p\.slug === productSlug/g, 'p.slug === targetSlug');
plp = plp.replace(/productSlug\}/g, 'targetSlug}');
plp = plp.replace(/\[productSlug,/g, '[targetSlug,');

fs.writeFileSync('src/pages/public/ProductLandingPage.tsx', plp);
