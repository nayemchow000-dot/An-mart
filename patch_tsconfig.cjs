const fs = require('fs');
const code = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
code.exclude = ["supabase", "node_modules", "dist"];
code.include = ["src", "server.ts", "vite.config.ts"];
fs.writeFileSync('tsconfig.json', JSON.stringify(code, null, 2));
