const fs = require('fs');
let lpb = fs.readFileSync('src/pages/admin/LandingPageBuilder.tsx', 'utf8');
lpb = lpb.replace(/toast\.error\('Error saving landing page'\);/, 
  `console.error("Save error:", error);
      toast.error('Error saving landing page: ' + (error.message || error));`);
fs.writeFileSync('src/pages/admin/LandingPageBuilder.tsx', lpb);
