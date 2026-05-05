const fs = require('fs');
const path = '/Users/chenjunhao/Downloads/0_副本9/vsid-student-generator/src/components/BankStatementPreview.vue';

try {
  const content = fs.readFileSync(path, 'utf8');
  const startIndex = content.indexOf('<template>');
  const endIndex = content.lastIndexOf('</template>');
  const templateContent = content.substring(startIndex + 10, endIndex);

  const lines = templateContent.split('\n');
  let stack = 0;
  let lastPositive = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const open = (line.match(/<div\b/g) || []).length;
    const close = (line.match(/<\/div>/g) || []).length;
    stack += open - close;
    
    if (stack > 0) {
      lastPositive = i;
    }
    
    if (i > lines.length - 20) {
      console.log(`Line ${i+1}: stack=${stack}, open=${open}, close=${close}: ${line.trim().substring(0, 60)}`);
    }
  }
  
  console.log(`\nFinal stack: ${stack}`);
  console.log(`Last positive stack at line: ${lastPositive + 1}`);

} catch (e) {
  console.error(e);
}
