import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixFile(fullPath) {
  let content = fs.readFileSync(fullPath, 'utf8');
  // In ui components, fix import from '../lib/utils' or './utils'
  if (fullPath.includes(path.join('components', 'ui'))) {
    content = content.replace(/from\s+['"]\.\.\/lib\/utils['"]/g, "from './utils'");
    content = content.replace(/from\s+['"]\.\.\/\.\.\/lib\/utils['"]/g, "from './utils'");
  } else {
    content = content.replace(/from\s+['"]\.\.\/\.\.\/([^'"]+)['"]/g, "from '../$1'");
    content = content.replace(/import\s+['"]\.\.\/\.\.\/([^'"]+)['"]/g, "import '../$1'");
  }
  fs.writeFileSync(fullPath, content, 'utf8');
}

function fixDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      fixDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      fixFile(fullPath);
    }
  }
}

fixDir(path.join(__dirname, 'src'));
console.log('Import paths updated successfully!');
