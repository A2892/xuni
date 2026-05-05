#!/usr/bin/env node

import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config()

const pool = new pg.Pool({
  connectionString: process.env.COCKROACHDB_URL || process.env.VITE_COCKROACHDB_URL,
  max: 1
})

async function main() {
  const bySourceSql = `
    SELECT
      CASE
        WHEN storage_path LIKE 'cloudinary:%' THEN 'cloudinary'
        WHEN storage_path IS NULL OR storage_path = '' THEN 'no_path'
        ELSE 'cockroach_storage'
      END AS source,
      COUNT(*)::int AS c
    FROM student_media
    WHERE deleted_at IS NULL
      AND type = 'photo'
    GROUP BY 1
    ORDER BY 2 DESC
  `

  const storageSql = `
    SELECT COUNT(*)::int AS c, COALESCE(SUM(file_size), 0)::bigint AS b
    FROM file_storage
    WHERE bucket = 'student-media'
  `

  const trashSql = `
    SELECT COUNT(*)::int AS c
    FROM student_media
    WHERE deleted_at IS NOT NULL
      AND type = 'photo'
  `

  const bySource = await pool.query(bySourceSql)
  const storage = await pool.query(storageSql)
  const trash = await pool.query(trashSql)

  console.log(JSON.stringify({
    active_photo_by_source: bySource.rows,
    file_storage: {
      rows: storage.rows[0]?.c || 0,
      bytes: String(storage.rows[0]?.b || 0)
    },
    trash_photo_rows: trash.rows[0]?.c || 0
  }, null, 2))

  await pool.end()
}

main().catch(async (err) => {
  console.error(err.message || err)
  await pool.end()
  process.exit(1)
})
