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

const args = process.argv.slice(2)
const execute = args.includes('--execute')
const bucketArg = args.find((arg) => arg.startsWith('--bucket='))
const limitArg = args.find((arg) => arg.startsWith('--limit='))
const bucket = bucketArg ? bucketArg.split('=')[1] : 'student-media'
const limit = Math.max(1, Math.min(Number.parseInt(limitArg ? limitArg.split('=')[1] : '2000', 10) || 2000, 20000))

const pool = new Pool({ connectionString, max: 1 })

function toInt(value) {
  const n = Number.parseInt(String(value), 10)
  return Number.isFinite(n) ? n : 0
}

async function main() {
  try {
    const summary = await pool.query(
      `SELECT
         COUNT(*) AS orphan_files,
         COALESCE(SUM(f.file_size), 0) AS orphan_bytes
       FROM file_storage f
       LEFT JOIN student_media m ON m.storage_path = f.path
       WHERE f.bucket = $1 AND m.id IS NULL`,
      [bucket]
    )

    const orphanFiles = toInt(summary.rows[0]?.orphan_files)
    const orphanBytes = BigInt(summary.rows[0]?.orphan_bytes || 0)

    if (!execute) {
      console.log(JSON.stringify({
        mode: 'dry-run',
        bucket,
        orphanFiles,
        orphanBytes: orphanBytes.toString(),
        next: `node scripts/cleanup-unreferenced-storage.mjs --execute --bucket=${bucket} --limit=${limit}`
      }, null, 2))
      return
    }

    if (orphanFiles === 0) {
      console.log(JSON.stringify({
        mode: 'execute',
        bucket,
        orphanFiles,
        deletedFiles: 0,
        deletedBytes: '0'
      }, null, 2))
      return
    }

    const candidates = await pool.query(
      `SELECT f.id, COALESCE(f.file_size, 0) AS file_size
       FROM file_storage f
       LEFT JOIN student_media m ON m.storage_path = f.path
       WHERE f.bucket = $1 AND m.id IS NULL
       LIMIT $2`,
      [bucket, limit]
    )

    const ids = candidates.rows.map((row) => row.id)
    const deletedBytes = candidates.rows.reduce((acc, row) => acc + BigInt(row.file_size || 0), BigInt(0))

    if (ids.length === 0) {
      console.log(JSON.stringify({
        mode: 'execute',
        bucket,
        orphanFiles,
        deletedFiles: 0,
        deletedBytes: '0'
      }, null, 2))
      return
    }

    await pool.query('DELETE FROM file_chunks WHERE file_id = ANY($1::uuid[])', [ids])
    const deleted = await pool.query('DELETE FROM file_storage WHERE id = ANY($1::uuid[])', [ids])

    console.log(JSON.stringify({
      mode: 'execute',
      bucket,
      orphanFiles,
      deletedFiles: deleted.rowCount || 0,
      deletedBytes: deletedBytes.toString(),
      remainingEstimate: Math.max(0, orphanFiles - (deleted.rowCount || 0))
    }, null, 2))
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error('cleanup failed:', err.message || err)
  process.exit(1)
})
