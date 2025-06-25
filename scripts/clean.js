const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue('🧹 Cleaning development cache...'));

const pathsToClean = [
  'node_modules/.cache',
  '.eslintcache',
  'build',
  'coverage'
];

pathsToClean.forEach(cleanPath => {
  const fullPath = path.join(process.cwd(), cleanPath);
  
  if (fs.existsSync(fullPath)) {
    try {
      if (fs.lstatSync(fullPath).isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(fullPath);
      }
      console.log(chalk.green(`✅ Cleaned: ${cleanPath}`));
    } catch (error) {
      console.log(chalk.red(`❌ Failed to clean: ${cleanPath} - ${error.message}`));
    }
  }
});

console.log(chalk.green('✨ Cleanup completed!'));