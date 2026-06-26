const fs = require('fs');
const content = fs.readFileSync('c:/react/Fylex-Final/Fylex-next/app/(customer)/discover/page.jsx', 'utf8');

// Strip imports/exports to try parsing it as a block
const stripped = content
  .replace(/^import .*/gm, '')
  .replace(/^export default .*/gm, '')
  .replace(/^"use client";.*/gm, '');

try {
    new Function(stripped);
    console.log('Parsed successfully');
} catch (e) {
    console.log('PARSER ERROR:');
    console.log(e.message);
    if (e.stack) {
        // Find line number if available
        console.log(e.stack);
    }
}
