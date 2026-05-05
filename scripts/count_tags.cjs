const fs = require('fs');
const path = process.argv[2];
if(!path){console.error('Usage: node count_tags.cjs <file>'); process.exit(1)}
const s = fs.readFileSync(path,'utf8');
const m = s.match(/<template>[\s\S]*<\/template>/);
const tpl = m ? m[0] : '';
console.log('div open', (tpl.match(/<div(\s|>)/g)||[]).length);
console.log('div close', (tpl.match(/<\/div>/g)||[]).length);
console.log('template open', (tpl.match(/<template(\s|>)/g)||[]).length);
console.log('template close', (tpl.match(/<\/template>/g)||[]).length);
