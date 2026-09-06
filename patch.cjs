const fs = require('fs');
let code = fs.readFileSync('src/pages/public/Shop.tsx', 'utf8');

code = code.replace(
  "import { useState } from 'react';",
  "import { useState, useEffect } from 'react';\nimport { useParams } from 'react-router-dom';\nimport { useCategoryStore } from '../../store/useCategoryStore';"
);

code = code.replace(
  "export default function Shop() {",
  "export default function Shop() {\n  const { slug } = useParams<{ slug?: string }>();\n  const { categories } = useCategoryStore();"
);

code = code.replace(
  "const categories = ['Cosmetics', 'Skincare', 'Jewellery', 'Accessories'];",
  ""
);

code = code.replace(
  "  const toggleCategory = (category: string) => {",
  `  useEffect(() => {
    if (slug) {
      setSelectedCategories([slug]);
    } else {
      setSelectedCategories([]);
    }
  }, [slug]);

  const toggleCategory = (category: string) => {`
);

code = code.replace(/cat\}/g, "cat.name}");
code = code.replace(/cat\)/g, "cat.slug)");
code = code.replace(/\{cat\}/g, "{cat.name}");
code = code.replace(/toggleCategory\(cat\)/g, "toggleCategory(cat.slug)");
code = code.replace(/selectedCategories\.includes\(cat\)/g, "selectedCategories.includes(cat.slug)");
code = code.replace(/key=\{cat\}/g, "key={cat.id}");

fs.writeFileSync('src/pages/public/Shop.tsx', code);
