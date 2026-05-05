const fs = require('fs');
const path = '/Users/chenjunhao/Downloads/0_副本9/vsid-student-generator/src/components/BankStatementPreview.vue';

try {
  const content = fs.readFileSync(path, 'utf8');
  const startIndex = content.indexOf('<template>');
  const endIndex = content.lastIndexOf('</template>');
  const templateContent = content.substring(startIndex + 10, endIndex);

  // Simple parser to find unclosed tags
  const tags = [];
  const voidTags = ['img', 'br', 'hr', 'input', 'meta', 'link', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon'];
  
  let i = 0;
  while (i < templateContent.length) {
    if (templateContent[i] === '<') {
      if (templateContent.substr(i, 4) === '<!--') {
        // Skip comment
        const endComment = templateContent.indexOf('-->', i);
        if (endComment !== -1) {
          i = endComment + 3;
          continue;
        }
      }
      
      const close = templateContent[i+1] === '/';
      let tagNameEnd = i + 1;
      while (tagNameEnd < templateContent.length && /[a-zA-Z0-9\-]/.test(templateContent[tagNameEnd])) {
        tagNameEnd++;
      }
      
      // Handle </div > or <div >
      if (close) {
          // Closing tag
          const tagName = templateContent.substring(i+2, tagNameEnd).trim();
          // Find matching opening tag in stack
          let found = false;
          for (let j = tags.length - 1; j >= 0; j--) {
              if (tags[j].name === tagName) {
                  tags.splice(j, tags.length - j); // Pop everything up to this tag
                  found = true;
                  break;
              }
          }
          if (!found) {
              console.log(`Error: Unexpected closing tag </${tagName}> at index ${i}`);
          }
      } else {
          // Opening tag
          const tagName = templateContent.substring(i+1, tagNameEnd).trim();
          if (tagName) {
             // Check if self-closing
             const tagEnd = templateContent.indexOf('>', i);
             const selfClosing = templateContent[tagEnd-1] === '/';
             
             if (!voidTags.includes(tagName) && !selfClosing) {
                 tags.push({ name: tagName, index: i });
             }
          }
      }
      i = tagNameEnd;
    } else {
      i++;
    }
  }
  
  if (tags.length > 0) {
      console.log("Unclosed tags found:");
      tags.forEach(t => console.log(`<${t.name}> at index ${t.index}`));
      
      // Print context for the first unclosed tag
      const first = tags[0];
      const start = Math.max(0, first.index - 50);
      const end = Math.min(templateContent.length, first.index + 100);
      console.log("Context:");
      console.log(templateContent.substring(start, end));
  } else {
      console.log("No unclosed tags found.");
  }

} catch (e) {
  console.error(e);
}
