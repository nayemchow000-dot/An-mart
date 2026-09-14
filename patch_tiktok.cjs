const fs = require('fs');
let code = fs.readFileSync('src/components/TikTokPixel.tsx', 'utf8');
code = code.replace("!function (w: any, d, t) {", "(function (w: any, d, t) {");
code = code.replace("}(window, document, 'ttq');", "})(window, document, 'ttq');");
fs.writeFileSync('src/components/TikTokPixel.tsx', code);
