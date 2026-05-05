#!/usr/bin/env node

import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config()

const pool = new pg.Pool({
  connectionString: process.env.COCKROACHDB_URL || process.env.VITE_COCKROACHDB_URL,
  max: 1
})

const execute = process.argv.includes('--execute')
const MAX_RETRIES = Number.parseInt(process.env.PURGE_RETRIES || '6', 10)

function toInt(v) {
  const n = Number.parseInt(String(v), 10)
  return Number.isFinite(n) ? n : 0
}

async function main() {
  const client = await pool.connect()
  try {
    const beforeTrash = await client.query(
      `SELECT COUNT(*)::int AS c, COALESCE(SUM(file_size), 0)::bigint AS b
       FROM student_media
       WHERE deleted_at IS NOT NULL`
    )

    const beforeStorage = await client.query(
      `SELECT COUNT(*)::int AS c, COALESCE(SUM(file_size), 0)::bigint AS b
       FROM file_storage
       WHERE bucket = 'student-media'`
    )

    const trashRows = toInt(beforeTrash.rows[0]?.c)
    const trashBytes = String(beforeTrash.rows[0]?.b || '0')

    if (!execute) {
      console.log(JSON.stringify({
        mode: 'dry-run',
        trashRows,
        trashBytes,
        storageRows: toInt(beforeStorage.rows[0]?.c),
        storageBytes: String(beforeStorage.rows[0]?.b || '0'),
        next: 'node scripts/purge-media-trash-and-storage.mjs --execute'
      }, null, 2))
      return
    }

    const isRetryable = (error) => {
      const msg = String(error?.message || error || '')
      return (
        msg.includes('TransactionRetryWithProtoRefreshError') ||
        msg.includes('restart transaction') ||
        msg.includes('40001')
      )
    }

    let deletedCount = 0
    let deletedChunks = 0
    let deletedFiles = 0
    let candidateBytes = 0n
    let success = false

    for (let attempt = 1; attempt <= Math.max(1, MAX_RETRIES); attempt++) {
      try {
        await client.query('BEGIN')

        const deletedMedia = await client.query(
          `DELETE FROM student_media
           WHERE deleted_at IS NOT NULL
           RETURNING id, storage_path`
        )

        deletedCount = deletedMedia.rowCount || 0
        const deletedPaths = [...new Set(
          deletedMedia.rows
            .map((r) => String(r.storage_path || '').trim())
            .filter((p) => p.length > 0)
        )]

        let candidateFiles = []
        if (deletedPaths.length > 0) {
          const candidateRes = await client.query(
            `SELECT f.id, f.path, COALESCE(f.file_size, 0)::bigint AS file_size
             FROM file_storage f
             WHERE f.bucket = 'student-media'
               AND f.path = ANY($1::text[])
               AND NOT EXISTS (
                 SELECT 1
                 FROM student_media m
                 WHERE m.storage_path = f.path
                   AND m.deleted_at IS NULL
               )`,
            [deletedPaths]
          )
          candidateFiles = candidateRes.rows
        }

        const fileIds = candidateFiles.map((r) => r.id)
        candidateBytes = candidateFiles.reduce((acc, r) => acc + BigInt(r.file_size || 0), 0n)
        deletedChunks = 0
        deletedFiles = 0

        if (fileIds.length > 0) {
          const chunkRes = await client.query(
            `DELETE FROM file_chunks
             WHERE file_id = ANY($1::uuid[])`,
            [fileIds]
          )
          deletedChunks = chunkRes.rowCount || 0

          const fileRes = await client.query(
            `DELETE FROM file_storage
             WHERE id = ANY($1::uuid[])`,
            [fileIds]
          )
          deletedFiles = fileRes.rowCount || 0
        }

        await client.query('COMMIT')
        success = true
        break
      } catch (error) {
        try {
          await client.query('ROLLBACK')
        } catch {
          // ignore rollback errors
        }

        if (!isRetryable(error) || attempt >= Math.max(1, MAX_RETRIES)) {
          throw error
        }

        await new Promise((resolve) => setTimeout(resolve, attempt * 500))
      }
    }

    if (!success) {
      throw new Error('purge transaction failed after retries')
    }

    const afterTrash = await client.query(
      `SELECT COUNT(*)::int AS c
       FROM student_media
       WHERE deleted_at IS NOT NULL`
    )

    const afterStorage = await client.query(
      `SELECT COUNT(*)::int AS c, COALESCE(SUM(file_size), 0)::bigint AS b
       FROM file_storage
       WHERE bucket = 'student-media'`
    )

    console.log(JSON.stringify({
      mode: 'execute',
      deletedTrashRows: deletedCount,
      deletedStorageFiles: deletedFiles,
      deletedStorageChunks: deletedChunks,
      deletedStorageBytes: candidateBytes.toString(),
      afterTrashRows: toInt(afterTrash.rows[0]?.c),
      afterStorageRows: toInt(afterStorage.rows[0]?.c),
      afterStorageBytes: String(afterStorage.rows[0]?.b || '0')
    }, null, 2))
  } catch (error) {
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
