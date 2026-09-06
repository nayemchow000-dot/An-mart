const fs = require('fs');
let code = fs.readFileSync('src/store/useProductStore.ts', 'utf8');
code = code.replace(/while \(result.error && \(result.error.code === 'PGRST204' \|\| result.error.code === '42703'\)\) \{[\s\S]*?break;\s*\}\s*\}/g, `while (result.error && (result.error.code === 'PGRST204' || result.error.code === '42703')) {
        const match1 = result.error.message.match(/Could not find the '([^']+)' column/);
        const match2 = result.error.message.match(/column "([^"]+)" of relation/);
        const match = match1 || match2;
        if (match && match[1]) {
          const col = match[1];
          delete (productToSave as any)[col];
          result = await supabase.from('products').insert([productToSave]);
        } else {
          break;
        }
      }`);
fs.writeFileSync('src/store/useProductStore.ts', code);
