const fs = require('fs');
const path = '/Users/chenjunhao/Downloads/0_副本9/vsid-student-generator/src/components/BankStatementPreview.vue';

try {
  const content = fs.readFileSync(path, 'utf8');
  const startIndex = content.indexOf('<template>');
  const endIndex = content.lastIndexOf('</template>');
  const templateContent = content.substring(startIndex + 10, endIndex);

  const tagsToCheck = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'template', 'svg', 'path', 'line', 'polygon', 'polyline'];
  
  tagsToCheck.forEach(tag => {
      const openRegex = new RegExp(`<${tag}\\b`, 'g');
      const closeRegex = new RegExp(`<\\/${tag}>`, 'g');
      
      const openCount = (templateContent.match(openRegex) || []).length;
      const closeCount = (templateContent.match(closeRegex) || []).length;
      
      if (openCount !== closeCount) {
          console.log(`Mismatch for <${tag}>: Open=${openCount}, Close=${closeCount}`);
      } else {
          // console.log(`Match for <${tag}>: ${openCount}`);
      }
  });

} catch (e) {
  console.error(e);
}
