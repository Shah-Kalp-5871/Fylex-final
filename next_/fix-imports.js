const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    if (item.isDirectory()) {
      files = [...files, ...getFiles(path.join(dir, item.name))];
    } else if (item.name.endsWith('.jsx') || item.name.endsWith('.tsx') || item.name.endsWith('.js')) {
      files.push(path.join(dir, item.name));
    }
  }
  return files;
}

const appDir = path.join(__dirname, 'app');
const componentsDir = path.join(__dirname, 'components');

const allFiles = [...getFiles(appDir), ...getFiles(componentsDir)];

let fixedCount = 0;

allFiles.forEach(fullPath => {
  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;

  // 1. Fix CSS imports for admin pages
  if (fullPath.includes(path.join('app', 'admin'))) {
    // Determine depth from admin
    const relativePart = path.relative(path.join(__dirname, 'app', 'admin'), fullPath);
    const depth = relativePart.split(path.sep).length - 1;
    
    // Logic for CSS imports: admin/css/ is the target
    // If depth is 0 (admin/page.jsx), import './css/...' is okay if css is in admin/
    // If depth is 1 (admin/products/page.jsx), import '../css/...'
    // If depth is 2 (admin/products/variants/page.jsx), import '../../css/...'
    
    const targetCssPath = "'@/app/admin/css/custom.css'";
    const targetDtPath = "'@/app/admin/css/datatable.css'";

    if (content.match(/import\s+['"]\.\.?\/css\/custom\.css['"]/)) {
      content = content.replace(/import\s+['"](\.\/|\.\.\/)+css\/custom\.css['"]/g, `import ${targetCssPath}`);
      changed = true;
    }
    if (content.match(/import\s+['"]\.\.?\/css\/datatable\.css['"]/)) {
      content = content.replace(/import\s+['"](\.\/|\.\.\/)+css\/datatable\.css['"]/g, `import ${targetDtPath}`);
      changed = true;
    }
    // Also catch some common misalignments
    if (content.includes("'../../../css/custom.css'")) {
        content = content.replace("'../../../css/custom.css'", targetCssPath);
        changed = true;
    }
    if (content.includes("'../../../css/datatable.css'")) {
        content = content.replace("'../../../css/datatable.css'", targetDtPath);
        changed = true;
    }
  }

  // 2. Fix Context imports
  if (content.match(/import.*['"](\.\.\/)+context\//)) {
    content = content.replace(/import\s+(.*)\s+from\s+['"](\.\.\/)+context\/(.*)['"]/g, "import $1 from '@/context/$3'");
    changed = true;
  }

  // 3. Fix Component imports
  if (content.match(/import.*['"](\.\.\/)+components\//)) {
    content = content.replace(/import\s+(.*)\s+from\s+['"](\.\.\/)+components\/(.*)['"]/g, "import $1 from '@/components/$3'");
    changed = true;
  }

  // 4. Specific fix for AdminModal in admin subpages
  if (content.match(/import.*['"](\.\.\/)+admin\/AdminModal['"]/)) {
      content = content.replace(/import\s+(.*)\s+from\s+['"](\.\.\/)+admin\/AdminModal['"]/g, "import $1 from '@/components/admin/AdminModal'");
      changed = true;
  }
  
  if (content.match(/import.*['"](\.\.\/)+admin\/Sidebar['"]/)) {
      content = content.replace(/import\s+(.*)\s+from\s+['"](\.\.\/)+admin\/Sidebar['"]/g, "import $1 from '@/components/admin/Sidebar'");
      changed = true;
  }

  if (changed) {
    fs.writeFileSync(fullPath, content, 'utf8');
    fixedCount++;
    console.log(`FIXED: ${path.relative(__dirname, fullPath)}`);
  }
});

console.log(`\nTotal files processed: ${allFiles.length}`);
console.log(`Total files fixed: ${fixedCount}`);
