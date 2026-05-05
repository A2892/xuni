#!/usr/bin/env node

import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config()

const pool = new pg.Pool({
  connectionString: process.env.COCKROACHDB_URL || process.env.VITE_COCKROACHDB_URL,
  max: 1
})

async function main() {
  const summarySql = `
    SELECT
      COUNT(*)::int AS groups,
      COALESCE(SUM(c) - COUNT(*), 0)::int AS duplicate_rows
    FROM (
      SELECT
        student_name,
        COALESCE(folder_id, '') AS folder_key,
        file_name,
        file_size,
        type,
        COUNT(*)::int AS c
      FROM student_media
      WHERE deleted_at IS NULL
        AND type = 'photo'
      GROUP BY student_name, COALESCE(folder_id, ''), file_name, file_size, type
      HAVING COUNT(*) > 1
    ) t
  `

  const sampleSql = `
    SELECT
      student_name,
      COALESCE(folder_id, '') AS folder_id,
      file_name,
      file_size,
      COUNT(*)::int AS c,
      MIN(created_at) AS oldest,
      MAX(created_at) AS newest
    FROM student_media
    WHERE deleted_at IS NULL
      AND type = 'photo'
    GROUP BY student_name, COALESCE(folder_id, ''), file_name, file_size
    HAVING COUNT(*) > 1
    ORDER BY c DESC, newest DESC
    LIMIT 30
  `

  const summary = await pool.query(summarySql)
  const samples = await pool.query(sampleSql)

  console.log(JSON.stringify({ summary: summary.rows[0], samples: samples.rows }, null, 2))
  await pool.end()
}

main().catch(async (e) => {
  console.error(e.message)
  await pool.end()
  process.exit(1)
})
