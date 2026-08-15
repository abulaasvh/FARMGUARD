const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.next') && !fullPath.includes('components/ui')) {
        results = results.concat(walk(fullPath));
      }
    } else if (fullPath.endsWith('.tsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, '../app')).concat(walk(path.join(__dirname, '../components')));

console.log(`Auditing template literals and toasts across ${files.length} tsx files...`);

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    // Check for toasts with string literals
    const toastMatch = line.match(/toast\.(success|error|info|warning)\(["'`]([^"'`]+)["'`]\)/);
    if (toastMatch) {
      if (!line.includes('t(')) {
        console.log(`[Toast Literal] ${path.relative(path.join(__dirname, '..'), file)}:${idx + 1} -> "${toastMatch[2]}"`);
      }
    }
  });
}
