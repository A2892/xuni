const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

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
