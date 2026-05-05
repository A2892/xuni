#!/usr/bin/env node

import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config()

const { Pool } = pg

const connectionString =
  process.env.COCKROACHDB_URL ||
  process.env.VITE_COCKROACHDB_URL ||
  process.env.COCKROACHDB_TARGET_URL ||
  process.env.DATABASE_URL ||
  ''

if (!connectionString) {
  console.error('Error: missing database connection string (COCKROACHDB_URL / DATABASE_URL).')
  process.exit(1)
}

const targetReplicas = Number.parseInt(process.argv[2] || '2', 10)
if (!Number.isFinite(targetReplicas) || targetReplicas < 1) {
  console.error('Usage: node scripts/set-db-replicas.mjs <replicas>=2')
  process.exit(1)
}

// For even replica counts, Cockroach requires voters <= replicas and typically odd.
const targetVoters = targetReplicas % 2 === 0 ? Math.max(1, targetReplicas - 1) : targetReplicas

const pool = new Pool({ connectionString, max: 1 })

function quoteIdent(name) {
  return `"${String(name).replace(/"/g, '""')}"`
}

async function main() {
  try {
    const dbRow = (await pool.query('SELECT current_database() AS db')).rows[0]
    const dbName = dbRow?.db
    if (!dbName) {
      throw new Error('Cannot determine current database name')
    }

    const dbIdent = quoteIdent(dbName)

    let before = null
    try {
      before = (await pool.query(`SHOW ZONE CONFIGURATION FOR DATABASE ${dbIdent}`)).rows[0] || null
    } catch (e) {
      before = { error: e.message }
    }

    await pool.query(
      `ALTER DATABASE ${dbIdent} CONFIGURE ZONE USING
        num_replicas = ${targetReplicas},
        num_voters = ${targetVoters},
        constraints = '[]',
        voter_constraints = '[]',
        lease_preferences = '[]'`
    )

    const after = (await pool.query(`SHOW ZONE CONFIGURATION FOR DATABASE ${dbIdent}`)).rows[0] || null

    console.log(
      JSON.stringify(
        {
          database: dbName,
          applied: {
            num_replicas: targetReplicas,
            num_voters: targetVoters
          },
          before,
          after,
          note: 'Extra replicas are removed asynchronously by Cockroach rebalancing; no manual per-replica delete is needed.'
        },
        null,
        2
      )
    )
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error('Failed to update replica configuration:', err.message || err)
  process.exit(1)
})
