const fs = require('fs');

// Fix LandingPageBuilder TS error
let lpb = fs.readFileSync('src/pages/admin/LandingPageBuilder.tsx', 'utf8');
lpb = lpb.replace(/status: isEnabled \? 'active' : 'inactive'/, "status: (isEnabled ? 'active' : 'inactive') as 'active' | 'inactive'");
fs.writeFileSync('src/pages/admin/LandingPageBuilder.tsx', lpb);

// Fix ProductLandingPage X import
let plp = fs.readFileSync('src/pages/public/ProductLandingPage.tsx', 'utf8');
plp = plp.replace(/import { Check, ShieldCheck, Truck, Phone, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';/,
  "import { Check, ShieldCheck, Truck, Phone, MessageCircle, ChevronDown, ChevronUp, X } from 'lucide-react';");
fs.writeFileSync('src/pages/public/ProductLandingPage.tsx', plp);
