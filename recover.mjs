import fs from 'fs';

const logPath = 'C:\\Users\\BAKA\\.gemini\\antigravity-ide\\brain\\f2e1c1b9-0313-47fd-b3af-067fb0bb54de\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(logPath, 'utf8').split('\n');

let foundDiffs = [];
for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const data = JSON.parse(line);
    if (data.type === 'TOOL_RESPONSE' && data.content && Array.isArray(data.content)) {
        const textContent = data.content.map(c => c.text).join('\n');
        if (textContent.includes('Products.jsx') && textContent.includes('diff_block_start')) {
            foundDiffs.push(textContent);
        }
    }
  } catch (err) {
    // ignore
  }
}

if (foundDiffs.length > 0) {
    const targetContent = foundDiffs[foundDiffs.length - 1]; 
    const diffMatch = targetContent.match(/\[diff_block_start\]\n([\s\S]*?)\[diff_block_end\]/);
    if (diffMatch) {
      const diff = diffMatch[1];
      const originalLines = [];
      const diffLines = diff.split('\n');
      for (let i = 0; i < diffLines.length; i++) {
        const dl = diffLines[i];
        if (dl.startsWith('@@ ')) continue;
        if (dl.startsWith('-')) {
          originalLines.push(dl.substring(1));
        } else if (dl.startsWith(' ')) {
          originalLines.push(dl.substring(1));
        }
      }
      fs.writeFileSync('c:\\laragon\\www\\preyson\\preysonweb\\deleted_lines.txt', originalLines.join('\n'));
      console.log("Deleted lines saved to deleted_lines.txt. Count: " + originalLines.length);
    } else {
      console.log("No diff block match in the last tool response.");
    }
} else {
    console.log("Not found any matching tool response.");
}
