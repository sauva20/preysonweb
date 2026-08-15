const fs = require('fs');
const lines = fs.readFileSync('C:\\Users\\BAKA\\.gemini\\antigravity-ide\\brain\\f2e1c1b9-0313-47fd-b3af-067fb0bb54de\\.system_generated\\logs\\transcript_full.jsonl', 'utf8').split('\n');
let count = 0;
for(let l of lines){
  if(l.includes('Products.jsx') && l.includes('products-page')) {
    const data = JSON.parse(l);
    if(data.type === 'TOOL_RESPONSE' || data.type === 'PLANNER_RESPONSE') {
      let tc = "";
      if (data.type === 'TOOL_RESPONSE') {
          tc = Array.isArray(data.content)?data.content.map(c=>c.text).join('\n'):data.content;
      } else if (data.type === 'PLANNER_RESPONSE' && data.tool_calls) {
          tc = JSON.stringify(data.tool_calls);
      }
      fs.writeFileSync('recover_'+count+'.txt', tc);
      console.log('Saved recover_'+count);
      count++;
    }
  }
}
