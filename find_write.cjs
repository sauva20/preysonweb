const fs = require('fs');
const lines = fs.readFileSync('C:\\Users\\BAKA\\.gemini\\antigravity-ide\\brain\\f2e1c1b9-0313-47fd-b3af-067fb0bb54de\\.system_generated\\logs\\transcript_full.jsonl', 'utf8').split('\n');
let count = 0;
for(let l of lines){
  const lower = l.toLowerCase();
  if(lower.includes('write_to_file') && lower.includes('products.jsx')) {
    const data = JSON.parse(l);
    if(data.type === 'PLANNER_RESPONSE' && data.tool_calls) {
      for(let call of data.tool_calls) {
        if(call.name === 'write_to_file' && call.args && call.args.TargetFile && call.args.TargetFile.toLowerCase().includes('products.jsx')) {
           fs.writeFileSync('write_products_'+count+'.txt', call.args.CodeContent);
           console.log('Saved write_products_'+count);
           count++;
        }
      }
    }
  }
}
