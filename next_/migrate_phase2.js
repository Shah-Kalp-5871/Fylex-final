const fs = require('fs');
const path = require('path');

const appDir = 'C:/wamp64/www/student/app';
const compDir = 'C:/wamp64/www/student/components';

// 1. Rename folders for Next.js routing conventions (kebab-case)
function renameFolder(oldName, newName) {
  const oldPath = path.join(appDir, oldName);
  const newPath = path.join(appDir, newName);
  if (fs.existsSync(oldPath) && !fs.existsSync(newPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed: ${oldName} -> ${newName}`);
  }
}

renameFolder('caresupport', 'care-support');
renameFolder('mypurchases', 'my-purchases');
renameFolder('preconfigure', 'pre-configure');
renameFolder('admin/adminproducts', 'admin/products');

// 2. Fix Assets Imports
function fixAssetImports(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      fixAssetImports(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // We are looking for: import name from '../../assets/something.png';
      // and replacing it with: const name = '/assets/something.png';
      const regex = /import\s+(\w+)\s+from\s+['"](?:\.\.\/)+assets\/(.*?)['"];?/g;
      const initialContent = content;
      content = content.replace(regex, "const $1 = '/assets/$2';");
      
      // Also catch explicit `<img src="../../assets/` or `src="../assets/`
      content = content.replace(/src=['"](\.\.\/)+assets\/(.*?)['"]/g, "src='/assets/$2'");
      
      if (content !== initialContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated assets in: ${fullPath}`);
      }
    }
  }
}

fixAssetImports(appDir);
fixAssetImports(compDir);

// 3. Fix AdminLayout CSS import
const adminLayoutSrc = path.join(compDir, 'admin', 'AdminLayout.jsx');
if (fs.existsSync(adminLayoutSrc)) {
   let content = fs.readFileSync(adminLayoutSrc, 'utf8');
   content = content.replace(/import\s+['"]\.\.\/\.\.\/pages\/admin\/css\/custom\.css['"];?/g, "// Move this import to layout.tsx instead");
   fs.writeFileSync(adminLayoutSrc, content, 'utf8');
}

console.log('Phase 2 Cleanup Complete!');
