const fs = require('fs');
const path = '/Users/chenjunhao/Downloads/0_副本9/vsid-student-generator/src/components/BankStatementPreview.vue';

try {
  const content = fs.readFileSync(path, 'utf8');
  const templateContent = content.match(/<template>([\s\S]*?)<\/template>/)[1];
  
  const openDivs = (templateContent.match(/<div\b/g) || []).length;
  const closeDivs = (templateContent.match(/<\/div>/g) || []).length;
  
  console.log(`Open divs: ${openDivs}`);
  console.log(`Close divs: ${closeDivs}`);
  
  if (openDivs !== closeDivs) {
    console.log('Mismatch found!');
    
    // Simple stack checker
    const lines = templateContent.split('\n');
    let stack = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const open = (line.match(/<div\b/g) || []).length;
      const close = (line.match(/<\/div>/g) || []).length;
      stack += open - close;
      if (stack < 0) {
        console.log(`Stack went negative at line ${i + 1}: ${line.trim()}`);
      }
    }
    console.log(`Final stack: ${stack}`);
  } else {
    console.log('Div counts match.');
  }
} catch (e) {
  console.error(e);
}
