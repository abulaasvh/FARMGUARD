const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.next')) {
        results = results.concat(walk(fullPath));
      }
    } else if (fullPath.endsWith('.tsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, '../app')).concat(walk(path.join(__dirname, '../components')));

console.log(`Deep checking ${files.length} tsx files for raw JSX text...`);

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    // Check for raw text between > and <
    const matches = line.match(/>([^<>{}\n]+)</g);
    if (matches) {
      matches.forEach(m => {
        const text = m.slice(1, -1).trim();
        // Ignore punctuation, symbols, numbers, empty, technical tokens
        if (text && text.length > 1 && !/^[\d\s.,:/%°+–\-_()#₹&|•·\\[\]{}]+$/.test(text)) {
          // Check if it looks like English words
          if (/^[A-Za-z]/.test(text) && !text.startsWith('http') && !text.startsWith('bg-') && !text.startsWith('text-')) {
            console.log(`[Raw JSX Text] ${path.relative(path.join(__dirname, '..'), file)}:${idx + 1} -> "${text}"`);
          }
        }
      });
    }
  });
}
