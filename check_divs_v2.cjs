const fs = require('fs');
const path = '/Users/chenjunhao/Downloads/0_副本9/vsid-student-generator/src/components/BankStatementPreview.vue';

try {
  const content = fs.readFileSync(path, 'utf8');
  // Find the last </template> to handle nested templates if any (though unlikely in Vue root)
  // Actually Vue SFC usually has one top level <template>
  const startIndex = content.indexOf('<template>');
  const endIndex = content.lastIndexOf('</template>');
  
  if (startIndex === -1 || endIndex === -1) {
      console.log("Template tags not found");
      process.exit(1);
  }

  const templateContent = content.substring(startIndex + 10, endIndex);
  console.log(`Template content length: ${templateContent.length}`);
  
  const openDivs = (templateContent.match(/<div\b/g) || []).length;
  const closeDivs = (templateContent.match(/<\/div>/g) || []).length;
  
  console.log(`Open divs: ${openDivs}`);
  console.log(`Close divs: ${closeDivs}`);
  
  const lines = templateContent.split('\n');
  let stack = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const open = (line.match(/<div\b/g) || []).length;
    const close = (line.match(/<\/div>/g) || []).length;
    stack += open - close;
  }
  console.log(`Final stack: ${stack}`);

} catch (e) {
  console.error(e);
}
