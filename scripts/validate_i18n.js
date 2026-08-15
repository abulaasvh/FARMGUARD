const fs = require('fs');
const path = require('path');

const i18nContent = fs.readFileSync(path.join(__dirname, '../lib/i18n.tsx'), 'utf-8');

function extractDict(code, dictName) {
  const match = code.match(new RegExp(`const ${dictName}: Dict = ({[\\s\\S]*?});`));
  if (match) {
    return JSON.parse(match[1]);
  }
  throw new Error(`Could not find ${dictName}`);
}

const en = extractDict(i18nContent, 'en');
const hi = extractDict(i18nContent, 'hi');
const ta = extractDict(i18nContent, 'ta');
const kn = extractDict(i18nContent, 'kn');
const ml = extractDict(i18nContent, 'ml');
const te = extractDict(i18nContent, 'te');

console.log(`Total keys in English dictionary: ${Object.keys(en).length}`);

const languages = { hi, ta, kn, ml, te };
let allPassed = true;

for (const [lang, dict] of Object.entries(languages)) {
  const missing = [];
  for (const key of Object.keys(en)) {
    if (!dict[key] || dict[key].trim() === '') {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    console.error(`❌ Language [${lang.toUpperCase()}] is missing ${missing.length} keys:`, missing);
    allPassed = false;
  } else {
    console.log(`✅ Language [${lang.toUpperCase()}] has 100% of all ${Object.keys(en).length} keys defined.`);
  }
}

if (allPassed) {
  console.log("\n🎉 ALL 6 LANGUAGES ARE 100% POPULATED WITH ZERO MISSING KEYS!");
}
