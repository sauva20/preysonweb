const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      if (!file.includes('apiConfig.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.resolve(__dirname, 'src'));

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('import.meta.env.VITE_API_URL')) {
    // Add import statement if not already present
    const relPath = path.relative(path.dirname(f), path.resolve(__dirname, 'src/utils/apiConfig')).replace(/\\/g, '/');
    const importStatement = `import { getApiUrl, getBackendUrl } from '${relPath.startsWith('.') ? relPath : './' + relPath}';\n`;

    if (!content.includes('getApiUrl')) {
      content = importStatement + content;
    }

    content = content.replace(/import\.meta\.env\.VITE_API_URL/g, 'getApiUrl()');
    content = content.replace(/import\.meta\.env\.VITE_BACKEND_URL/g, 'getBackendUrl()');

    fs.writeFileSync(f, content, 'utf8');
    console.log(`Updated ${path.basename(f)}`);
  }
});
