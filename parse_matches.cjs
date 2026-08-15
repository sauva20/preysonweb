const fs = require('fs');
const lines = fs.readFileSync('matches.txt', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (!lines[i].trim()) continue;
  try {
    const data = JSON.parse(lines[i]);
    if (data.type === 'TOOL_RESPONSE' && data.content) {
       // content is usually an array for tool responses
       let textContent = Array.isArray(data.content) ? data.content.map(c => c.text).join('\n') : data.content;
       
       if (textContent.includes('[diff_block_start]')) {
           console.log(`Match ${i} is a diff block`);
           const diffMatch = textContent.match(/\[diff_block_start\]([\s\S]*?)\[diff_block_end\]/);
           if (diffMatch) {
               fs.writeFileSync(`diff_${i}.txt`, diffMatch[1]);
               console.log(`Saved diff_${i}.txt`);
           }
       } else if (textContent.includes('const openModal')) {
           console.log(`Match ${i} contains openModal directly`);
           fs.writeFileSync(`full_${i}.txt`, textContent);
       }
    } else if (data.type === 'PLANNER_RESPONSE' && data.tool_calls) {
       // it might be in the arguments of a tool call
       const toolArgs = JSON.stringify(data.tool_calls);
       if (toolArgs.includes('openModal')) {
           console.log(`Match ${i} is a tool call`);
           fs.writeFileSync(`call_${i}.txt`, toolArgs);
       }
    }
  } catch (err) {
    console.error(`Error on match ${i}`, err.message);
  }
}
