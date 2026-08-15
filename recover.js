const fs = require('fs');

const logPath = 'C:\\Users\\BAKA\\.gemini\\antigravity-ide\\brain\\f2e1c1b9-0313-47fd-b3af-067fb0bb54de\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(logPath, 'utf8').split('\n');

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const data = JSON.parse(line);
    if (data.type === 'TOOL_RESPONSE' && data.content.includes('Products.jsx') && data.content.includes('diff_block_start')) {
      if (data.content.includes('-    }\n-  };\n-\n-  const openModal = (product = null) => {')) {
        console.log("Found the target tool response.");
        // Extract the diff block
        const diffMatch = data.content.match(/\[diff_block_start\]\n([\s\S]*?)\[diff_block_end\]/);
        if (diffMatch) {
          const diff = diffMatch[1];
          // We need to extract the lines starting with '-' and remove the leading '-'
          const originalLines = [];
          const diffLines = diff.split('\n');
          for (let i = 0; i < diffLines.length; i++) {
            const dl = diffLines[i];
            if (dl.startsWith('@@ ')) continue; // Skip header
            if (dl.startsWith('-')) {
              originalLines.push(dl.substring(1));
            } else if (dl.startsWith(' ')) {
              // Context lines, but since we are replacing a massive deleted block, we don't necessarily want to duplicate context lines unless they were actually deleted.
              // Actually, the diff represents exactly what was changed. 
              // The original file is simply the file BEFORE this diff was applied.
              // Wait, I have an easier way!
              // I can just read the original file BEFORE this tool call from the local History or `.gemini` backup if there is one. But there isn't.
            }
          }
          fs.writeFileSync('c:\\laragon\\www\\preyson\\preysonweb\\deleted_lines.txt', originalLines.join('\n'));
          console.log("Deleted lines saved to deleted_lines.txt");
        }
      }
    }
  } catch (err) {
    // ignore parse errors
  }
}
