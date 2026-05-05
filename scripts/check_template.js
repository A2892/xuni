const fs = require('fs')
const path = process.argv[2]
if (!path) {
  console.error('Usage: node check_template.js <path-to-vue-file>')
  process.exit(1)
}
const s = fs.readFileSync(path, 'utf8')
const m = s.match(/<template>[\s\S]*?<\/template>/)
if (!m) {
  console.error('no template')
  process.exit(1)
}
const tpl = m[0].replace(/<!--([\s\S]*?)-->/g, '')
const voids = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'])
const tagRegex = new RegExp('(<\\/?\\s*([a-zA-Z0-9\\-:]+)[^>]*>)','g')
let mm
const stack = []
const lines = tpl.split('\n')
let pos = 0
const lineOffsets = lines.map(l => { const p = pos; pos += l.length + 1; return p })
while (mm = tagRegex.exec(tpl)) {
  const full = mm[1]
  const name = mm[2]
  const idx = mm.index
  let line = 0
  for (let i = 0; i < lineOffsets.length; i++) {
    if (lineOffsets[i] > idx) { line = i - 1; break }
    if (i === lineOffsets.length - 1) line = lineOffsets.length - 1
  }
  if (full.startsWith('</')) {
    if (stack.length === 0 || stack[stack.length - 1] !== name) {
      console.error('MISMATCH closing', name, 'at approx line', line + 1)
      process.exit(2)
    } else stack.pop()
  } else {
    const selfClosing = /\/[\s]*>$/.test(full)
    if (selfClosing || voids.has(name.toLowerCase())) continue
    stack.push(name)
  }
}
if (stack.length) {
  console.error('UNCLOSED tags:', stack)
  process.exit(3)
}
console.log('TAGS OK for', path)
