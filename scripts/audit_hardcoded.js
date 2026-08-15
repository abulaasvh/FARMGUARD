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

console.log(`Auditing ${files.length} tsx files for potential hardcoded English strings...`);

const commonSuspiciousWords = [
  "Acres", "Acre", "Crop", "Plot", "Status", "Actions", "Settings", "Dashboard",
  "Sensors", "Weather", "Humidity", "Temperature", "Moisture", "Irrigation",
  "Forecast", "Alerts", "Marketplace", "Save", "Cancel", "Delete", "Edit",
  "Submit", "Retry", "Loading", "Search", "Filter", "Upcoming", "Active",
  "Pending", "Healthy", "Running", "Offline", "Online"
];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    // Check for raw text in JSX (e.g. >Some English< or placeholder="English" or title="English")
    const placeholderMatch = line.match(/placeholder=["']([^"']+)["']/);
    if (placeholderMatch && !placeholderMatch[1].startsWith('{') && placeholderMatch[1].trim().length > 0) {
      if (!line.includes('t(')) {
        console.log(`[Placeholder] ${path.relative(path.join(__dirname, '..'), file)}:${idx + 1} -> "${placeholderMatch[1]}"`);
      }
    }
  });
}
