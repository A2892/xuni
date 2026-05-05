#!/usr/bin/env node

import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config()

const { Pool } = pg
const connectionString = process.env.COCKROACHDB_URL || process.env.VITE_COCKROACHDB_URL || ''

if (!connectionString) {
  console.error('Missing COCKROACHDB_URL / VITE_COCKROACHDB_URL')
  process.exit(1)
}

const pool = new Pool({ connectionString, max: 1 })

async function safeQuery(sql) {
  try {
    const res = await pool.query(sql)
    return { ok: true, rows: res.rows }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

async function main() {
  try {
    const db = (await pool.query('SELECT current_database() AS db')).rows[0].db
    const qi = `"${String(db).replace(/"/g, '""')}"`

    const results = {
      database: db,
      regions: await safeQuery(`SHOW REGIONS FROM DATABASE ${qi}`),
      zoneConfig: await safeQuery(`SHOW ZONE CONFIGURATION FOR DATABASE ${qi}`),
      zoneConfigs: await safeQuery('SHOW ZONE CONFIGURATIONS')
    }

    if (results.zoneConfigs.ok) {
      results.zoneConfigs.rows = results.zoneConfigs.rows
        .filter((r) => typeof r.target === 'string' && r.target.includes(db))
        .slice(0, 30)
    }

    console.log(JSON.stringify(results, null, 2))
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
