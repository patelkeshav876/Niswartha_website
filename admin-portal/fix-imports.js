import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      fixDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/from\s+['"]\.\.\/\.\.\/([^'"]+)['"]/g, "from '../$1'");
      content = content.replace(/import\s+['"]\.\.\/\.\.\/([^'"]+)['"]/g, "import '../$1'");
      content = content.replace(/from\s+['"]\.\/utils['"]/g, "from '../../lib/utils'");
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

fixDir(path.join(__dirname, 'src/pages'));
fixDir(path.join(__dirname, 'src/components'));
console.log('Import paths fixed successfully!');
