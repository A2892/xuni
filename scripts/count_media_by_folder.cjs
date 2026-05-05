const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// load .env if present
const envPath = path.resolve(__dirname, '..', '.env')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split(/\r?\n/).forEach(line => {
    const m = line.match(/^\s*([A-Za-z0-9_]+)=(.*)$/)
    if (m) {
      const key = m[1]
      let val = m[2]
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = val
    }
  })
}

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Supabase URL or KEY not found in environment')
  process.exit(1)
}

const supabase = createClient(url, key)

async function run() {
  try {
    const { data, error } = await supabase
      .from('student_media')
      .select('folder_id')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(10000)

    if (error) throw error

    const map = new Map()
    data.forEach(r => {
      const k = r.folder_id === null ? '__NULL__' : String(r.folder_id)
      map.set(k, (map.get(k) || 0) + 1)
    })

    const arr = Array.from(map.entries()).map(([folder_id, count]) => ({ folder_id: folder_id === '__NULL__' ? null : folder_id, count }))
    arr.sort((a, b) => b.count - a.count)
    console.log('folder_id counts (top 50):')
    console.table(arr.slice(0, 50))
  } catch (e) {
    console.error('Error:', e)
  }
}

run()
