const fs = require('fs')
const { compileTemplate } = require('@vue/compiler-sfc')
const path = process.argv[2]
if (!path) { console.error('Usage: node compile_template.cjs <file>'); process.exit(1) }
const s = fs.readFileSync(path,'utf8')
const m = s.match(/<template>[\s\S]*<\/template>/)
if (!m) { console.error('no template'); process.exit(1) }
const tpl = m[0].replace(/^<template>/,'').replace(/<\/template>$/,'')
try {
  const res = compileTemplate({ source: tpl, filename: path, id: 'tmpl' })
  if (res.errors && res.errors.length) {
    console.error('compile errors:')
    for (const e of res.errors) {
      console.error(e.message || e)
      if (e.loc) console.error('loc:', JSON.stringify(e.loc))
    }
    process.exit(1)
  }
  console.log('compile ok')
} catch (e) {
  console.error('compile threw', e.message)
  if (e.loc) console.error('loc:', JSON.stringify(e.loc))
  console.error(e)
  process.exit(1)
}
