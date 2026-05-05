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

function qi(name) {
  return `"${String(name).replace(/"/g, '""')}"`
}

async function main() {
  try {
    const dbName = (await pool.query('SELECT current_database() AS db')).rows[0].db
    const dbIdent = qi(dbName)

    const regionRows = (await pool.query(`SHOW REGIONS FROM DATABASE ${dbIdent}`)).rows
    if (!regionRows || regionRows.length <= 2) {
      console.log(JSON.stringify({
        database: dbName,
        message: 'Current region count is already <= 2',
        regions: regionRows
      }, null, 2))
    } else {
      const primary = regionRows.find((r) => r.primary)?.region || regionRows[0].region
      const secondary = regionRows.find((r) => r.region !== primary)?.region
      const keepSet = new Set([primary, secondary])
      const dropList = regionRows.map((r) => r.region).filter((r) => !keepSet.has(r))

      const dropped = []
      const failed = []
      for (const region of dropList) {
        try {
          await pool.query(`ALTER DATABASE ${dbIdent} DROP REGION ${qi(region)}`)
          dropped.push(region)
        } catch (e) {
          failed.push({ region, error: e.message })
        }
      }

      // Try exact user target replica count.
      let replicaSetResult = null
      try {
        await pool.query(
          `ALTER DATABASE ${dbIdent} CONFIGURE ZONE USING
            num_replicas = 2,
            num_voters = 1,
            constraints = '[]',
            voter_constraints = '[]',
            lease_preferences = '[]'`
        )
        replicaSetResult = { success: true }
      } catch (e) {
        replicaSetResult = { success: false, error: e.message }
      }

      const afterRegions = (await pool.query(`SHOW REGIONS FROM DATABASE ${dbIdent}`)).rows
      const afterZone = (await pool.query(`SHOW ZONE CONFIGURATION FOR DATABASE ${dbIdent}`)).rows[0]

      console.log(JSON.stringify({
        database: dbName,
        kept_regions: [...keepSet],
        dropped_regions: dropped,
        failed_regions: failed,
        replica_set_result: replicaSetResult,
        after_regions: afterRegions,
        after_zone: afterZone,
        note: 'Replica removal is asynchronous; Cockroach rebalances ranges in background.'
      }, null, 2))
    }
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
