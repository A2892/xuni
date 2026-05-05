const { createClient } = require('@supabase/supabase-js')
// Load .env file manually if environment variables are missing
const fs = require('fs')
const path = require('path')
const envPath = path.resolve(__dirname, '..', '.env')
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split(/\r?\n/).forEach(line => {
      const m = line.match(/^\s*([A-Za-z0-9_]+)=(.*)$/)
      if (m) {
        const key = m[1]
        let val = m[2]
        // remove optional surrounding quotes
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1)
        }
        if (!process.env[key]) process.env[key] = val
      }
    })
  } catch (e) {
    // ignore
  }
}

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Supabase URL or KEY not found in environment')
  process.exit(1)
}

const supabase = createClient(url, key)

async function run() {
  try {
    const { data, error } = await supabase
      .from('student_media')
      .select('id, file_name, student_name, student_id, folder_id')
      .limit(50)
      .order('created_at', { ascending: false })

    if (error) throw error

    const folderSet = new Set()
    data.forEach(r => folderSet.add(String(r.folder_id)))

    console.log('Distinct folder_id samples (up to 20):')
    console.log(Array.from(folderSet).slice(0, 20))

    console.log('\nSample rows:')
    console.table(data.map(r => ({ id: r.id, file_name: r.file_name, student_name: r.student_name, student_id: r.student_id, folder_id: r.folder_id })))
  } catch (e) {
    console.error('Error:', e)
  }
}

run()
