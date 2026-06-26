const fs = require('fs');
const content = fs.readFileSync('c:/react/Fylex-Final/Fylex-next/app/(customer)/discover/page.jsx', 'utf8');

const stacks = {
    '{': [],
    '(': [],
    '[': [],
    '${': [],
    '`': []
};

let inBacktick = false;

for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '`') {
        inBacktick = !inBacktick;
    }
    
    if (char === '{' && !inBacktick) stacks['{'].push(i);
    if (char === '}' && !inBacktick) stacks['{'].pop();
    
    if (char === '(' && !inBacktick) stacks['('].push(i);
    if (char === ')' && !inBacktick) stacks['('].pop();

    if (char === '[' && !inBacktick) stacks['['].push(i);
    if (char === ']' && !inBacktick) stacks['['].pop();

    if (inBacktick && char === '$' && content[i+1] === '{') {
        stacks['${'].push(i);
    }
    if (inBacktick && char === '}') {
        stacks['${'].pop();
    }
}

console.log('UNBALANCED:');
Object.entries(stacks).forEach(([k, v]) => {
    if (v.length > 0) {
        console.log(`${k}: ${v.length} unbalanced (last at index ${v[v.length-1]})`);
        // Print snippet around last index
        const idx = v[v.length-1];
        console.log(`Snippet: ${content.substring(idx - 20, idx + 20)}`);
    } else {
        console.log(`${k}: Balanced`);
    }
});
if (inBacktick) console.log('UNBALANCED Backtick!');
