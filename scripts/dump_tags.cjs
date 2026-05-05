const fs = require('fs')
const path = process.argv[2]
if (!path) { console.error('Usage: node dump_tags.cjs <file>'); process.exit(1) }
const s = fs.readFileSync(path,'utf8')
const m = s.match(/<template>[\s\S]*<\/template>/)
if (!m) { console.error('no template'); process.exit(1) }
const tpl = m[0]
const lines = tpl.split('\n')
let pos = 0
const lineOffsets = lines.map(l => { const p = pos; pos += l.length + 1; return p })
const tagRegex = new RegExp('(<\\/?\\s*([a-zA-Z0-9\\-:]+)[^>]*>)','g')
let mm
while (mm = tagRegex.exec(tpl)) {
  const full = mm[1]
  const name = mm[2]
  const idx = mm.index
  let line = 0
  for (let i = 0; i < lineOffsets.length; i++) { if (lineOffsets[i] > idx) { line = i - 1; break } if (i === lineOffsets.length - 1) line = lineOffsets.length - 1 }
  console.log(line+1, full.replace(/\n/g,' '))
}
