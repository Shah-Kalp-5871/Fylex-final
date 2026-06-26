const fs = require('fs');
const path = require('path');

const srcDir = 'C:/wamp64/www/fylexx-react/src';
const destDir = 'C:/wamp64/www/student';

// Route conversions we know about
const customerPagesDir = path.join(srcDir, 'pages', 'customer');
const adminPagesDir = path.join(srcDir, 'pages', 'admin');
const componentsDir = path.join(srcDir, 'components');
const contextDir = path.join(srcDir, 'context');
const libDir = path.join(srcDir, 'lib');

function convertCodeToNextHook(content) {
  // Adds 'use client'
  if (!content.trim().startsWith('"use client"')) {
    content = `"use client";\n` + content;
  }
  
  // Replace imports
  content = content.replace(/import\s+\{.*Link.*\}\s+from\s+['"]react-router-dom['"];?/g, "import Link from 'next/link';");
  content = content.replace(/import\s+\{([^}]*?)useNavigate([^}]*?)\}\s+from\s+['"]react-router-dom['"];?/g, (match, p1, p2) => {
    let replaced = match;
    // We might need a separate import for `useRouter`
    return `import { useRouter } from 'next/navigation';\nimport {${p1}${p2}} from 'react-router-dom';`;
  });
  content = content.replace(/import\s+\{([^}]*?)useLocation([^}]*?)\}\s+from\s+['"]react-router-dom['"];?/g, (match, p1, p2) => {
    return `import { usePathname } from 'next/navigation';\nimport {${p1}${p2}} from 'react-router-dom';`;
  });

  // Clean up if the react-router-dom import is empty now
  content = content.replace(/import\s+\{\s*\}\s+from\s+['"]react-router-dom['"];?/g, "");

  // Link components replace
  content = content.replace(/<Link\s+to=/g, "<Link href=");
  
  // Hook replace
  content = content.replace(/useNavigate\(\)/g, "useRouter()");
  content = content.replace(/useLocation\(\)/g, "usePathname()");
  
  return content;
}

function copyAndConvertComponents(source, target) {
  if(!fs.existsSync(source)) return;
  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true });
    }
    const items = fs.readdirSync(source);
    items.forEach(item => copyAndConvertComponents(path.join(source, item), path.join(target, item)));
  } else {
    if (source.endsWith('.jsx') || source.endsWith('.js')) {
      let content = fs.readFileSync(source, 'utf8');
      content = convertCodeToNextHook(content);
      // Since it's jsx we rename to tsx for Next to compile happily if it's TS project, but .jsx works too in Next.js
      // We will keep it .jsx but Next 15 needs it either in components or app.
      // Wait, we can keep the extension .jsx.
      fs.writeFileSync(target, content, 'utf8');
    } else {
      fs.copyFileSync(source, target);
    }
  }
}

// Convert Customer Pages to Next.js App Router format
function convertPagesToAppRouter(pagesPath, appBasePath, routePrefix = '') {
  if(!fs.existsSync(pagesPath)) return;
  const items = fs.readdirSync(pagesPath);
  items.forEach(item => {
    const fullSourcePath = path.join(pagesPath, item);
    const stat = fs.statSync(fullSourcePath);
    if (stat.isDirectory()) {
      convertPagesToAppRouter(fullSourcePath, path.join(appBasePath, item.toLowerCase()), routePrefix + '/' + item.toLowerCase());
    } else if (item.endsWith('.jsx')) {
      const pageName = item.toLowerCase().replace('.jsx', '');
      let content = fs.readFileSync(fullSourcePath, 'utf8');
      content = convertCodeToNextHook(content);
      
      // Determine destination folder
      let destPageFolder = path.join(appBasePath, pageName);
      if(pageName === 'home') {
        // We already handled home
        return; 
      }
      if(pageName === 'dashboard' && routePrefix.includes('admin')) {
         destPageFolder = path.join(appBasePath);
      }
      
      if (!fs.existsSync(destPageFolder)) {
        fs.mkdirSync(destPageFolder, { recursive: true });
      }
      fs.writeFileSync(path.join(destPageFolder, 'page.jsx'), content, 'utf8');
    }
  });
}

console.log('Migrating components, context, and lib...');
// Components already copied earlier but let's re-run with conversion hook!
copyAndConvertComponents(componentsDir, path.join(destDir, 'components'));
copyAndConvertComponents(contextDir, path.join(destDir, 'context'));
copyAndConvertComponents(libDir, path.join(destDir, 'lib'));

console.log('Migrating Customer pages to /app ...');
convertPagesToAppRouter(customerPagesDir, path.join(destDir, 'app'));

console.log('Migrating Admin pages to /app/admin ...');
// Fylexx admin nested pages
const adminAppDir = path.join(destDir, 'app', 'admin');
convertPagesToAppRouter(adminPagesDir, adminAppDir, '/admin');

console.log('Migration Script Complete!');
