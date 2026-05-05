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

const CLOUDINARY_CLOUD_NAME = String(process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME || '').trim()
const CLOUDINARY_UPLOAD_PRESET = String(process.env.CLOUDINARY_UPLOAD_PRESET || process.env.VITE_CLOUDINARY_UPLOAD_PRESET || '').trim()
const CLOUDINARY_FOLDER = String(process.env.CLOUDINARY_FOLDER || process.env.VITE_CLOUDINARY_FOLDER || 'student-media').trim()

const CLOUDINARY_REQUEST_TIMEOUT_MS = Math.max(5000, Number.parseInt(process.env.CLOUDINARY_REQUEST_TIMEOUT_MS || '45000', 10) || 45000)
const CLOUDINARY_RETRIES = Math.max(1, Number.parseInt(process.env.CLOUDINARY_RETRIES || '4', 10) || 4)

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
  console.error('Error: missing Cloudinary config (CLOUDINARY_CLOUD_NAME / CLOUDINARY_UPLOAD_PRESET).')
  process.exit(1)
}

const PHOTO_MULTI_STORAGE_PREFIX = 'multi|'

function buildMultiPhotoStoragePath(refs) {
  const segments = []
  if (refs.cloudinaryPublicId) segments.push(`cloudinary=${encodeURIComponent(refs.cloudinaryPublicId)}`)
  if (refs.r2ObjectKey) segments.push(`r2=${encodeURIComponent(refs.r2ObjectKey)}`)
  if (refs.cockroachPath) segments.push(`cockroach=${encodeURIComponent(refs.cockroachPath)}`)
  if (segments.length === 0) return ''
  return `${PHOTO_MULTI_STORAGE_PREFIX}${segments.join('|')}`
}

function parseMultiPhotoStoragePath(storagePath) {
  const raw = String(storagePath || '').trim()
  if (!raw.startsWith(PHOTO_MULTI_STORAGE_PREFIX)) return null

  const refs = {}
  raw
    .slice(PHOTO_MULTI_STORAGE_PREFIX.length)
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const idx = part.indexOf('=')
      if (idx <= 0) return
      const key = part.slice(0, idx)
      const value = decodeURIComponent(part.slice(idx + 1))
      if (!value) return
      if (key === 'cloudinary') refs.cloudinaryPublicId = value
      if (key === 'r2') refs.r2ObjectKey = value
      if (key === 'cockroach') refs.cockroachPath = value
    })

  return refs
}

function sanitizeFileName(name) {
  const raw = String(name || '').trim()
  const fallback = `photo_${Date.now()}.jpg`
  if (!raw) return fallback
  return raw.replace(/[^a-zA-Z0-9._\-()]/g, '_').slice(-160) || fallback
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isTransientError(error) {
  const msg = String(error?.message || error || '').toLowerCase()
  return (
    msg.includes('timeout') ||
    msg.includes('timed out') ||
    msg.includes('network') ||
    msg.includes('socket') ||
    msg.includes('econnreset') ||
    msg.includes('etimedout') ||
    msg.includes('503') ||
    msg.includes('504') ||
    msg.includes('429')
  )
}

async function withRetry(label, fn, maxRetries) {
  let lastError = null
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (!isTransientError(error) || attempt >= maxRetries) {
        throw error
      }
      const waitMs = Math.min(15000, attempt * 1500)
      console.warn(`[retry] ${label} attempt ${attempt}/${maxRetries} failed: ${error.message || error}`)
      await sleep(waitMs)
    }
  }
  throw lastError || new Error(`${label} failed`)
}

async function uploadToCloudinary(buffer, contentType, fileName) {
  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(CLOUDINARY_CLOUD_NAME)}/image/upload`
  const form = new FormData()
  form.append('file', new Blob([buffer], { type: contentType || 'application/octet-stream' }), sanitizeFileName(fileName))
  form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  if (CLOUDINARY_FOLDER) {
    form.append('folder', CLOUDINARY_FOLDER)
  }

  const controller = new AbortController()
  const timeoutHandle = setTimeout(() => controller.abort(), CLOUDINARY_REQUEST_TIMEOUT_MS)
  const response = await fetch(endpoint, {
    method: 'POST',
    body: form,
    signal: controller.signal
  }).catch((error) => {
    if (error?.name === 'AbortError') {
      throw new Error(`Cloudinary upload timeout after ${CLOUDINARY_REQUEST_TIMEOUT_MS}ms`)
    }
    throw error
  }).finally(() => {
    clearTimeout(timeoutHandle)
  })

  const json = await response.json().catch(() => ({}))
  if (!response.ok || !json?.public_id || !json?.secure_url) {
    throw new Error(json?.error?.message || `Cloudinary upload failed (${response.status})`)
  }

  return {
    publicId: String(json.public_id),
    secureUrl: String(json.secure_url)
  }
}

async function main() {
  const execute = process.argv.includes('--execute')
  const limitArg = process.argv.find((arg) => arg.startsWith('--limit='))
  const limit = Math.max(1, Math.min(Number.parseInt(limitArg ? limitArg.split('=')[1] : '20000', 10) || 20000, 200000))

  const pool = new Pool({ connectionString, max: 1 })

  const summary = {
    mode: execute ? 'execute' : 'dry-run',
    scanned: 0,
    alreadyReplicated: 0,
    sourceMissing: 0,
    planned: 0,
    migrated: 0,
    failed: 0,
    failures: []
  }

  try {
    const mediaRes = await pool.query(
      `SELECT id, file_name, storage_path, url
       FROM student_media
       WHERE type = 'photo' AND deleted_at IS NULL
       ORDER BY created_at ASC
       LIMIT $1`,
      [limit]
    )

    for (const row of mediaRes.rows) {
      summary.scanned += 1
      const id = String(row.id)
      const fileName = sanitizeFileName(row.file_name || `photo_${id}.jpg`)
      const rawStoragePath = String(row.storage_path || '').trim()
      const parsed = parseMultiPhotoStoragePath(rawStoragePath)

      if (parsed?.cloudinaryPublicId && parsed?.cockroachPath) {
        summary.alreadyReplicated += 1
        continue
      }

      let cockroachPath = parsed?.cockroachPath || ''
      if (!cockroachPath) {
        if (rawStoragePath && !rawStoragePath.startsWith('cloudinary:') && !rawStoragePath.startsWith('r2:')) {
          cockroachPath = rawStoragePath
        }
      }

      if (!cockroachPath) {
        summary.sourceMissing += 1
        summary.failures.push({ id, reason: 'missing cockroach source path' })
        continue
      }

      const fileRes = await pool.query(
        `SELECT file_data, content_type
         FROM file_storage
         WHERE bucket = 'student-media' AND path = $1
         LIMIT 1`,
        [cockroachPath]
      )

      if (!fileRes.rows.length || !fileRes.rows[0].file_data) {
        summary.sourceMissing += 1
        summary.failures.push({ id, reason: `source file not found in file_storage: ${cockroachPath}` })
        continue
      }

      summary.planned += 1
      if (!execute) continue

      try {
        const fileBuffer = fileRes.rows[0].file_data
        const contentType = String(fileRes.rows[0].content_type || 'application/octet-stream')

        const cloudinary = await withRetry(
          `cloudinary:${id}`,
          () => uploadToCloudinary(fileBuffer, contentType, fileName),
          CLOUDINARY_RETRIES
        )

        const nextStoragePath = buildMultiPhotoStoragePath({
          cloudinaryPublicId: cloudinary.publicId,
          cockroachPath
        })

        const preferredUrl = cloudinary.secureUrl || String(row.url || '')

        await pool.query(
          `UPDATE student_media
           SET storage_path = $1,
               url = $2,
               thumbnail_url = $2,
               updated_at = NOW()
           WHERE id = $3`,
          [nextStoragePath, preferredUrl, id]
        )

        summary.migrated += 1
        if (summary.migrated % 20 === 0) {
          console.log(JSON.stringify({
            progress: {
              scanned: summary.scanned,
              planned: summary.planned,
              migrated: summary.migrated,
              failed: summary.failed
            }
          }))
        }
      } catch (error) {
        summary.failed += 1
        summary.failures.push({ id, reason: String(error?.message || error) })
      }
    }

    console.log(JSON.stringify(summary, null, 2))
  } finally {
    await pool.end()
  }
}

main().catch((error) => {
  console.error(error?.message || error)
  process.exit(1)
})
