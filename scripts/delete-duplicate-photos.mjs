#!/usr/bin/env node

import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config()

const pool = new pg.Pool({
  connectionString: process.env.COCKROACHDB_URL || process.env.VITE_COCKROACHDB_URL,
  max: 1
})

const execute = process.argv.includes('--execute')

const DUPES_CTE = `
  WITH ranked AS (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY
          COALESCE(student_name, ''),
          COALESCE(folder_id, ''),
          COALESCE(file_name, ''),
          COALESCE(file_size, 0),
          COALESCE(type, '')
        ORDER BY created_at DESC, id DESC
      ) AS rn
    FROM student_media
    WHERE deleted_at IS NULL
      AND type = 'photo'
  )
  SELECT id
  FROM ranked
  WHERE rn > 1
`

async function main() {
  try {
    const countSql = `SELECT COUNT(*)::int AS c FROM (${DUPES_CTE}) d`
    const countRes = await pool.query(countSql)
    const duplicateCount = Number(countRes.rows[0]?.c || 0)

    if (!execute) {
      console.log(JSON.stringify({
        mode: 'dry-run',
        duplicatesToDelete: duplicateCount,
        next: 'node scripts/delete-duplicate-photos.mjs --execute'
      }, null, 2))
      return
    }

    if (duplicateCount === 0) {
      console.log(JSON.stringify({
        mode: 'execute',
        duplicatesToDelete: 0,
        deleted: 0,
        message: 'No duplicate photos found.'
      }, null, 2))
      return
    }

    const updateSql = `
      UPDATE student_media
      SET deleted_at = NOW()
      WHERE id IN (${DUPES_CTE})
      RETURNING id
    `

    const updated = await pool.query(updateSql)

    console.log(JSON.stringify({
      mode: 'execute',
      duplicatesToDelete: duplicateCount,
      deleted: updated.rowCount || 0
    }, null, 2))
  } finally {
    await pool.end()
  }
}

main().catch(async (err) => {
  console.error(err.message || err)
  await pool.end()
  process.exit(1)
})
