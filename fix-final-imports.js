const fs = require('fs');
const path = require('path');

// Dernières corrections
const finalCorrections = {
  // TutorialGuide est maintenant dans shared, pas dans settings
  "'./TutorialGuide'": "'@/components/shared/TutorialGuide'",
  '"./TutorialGuide"': '"@/components/shared/TutorialGuide"',
  
  // BookingFormDetails est maintenant dans booking, pas dans forms
  '@/components/forms/BookingFormDetails': '@/components/booking/BookingFormDetails',
  
  // AutoEmailConfirmation est dans admin/email, pas dans confirmation
  '@/components/confirmation/AutoEmailConfirmation': '@/components/admin/email/AutoEmailConfirmation',
};

function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    for (const [wrongPath, correctPath] of Object.entries(finalCorrections)) {
      // Pour les imports relatifs
      if (wrongPath.includes('./')) {
        const regex = new RegExp(`from ${wrongPath.replace(/\//g, '\\/')}`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, `from ${correctPath}`);
          modified = true;
        }
      } else {
        // Pour les imports absolus
        const regex = new RegExp(`from ["']${wrongPath.replace(/\//g, '\\/')}["']`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, `from "${correctPath}"`);
          modified = true;
        }
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

console.log('🔧 Final import fixes...\n');

const srcDir = path.join(__dirname, 'src');
const files = walkDirectory(srcDir);

let fixedCount = 0;
files.forEach(file => {
  if (fixImportsInFile(file)) {
    fixedCount++;
  }
});

console.log(`\n✨ Fixed ${fixedCount} files!`);
