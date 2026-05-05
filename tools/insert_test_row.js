// Test script: attempt to insert a test row into saved_documents via Supabase REST
// Usage:
//   node -r dotenv/config tools/insert_test_row.js
// The script will read VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from .env

(async () => {
  try {
    // try to load dotenv if available
    try { require('dotenv').config() } catch (e) {}

    const url = process.env.VITE_SUPABASE_URL
    const anon = process.env.VITE_SUPABASE_ANON_KEY
    if (!url || !anon) {
      console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment')
      process.exit(1)
    }

    const endpoint = `${url.replace(/\/+$/, '')}/rest/v1/saved_documents`

    const body = {
      document_type: 'transcript',
      name: 'test-insert-' + Date.now(),
      data: { test: true },
      updated_at: new Date().toISOString()
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anon,
        'Authorization': `Bearer ${anon}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(body)
    })

    const text = await res.text()
    console.log('Status:', res.status)
    console.log('Response:', text)
  } catch (err) {
    console.error('Error running test insert:', err)
  }
})()
