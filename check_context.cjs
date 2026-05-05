const fs = require('fs');
const path = '/Users/chenjunhao/Downloads/0_副本9/vsid-student-generator/src/components/BankStatementPreview.vue';

try {
  const content = fs.readFileSync(path, 'utf8');
  const startIndex = content.indexOf('<template>');
  const endIndex = content.lastIndexOf('</template>');
  const templateContent = content.substring(startIndex + 10, endIndex);

  const index = 1610;
  const start = Math.max(0, index - 50);
  const end = Math.min(templateContent.length, index + 50);
  
  console.log(templateContent.substring(start, end));

} catch (e) {
  console.error(e);
}
