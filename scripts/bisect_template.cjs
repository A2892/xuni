const fs = require('fs')
const { compileTemplate } = require('@vue/compiler-sfc')
const path = process.argv[2]
if (!path) { console.error('Usage: node bisect_template.cjs <file>'); process.exit(1) }
const s = fs.readFileSync(path,'utf8')
const m = s.match(/<template>[\s\S]*<\/template>/)
if (!m) { console.error('no template'); process.exit(1) }
const tpl = m[0].replace(/^<template>/, '').replace(/<\/template>$/, '')
const lines = tpl.split('\n')
let lo = 1, hi = lines.length
let bad = -1
while (lo <= hi) {
  const mid = Math.floor((lo + hi) / 2)
  const part = lines.slice(0, mid).join('\n')
  try {
    const res = compileTemplate({ source: part, filename: path, id: 'bisect' })
    if (res.errors && res.errors.length) {
      bad = mid
      hi = mid - 1
    } else {
      lo = mid + 1
    }
  } catch (e) {
    bad = mid; hi = mid - 1
  }
}
if (bad === -1) console.log('no error found in prefixes')
else {
  console.log('first bad prefix ends at line', bad)
  console.log('line content:', lines[bad-1])
}
