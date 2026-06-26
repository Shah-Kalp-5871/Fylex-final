const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Match any HTML/JSX tag
            const tagRegex = /<([a-zA-Z0-9]+)([\s\S]*?)>/g;
            const newContent = content.replace(tagRegex, (match, tag, attrs) => {
                // Check if it's a button-like element
                const isButtonLike = 
                    ['button', 'a', 'Link'].includes(tag) || 
                    attrs.includes('cursor-pointer') || 
                    attrs.includes('btn') ||
                    attrs.includes('onClick');

                if (isButtonLike) {
                    // Replace class= or className= attributes
                    const classRegex = /(class(?:Name)?\s*=\s*(?:\{[^}]+\}|"[^"]+"|'[^']+'))/g;
                    const newAttrs = attrs.replace(classRegex, (clsMatch) => {
                        return clsMatch.replace(/(?:group-)?hover:[\w-\[\]#.]+\s?/g, '').replace(/ +/g, ' ');
                    });
                    return `<${tag}${newAttrs}>`;
                }
                
                return match;
            });

            if (newContent !== content) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Modified ${fullPath}`);
            }
        }
    }
}

processDir(path.join(__dirname, 'app', 'admin'));
console.log("Done.");
