const fs=require('fs');
const path=require('path');
function walk(dir){
  let results=[];
  const list=fs.readdirSync(dir);
  list.forEach(file=>{
    file=path.resolve(dir,file);
    const stat=fs.statSync(file);
    if(stat&&stat.isDirectory()){
      results=results.concat(walk(file));
    }else if(file.endsWith('.jsx')){
      results.push(file);
    }
  });
  return results;
}
const files=walk('src');
files.forEach(f=>{
  let content=fs.readFileSync(f,'utf8');
  let changed=false;
  if(content.includes('`import.meta.env.VITE_API_URL')){
    content=content.replace(/`import\.meta\.env\.VITE_API_URL/g,'`${import.meta.env.VITE_API_URL}');
    changed=true;
  }
  if(content.includes("'import.meta.env.VITE_API_URL")){
    content=content.replace(/'import\.meta\.env\.VITE_API_URL([^']*)'/g,'`${import.meta.env.VITE_API_URL}$1`');
    changed=true;
  }
  if(content.includes('"import.meta.env.VITE_API_URL')){
    content=content.replace(/"import\.meta\.env\.VITE_API_URL([^"]*)"/g,'`${import.meta.env.VITE_API_URL}$1`');
    changed=true;
  }
  if(content.includes("const API_URL = 'import.meta.env.VITE_API_URL'")){
    content=content.replace(/const API_URL = 'import\.meta\.env\.VITE_API_URL';/g, 'const API_URL = import.meta.env.VITE_API_URL;');
    changed=true;
  }
  if(content.includes("const SOCKET_URL = 'import.meta.env.VITE_BACKEND_URL'")){
    content=content.replace(/const SOCKET_URL = 'import\.meta\.env\.VITE_BACKEND_URL';/g, 'const SOCKET_URL = import.meta.env.VITE_BACKEND_URL;');
    changed=true;
  }
  if(changed) fs.writeFileSync(f,content);
});
