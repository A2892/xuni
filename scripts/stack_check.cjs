const fs=require('fs');
const p='vsid-student-generator/src/components/AcademicReportPreview.vue';
const s=fs.readFileSync(p,'utf8');
const tpl=s.match(/<template>[\s\S]*<\/template>/)[0];
const lines=tpl.split('\n');
let stack=[];
for(let i=0;i<lines.length;i++){
  const line=lines[i];
  const open=line.match(/<div(\s|>)/g);
  const close=line.match(/<\/div>/g);
  if(open){for(let k=0;k<open.length;k++){stack.push({line:i+1,txt:line.trim()})}}
  if(close){for(let k=0;k<close.length;k++){const popped=stack.pop();if(!popped){console.log('poped none at line',i+1,'line:',line.trim());}else{/* console.log('pop',popped.line)*/}}}
  if(i>=350&&i<=364) console.log(i+1,'stacklen',stack.length)
}
console.log('final stacklen',stack.length)
console.log('remaining stack:',stack.map(s=>`${s.txt} @ ${s.line}`))
