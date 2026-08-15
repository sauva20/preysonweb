const fs = require('fs');
const lines = fs.readFileSync('C:\\Users\\BAKA\\.gemini\\antigravity-ide\\brain\\f2e1c1b9-0313-47fd-b3af-067fb0bb54de\\.system_generated\\logs\\transcript_full.jsonl', 'utf8').split('\n');
let count = 0;
for(let l of lines){
  const lower = l.toLowerCase();
  if(lower.includes('view_file') && lower.includes('products.jsx') && lower.includes('file path: `file:///c:/laragon/www/preyson/preysonweb/src/admin/pages/products.jsx`')) {
    const data = JSON.parse(l);
    if(data.type === 'TOOL_RESPONSE') {
      let tc = Array.isArray(data.content)?data.content.map(c=>c.text).join('\n'):data.content;
      fs.writeFileSync('view_products_'+count+'.txt', tc);
      console.log('Saved view_products_'+count);
      count++;
    }
  }
}
