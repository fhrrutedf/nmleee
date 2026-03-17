const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fullPath.includes('node_modules') || fullPath.includes('.git') || fullPath.includes('.next')) {
            return;
        }
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            results.push(fullPath);
        }
    });
    return results;
}

const files = walk('d:/tmleen');
let count = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const search1 = 'import { authOptions } from "@/app/api/auth/[...nextauth]/route"';
    const search2 = "import { authOptions } from '@/app/api/auth/[...nextauth]/route'";
    const replace = 'import { authOptions } from "@/lib/auth"';
    
    let newContent = content.split(search1).join(replace).split(search2).join(replace);
    
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        count++;
        console.log(`Updated ${file}`);
    }
});
console.log(`Total files updated: ${count}`);
