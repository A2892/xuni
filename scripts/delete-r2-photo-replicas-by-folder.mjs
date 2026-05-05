#!/usr/bin/env node

import dotenv from 'dotenv'
import pg from 'pg'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

dotenv.config()

const connectionString =
  process.env.COCKROACHDB_URL ||
  process.env.VITE_COCKROACHDB_URL ||
  process.env.COCKROACHDB_TARGET_URL ||
  process.env.DATABASE_URL ||
  ''

if (!connectionString) {
  console.error('Missing DB connection string (COCKROACHDB_URL / DATABASE_URL).')
  process.exit(1)
}

const args = process.argv.slice(2)
const execute = args.includes('--execute')
const studentArg = args.find((a) => a.startsWith('--student='))
const folderArg = args.find((a) => a.startsWith('--folder-ids='))

const studentName = studentArg ? studentArg.split('=')[1] : ''
const folderIds = (folderArg ? folderArg.split('=')[1] : '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

if (!studentName) {
  console.error('Missing --student=<name>')
  process.exit(1)
}

if (folderIds.length === 0) {
  console.error('Missing --folder-ids=id1,id2,...')
  process.exit(1)
}

const R2_ACCESS_KEY_ID = String(process.env.R2_ACCESS_KEY_ID || '').trim()
const R2_SECRET_ACCESS_KEY = String(process.env.R2_SECRET_ACCESS_KEY || '').trim()
const R2_BUCKET = String(process.env.R2_BUCKET || '').trim()
const R2_ENDPOINT = String(process.env.R2_ENDPOINT || '').trim().replace(/\/+$/, '')
const CLOUDINARY_CLOUD_NAME = String(process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME || '').trim()

function parseMultiStoragePath(storagePath) {
  const raw = String(storagePath || '').trim()
  if (!raw.startsWith('multi|')) return null

  const refs = {}
  for (const part of raw.slice('multi|'.length).split('|')) {
    const idx = part.indexOf('=')
    if (idx <= 0) continue
    const key = part.slice(0, idx)
    const valRaw = part.slice(idx + 1)
    const value = decodeURIComponent(valRaw)
    if (!value) continue
    refs[key] = value
  }
  return refs
}

function buildStoragePathWithoutR2(refs) {
  const cloudinary = refs.cloudinary || ''
  const cockroach = refs.cockroach || ''

  if (cloudinary && cockroach) {
    return `multi|cloudinary=${encodeURIComponent(cloudinary)}|cockroach=${encodeURIComponent(cockroach)}`
  }
  if (cloudinary) {
    return `cloudinary:${cloudinary}`
  }
  if (cockroach) {
    return cockroach
  }
  return ''
}

function buildCloudinaryImageUrl(publicId) {
  if (!CLOUDINARY_CLOUD_NAME || !publicId) return ''
  return `https://res.cloudinary.com/${encodeURIComponent(CLOUDINARY_CLOUD_NAME)}/image/upload/${publicId}`
}

async function main() {
  const pool = new pg.Pool({ connectionString, max: 1 })
  const canDeleteR2 = Boolean(R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET && R2_ENDPOINT)

  const r2Client = canDeleteR2
    ? new S3Client({
        region: 'auto',
        endpoint: R2_ENDPOINT,
        forcePathStyle: true,
        credentials: {
          accessKeyId: R2_ACCESS_KEY_ID,
          secretAccessKey: R2_SECRET_ACCESS_KEY
        }
      })
    : null

  const summary = {
    mode: execute ? 'execute' : 'dry-run',
    studentName,
    folderIds,
    scanned: 0,
    withR2Replica: 0,
    eligible: 0,
    skippedNoAlternative: 0,
    deletedR2Objects: 0,
    failedR2Deletes: 0,
    updatedRows: 0,
    failures: []
  }

  try {
    const q = await pool.query(
      `SELECT id, file_name, folder_id, storage_path, url, thumbnail_url
       FROM student_media
       WHERE deleted_at IS NULL
         AND student_name = $1
         AND type = 'photo'
         AND folder_id = ANY($2::text[])`,
      [studentName, folderIds]
    )

    for (const row of q.rows || []) {
      summary.scanned += 1
      const storagePath = String(row.storage_path || '')
      const refs = parseMultiStoragePath(storagePath)
      if (!refs || !refs.r2) continue

      summary.withR2Replica += 1
      const hasAlternative = Boolean(refs.cloudinary || refs.cockroach)
      if (!hasAlternative) {
        summary.skippedNoAlternative += 1
        continue
      }

      summary.eligible += 1
      if (!execute) continue

      try {
        if (!r2Client) {
          throw new Error('R2 configuration missing for execute mode')
        }

        await r2Client.send(
          new DeleteObjectCommand({
            Bucket: R2_BUCKET,
            Key: refs.r2
          })
        )
        summary.deletedR2Objects += 1

        const nextStoragePath = buildStoragePathWithoutR2(refs)
        if (!nextStoragePath) {
          summary.failures.push({ id: row.id, reason: 'nextStoragePath empty after removing r2' })
          continue
        }

        const cloudinaryUrl = refs.cloudinary ? buildCloudinaryImageUrl(refs.cloudinary) : ''
        const nextUrl = cloudinaryUrl || String(row.url || '')
        const nextThumb = cloudinaryUrl || String(row.thumbnail_url || row.url || '')

        const updateRes = await pool.query(
          `UPDATE student_media
           SET storage_path = $1,
               url = $2,
               thumbnail_url = $3,
               updated_at = NOW()
           WHERE id = $4`,
          [nextStoragePath, nextUrl, nextThumb, row.id]
        )

        summary.updatedRows += Number(updateRes.rowCount || 0)
      } catch (error) {
        const msg = String(error?.message || error)
        if (msg.toLowerCase().includes('no such object')) {
          // Object already gone: still update metadata to remove stale r2 pointer.
          const nextStoragePath = buildStoragePathWithoutR2(refs)
          if (nextStoragePath) {
            const cloudinaryUrl = refs.cloudinary ? buildCloudinaryImageUrl(refs.cloudinary) : ''
            const nextUrl = cloudinaryUrl || String(row.url || '')
            const nextThumb = cloudinaryUrl || String(row.thumbnail_url || row.url || '')
            const updateRes = await pool.query(
              `UPDATE student_media
               SET storage_path = $1,
                   url = $2,
                   thumbnail_url = $3,
                   updated_at = NOW()
               WHERE id = $4`,
              [nextStoragePath, nextUrl, nextThumb, row.id]
            )
            summary.updatedRows += Number(updateRes.rowCount || 0)
          }
        } else {
          summary.failedR2Deletes += 1
          summary.failures.push({ id: row.id, file: row.file_name, reason: msg })
        }
      }
    }

    const verify = await pool.query(
      `SELECT COUNT(*)::int AS c
       FROM student_media
       WHERE deleted_at IS NULL
         AND student_name = $1
         AND type = 'photo'
         AND folder_id = ANY($2::text[])
         AND storage_path LIKE 'multi|%'
         AND strpos(storage_path, 'r2=') > 0`,
      [studentName, folderIds]
    )

    summary.remainingR2ReplicaRows = Number(verify.rows?.[0]?.c || 0)
    console.log(JSON.stringify(summary, null, 2))
  } finally {
    await pool.end()
  }
}

main().catch((error) => {
  console.error(error?.message || error)
  process.exit(1)
})
