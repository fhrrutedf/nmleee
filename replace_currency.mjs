import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = [...walk('d:/tmleen/app'), ...walk('d:/tmleen/components'), ...walk('d:/tmleen/lib'), ...walk('d:/tmleen/config')];
let replacedFiles = 0;
for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('ج.م')) {
        content = content.replace(/ج\.م/g, '$');
        fs.writeFileSync(file, content, 'utf8');
        replacedFiles++;
    }
}
console.log('Replaced in ' + replacedFiles + ' files');
