const fs = require('fs');
const content = fs.readFileSync('c:/react/Fylex-Final/Fylex-next/app/(customer)/discover/page.jsx', 'utf8');

let openBraces = 0, closeBraces = 0;
let openParens = 0, closeParens = 0;
let inString = false, quoteChar = '';

for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if ((char === '"' || char === "'" || char === '`') && content[i-1] !== '\\') {
        if (!inString) {
            inString = true;
            quoteChar = char;
        } else if (char === quoteChar) {
            inString = false;
        }
    }
    if (!inString) {
        if (char === '{') openBraces++;
        if (char === '}') closeBraces++;
        if (char === '(') openParens++;
        if (char === ')') closeParens++;
    }
}

console.log(`Open braces: ${openBraces}, Close: ${closeBraces}, Diff: ${openBraces - closeBraces}`);
console.log(`Open parens: ${openParens}, Close: ${closeParens}, Diff: ${openParens - closeParens}`);
