const fs = require('fs');
const path = require('path');

// Corrections spécifiques pour les erreurs
const corrections = {
  '@/components/shared/EstablishmentTransfer': '@/components/super-admin/EstablishmentTransfer',
  '@/components/shared/EstablishmentTransferHistory': '@/components/super-admin/EstablishmentTransferHistory',
  '@/components/forms/FormCustomizer': '@/components/admin/settings/FormCustomizer',
  '@/components/admin/dashboard/ExcelExportManager': '@/components/admin/settings/ExcelExportManager',
  '@/components/booking/BookingsTable': '@/components/admin/dashboard/BookingsTable',
  '@/components/booking/availability-display': '@/components/shared/availability-display',
};

function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    for (const [wrongPath, correctPath] of Object.entries(corrections)) {
      const regex = new RegExp(`from ["']${wrongPath.replace(/\//g, '\\/')}["']`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, `from "${correctPath}"`);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function walkDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(file)) {
        walkDirectory(filePath, fileList);
      }
    } else if (file.match(/\.(tsx?|jsx?)$/)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

console.log('🔧 Fixing import errors...\n');

const srcDir = path.join(__dirname, 'src');
const files = walkDirectory(srcDir);

let fixedCount = 0;
files.forEach(file => {
  if (fixImportsInFile(file)) {
    fixedCount++;
  }
});

console.log(`\n✨ Fixed ${fixedCount} files!`);
