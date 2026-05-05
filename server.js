/**
 * PostgreSQL backend API service
 * Defaults to CockroachDB PostgreSQL-compatible endpoint.
 */

import express from 'express'
import cors from 'cors'
import pg from 'pg'
import dotenv from 'dotenv'
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { mkdirSync, existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { randomUUID, createHash } from 'crypto'
import { Readable } from 'stream'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const { Pool } = pg

// 中间件
app.disable('x-powered-by')
app.use(cors())
app.use(express.json({ limit: process.env.API_JSON_LIMIT || '20mb' }))

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  next()
})

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }
  return req.socket?.remoteAddress || req.ip || 'unknown'
}

function createRateLimiter({ windowMs, max }) {
  const hits = new Map()

  return (req, res, next) => {
    const now = Date.now()
    const key = getClientIp(req)
    const current = hits.get(key)

    if (!current || now > current.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }

    if (current.count >= max) {
      const retryAfter = Math.ceil((current.resetAt - now) / 1000)
      res.setHeader('Retry-After', String(Math.max(1, retryAfter)))
      return res.status(429).json({ success: false, data: null, error: '请求过于频繁，请稍后再试' })
    }

    current.count += 1
    return next()
  }
}

const apiLimiter = createRateLimiter({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
  max: Number(process.env.RATE_LIMIT_PER_WINDOW || 600)
})

const writeLimiter = createRateLimiter({
  windowMs: Number(process.env.WRITE_RATE_LIMIT_WINDOW_MS || 60_000),
  max: Number(process.env.WRITE_RATE_LIMIT_PER_WINDOW || 240)
})

const mediaWriteLimiter = createRateLimiter({
  windowMs: Number(process.env.MEDIA_WRITE_RATE_LIMIT_WINDOW_MS || 60_000),
  max: Number(process.env.MEDIA_WRITE_RATE_LIMIT_PER_WINDOW || 1200)
})

const uploadLimiter = createRateLimiter({
  windowMs: Number(process.env.UPLOAD_RATE_LIMIT_WINDOW_MS || 60_000),
  max: Number(process.env.UPLOAD_RATE_LIMIT_PER_WINDOW || 120)
})

const uploadChunkLimiter = createRateLimiter({
  windowMs: Number(process.env.UPLOAD_CHUNK_RATE_LIMIT_WINDOW_MS || 60_000),
  max: Number(process.env.UPLOAD_CHUNK_RATE_LIMIT_PER_WINDOW || 2400)
})

function applyApiRateLimit(req, res, next) {
  // 分片上传请求量很高，避免被通用 API 限流误伤。
  const chunkUploadPath = /^\/storage\/[^/]+\/upload-chunk$/
  if (req.method === 'POST' && chunkUploadPath.test(req.path || '')) {
    return next()
  }
  return apiLimiter(req, res, next)
}

app.use('/api', applyApiRateLimit)

function applyWriteRateLimit(req, res, next) {
  const operation = req.body?.operation
  const table = req.body?.table
  if (operation === 'insert' || operation === 'update' || operation === 'delete') {
    if (table === 'student_media' && operation === 'insert') {
      return mediaWriteLimiter(req, res, next)
    }
    return writeLimiter(req, res, next)
  }
  return next()
}

// 静态文件服务 - 用于存储上传的文件
const UPLOADS_DIR = join(__dirname, 'uploads')
if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true })
app.use('/uploads', express.static(UPLOADS_DIR))

// Create DB connection pool (Cockroach first)
const connectionString =
  process.env.COCKROACHDB_URL ||
  process.env.VITE_COCKROACHDB_URL ||
  process.env.COCKROACHDB_TARGET_URL ||
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.VITE_SUPABASE_DB_URL

const sslRootCertPathRaw =
  process.env.COCKROACHDB_SSL_ROOT_CERT ||
  process.env.DB_SSL_ROOT_CERT ||
  process.env.SUPABASE_DB_SSL_ROOT_CERT ||
  ''
const sslRootCertPath = sslRootCertPathRaw
  ? (sslRootCertPathRaw.startsWith('/') ? sslRootCertPathRaw : join(__dirname, sslRootCertPathRaw))
  : ''

let sslConfig = undefined
let normalizedConnectionString = connectionString
if (sslRootCertPath) {
  try {
    normalizedConnectionString = connectionString
      .replace(/([?&])sslmode=[^&]*&?/gi, '$1')
      .replace(/[?&]$/, '')
      .replace('?&', '?')

    sslConfig = {
      rejectUnauthorized: true,
      ca: readFileSync(sslRootCertPath, 'utf8')
    }
  } catch (error) {
    console.error(`❌ 错误：无法读取 SSL 根证书文件: ${sslRootCertPath}`)
    process.exit(1)
  }
}

if (!connectionString) {
  console.error('❌ 错误：未找到数据库连接串（COCKROACHDB_URL / DATABASE_URL）')
  process.exit(1)
}

const pool = new Pool({
  connectionString: normalizedConnectionString,
  ...(sslConfig ? { ssl: sslConfig } : {}),
  max: Number(process.env.DB_POOL_MAX || (normalizedConnectionString.includes('pooler.supabase.com') ? 2 : 10)),
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 30000,
  // Cloud DB connections benefit from longer timeouts and keepalive.
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
})

async function executeQuery(sql, params = []) {
  // 最多重试一次（处理连接超时/断开的情况）
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await pool.query(sql, params)
      return {
        success: true,
        data: result.rows,
        count: result.rowCount || 0,
        error: null
      }
    } catch (error) {
      const isConnectionError = error.message?.includes('Connection terminated') ||
        error.message?.includes('timeout') ||
        error.message?.includes('ECONNRESET') ||
        error.code === 'ECONNREFUSED'
      
      if (isConnectionError && attempt === 0) {
        console.warn('数据库连接异常，正在重试...', error.message)
        continue // 重试一次
      }
      
      console.error('数据库查询错误:', error.message)
      console.error('SQL:', sql)
      console.error('Params:', params)
      return {
        success: false,
        data: null,
        count: 0,
        error: error.message,
        code: error.code || undefined
      }
    }
  }
}

function parseSafeInteger(value, fallbackValue) {
  const n = Number.parseInt(String(value), 10)
  if (!Number.isFinite(n) || n <= 0) return fallbackValue
  return n
}

function jsonError(res, status, message) {
  return res.status(status).json({ success: false, data: null, error: message })
}

// ==================== 安全：白名单表 ====================
const ALLOWED_TABLES = [
  'student_profiles', 'student_media', 'student_documents',
  'saved_documents', 'admin_users', 'user_roles', 'templates'
]

// 验证列名（防止 SQL 注入）
function sanitizeColumn(col) {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(col) ? col : null
}

const MAX_QUERY_FILTERS = Number(process.env.MAX_QUERY_FILTERS || 30)
const MAX_QUERY_OR_LENGTH = Number(process.env.MAX_QUERY_OR_LENGTH || 2000)
const DEFAULT_QUERY_LIMIT = Number(process.env.DEFAULT_QUERY_LIMIT || 500)
const MAX_QUERY_LIMIT = Number(process.env.MAX_QUERY_LIMIT || 2000)
const ALLOW_FULL_TABLE_WRITE = process.env.ALLOW_FULL_TABLE_WRITE === 'true'

const SAFE_BUCKET_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9-_]{1,63}$/
const SAFE_STORAGE_PATH_PATTERN = /^[a-zA-Z0-9/_\-.()]+$/
const STORAGE_ADMIN_TOKEN = process.env.STORAGE_ADMIN_TOKEN || ''
const MAX_UPLOAD_BYTES = Number(process.env.MAX_UPLOAD_BYTES || 5 * 1024 * 1024 * 1024)
const MAX_UPLOAD_CHUNK_BYTES = Number(process.env.MAX_UPLOAD_CHUNK_BYTES || 64 * 1024 * 1024)
const MAX_TOTAL_UPLOAD_BYTES = Number(process.env.MAX_TOTAL_UPLOAD_BYTES || 5 * 1024 * 1024 * 1024)
const DEFAULT_UPLOAD_CHUNK_SIZE = Number(process.env.STORAGE_UPLOAD_CHUNK_SIZE || 8 * 1024 * 1024)
const STORAGE_DISABLE_CHUNK_UPLOAD = String(process.env.STORAGE_DISABLE_CHUNK_UPLOAD || 'true').toLowerCase() !== 'false'
const CLOUDINARY_CLOUD_NAME =
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.VITE_CLOUDINARY_CLOUD_NAME ||
  ''
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || ''
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || ''
const R2_ACCOUNT_ID = String(process.env.R2_ACCOUNT_ID || '').trim()
const R2_ACCESS_KEY_ID = String(process.env.R2_ACCESS_KEY_ID || '').trim()
const R2_SECRET_ACCESS_KEY = String(process.env.R2_SECRET_ACCESS_KEY || '').trim()
const R2_BUCKET = String(process.env.R2_BUCKET || '').trim()
const R2_ENDPOINT = String(process.env.R2_ENDPOINT || '').trim().replace(/\/+$/, '')
const R2_PUBLIC_BASE_URL = String(process.env.R2_PUBLIC_BASE_URL || '').trim().replace(/\/+$/, '')
const R2_SIGNED_URL_EXPIRES_SECONDS = parseSafeInteger(process.env.R2_SIGNED_URL_EXPIRES_SECONDS, 900)

let r2Client = null

function isR2Configured() {
  return Boolean(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET && R2_ENDPOINT)
}

function getR2Client() {
  if (!isR2Configured()) return null
  if (!r2Client) {
    r2Client = new S3Client({
      region: 'auto',
      endpoint: R2_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY
      }
    })
  }
  return r2Client
}

function normalizeUploadFilename(input) {
  const name = String(input || '').trim()
  if (!name) return ''
  return name.replace(/[^a-zA-Z0-9._\-()]/g, '_').slice(-160)
}

function normalizeR2ObjectKey(input) {
  const key = String(input || '').trim().replace(/\\/g, '/')
  if (!key || key.length > 512) return ''
  if (key.startsWith('/') || key.includes('..') || key.includes('//')) return ''
  if (!SAFE_STORAGE_PATH_PATTERN.test(key)) return ''
  return key
}

function buildR2PublicUrl(objectKey) {
  const normalizedKey = normalizeR2ObjectKey(objectKey)
  if (!normalizedKey) return ''
  if (R2_PUBLIC_BASE_URL) return `${R2_PUBLIC_BASE_URL}/${normalizedKey}`
  return `${R2_ENDPOINT}/${R2_BUCKET}/${normalizedKey}`
}

function normalizeStoragePath(input) {
  if (typeof input !== 'string') return null
  const path = input.trim().replace(/\\/g, '/')
  if (!path || path.length > 512) return null
  if (path.startsWith('/') || path.includes('..') || path.includes('//')) return null
  if (!SAFE_STORAGE_PATH_PATTERN.test(path)) return null
  return path
}

function parseSafeNonNegativeInt(value, fallbackValue) {
  const n = Number.parseInt(String(value), 10)
  if (!Number.isFinite(n) || n < 0) return fallbackValue
  return n
}

function ensureValidBucket(res, bucket) {
  if (!SAFE_BUCKET_PATTERN.test(bucket)) {
    jsonError(res, 400, '无效的存储桶名称')
    return false
  }
  return true
}

function ensureAllowedUploadContentType(contentType) {
  const prefixes = (process.env.ALLOWED_UPLOAD_CONTENT_TYPES || 'image/,video/,application/pdf')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
  return prefixes.some((prefix) => contentType.startsWith(prefix))
}

function requireStorageAdminToken(req, res, next) {
  if (!STORAGE_ADMIN_TOKEN) {
    return jsonError(res, 503, '未配置 STORAGE_ADMIN_TOKEN，无法执行管理操作')
  }

  const headerToken = String(req.headers['x-storage-admin-token'] || '')
  const bearer = String(req.headers.authorization || '')
  const bearerToken = bearer.toLowerCase().startsWith('bearer ') ? bearer.slice(7).trim() : ''

  if (headerToken !== STORAGE_ADMIN_TOKEN && bearerToken !== STORAGE_ADMIN_TOKEN) {
    return jsonError(res, 401, '管理令牌无效')
  }

  return next()
}

function buildCloudinarySignature(params, apiSecret) {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')
  return createHash('sha1').update(`${toSign}${apiSecret}`).digest('hex')
}

// ==================== 通用查询 API（Supabase 兼容）====================

/**
 * 通用查询端点 - 处理所有 Supabase 风格的 CRUD 操作
 * POST /api/query
 * Body: { table, operation, select, data, filters, options, returnData }
 */
app.post('/api/query', applyWriteRateLimit, async (req, res) => {
  const { table, operation, select, data, filters, options, returnData } = req.body

  if (!ALLOWED_TABLES.includes(table)) {
    return jsonError(res, 400, `不支持的表: ${table}`)
  }

  if (!['select', 'insert', 'update', 'delete'].includes(operation)) {
    return jsonError(res, 400, `未知操作: ${operation}`)
  }

  if (filters !== undefined && !Array.isArray(filters)) {
    return jsonError(res, 400, 'filters 必须是数组')
  }

  if (Array.isArray(filters) && filters.length > MAX_QUERY_FILTERS) {
    return jsonError(res, 400, `过滤条件过多，最多允许 ${MAX_QUERY_FILTERS} 个`)
  }

  let sql = ''
  let params = []
  let paramIndex = 1
  const whereClauses = []

  try {
    switch (operation) {
      case 'select': {
        // 处理 select 列
        let selectCols = '*'
        if (select && select !== '*') {
          // 验证每个列名
          const cols = select.split(',').map(c => c.trim())
          const safeCols = cols.filter(c => sanitizeColumn(c) || c === '*')
          selectCols = safeCols.length > 0 ? safeCols.join(', ') : '*'
        }
        sql = `SELECT ${selectCols} FROM ${table}`
        break
      }

      case 'insert': {
        if (!data || (typeof data !== 'object' && !Array.isArray(data))) {
          return jsonError(res, 400, 'insert 操作需要 data 对象')
        }
        if (Array.isArray(data)) {
          // 批量插入
          if (data.length === 0) {
            return res.json({ success: true, data: [], error: null })
          }
          const cols = Object.keys(data[0]).filter(sanitizeColumn)
          const allValues = []
          const valueSets = data.map(row => {
            const vals = cols.map(c => {
              allValues.push(row[c] !== undefined ? row[c] : null)
              return `$${paramIndex++}`
            })
            return `(${vals.join(', ')})`
          })
          sql = `INSERT INTO ${table} (${cols.join(', ')}) VALUES ${valueSets.join(', ')}`
          params = allValues
        } else {
          const cols = Object.keys(data).filter(sanitizeColumn)
          const vals = cols.map(c => {
            params.push(data[c] !== undefined ? data[c] : null)
            return `$${paramIndex++}`
          })
          sql = `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${vals.join(', ')})`
        }
        if (returnData) sql += ' RETURNING *'
        break
      }

      case 'update': {
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
          return jsonError(res, 400, 'update 操作需要 data 对象')
        }
        const cols = Object.keys(data).filter(sanitizeColumn)
        if (cols.length === 0) {
          return jsonError(res, 400, '没有有效的更新字段')
        }
        const setClauses = cols.map(c => {
          params.push(data[c] !== undefined ? data[c] : null)
          return `${c} = $${paramIndex++}`
        })
        sql = `UPDATE ${table} SET ${setClauses.join(', ')}`
        break
      }

      case 'delete': {
        sql = `DELETE FROM ${table}`
        break
      }
    }

    // 构建 WHERE 子句
    if (filters && filters.length > 0) {
      for (const filter of filters) {
        if (!filter || typeof filter !== 'object') continue
        const col = sanitizeColumn(filter.column)

        switch (filter.type) {
          case 'eq':
            if (!col) break
            whereClauses.push(`${col} = $${paramIndex++}`)
            params.push(filter.value)
            break

          case 'neq':
            if (!col) break
            whereClauses.push(`${col} != $${paramIndex++}`)
            params.push(filter.value)
            break

          case 'is':
            if (!col) break
            if (filter.value === null) {
              whereClauses.push(`${col} IS NULL`)
            } else {
              whereClauses.push(`${col} = $${paramIndex++}`)
              params.push(filter.value)
            }
            break

          case 'not':
            if (!col) break
            if (filter.operator === 'is' && filter.value === null) {
              whereClauses.push(`${col} IS NOT NULL`)
            } else {
              whereClauses.push(`NOT (${col} = $${paramIndex++})`)
              params.push(filter.value)
            }
            break

          case 'in':
            if (!col) break
            if (Array.isArray(filter.value) && filter.value.length > 0) {
              const placeholders = filter.value.map(() => `$${paramIndex++}`)
              whereClauses.push(`${col} IN (${placeholders.join(', ')})`)
              params.push(...filter.value)
            }
            break

          case 'lt':
            if (!col) break
            whereClauses.push(`${col} < $${paramIndex++}`)
            params.push(filter.value)
            break

          case 'lte':
            if (!col) break
            whereClauses.push(`${col} <= $${paramIndex++}`)
            params.push(filter.value)
            break

          case 'gt':
            if (!col) break
            whereClauses.push(`${col} > $${paramIndex++}`)
            params.push(filter.value)
            break

          case 'gte':
            if (!col) break
            whereClauses.push(`${col} >= $${paramIndex++}`)
            params.push(filter.value)
            break

          case 'like':
            if (!col) break
            whereClauses.push(`${col} LIKE $${paramIndex++}`)
            params.push(filter.value)
            break

          case 'ilike':
            if (!col) break
            whereClauses.push(`${col} ILIKE $${paramIndex++}`)
            params.push(filter.value)
            break

          case 'or': {
            // 解析 Supabase PostgREST 风格的 OR 表达式
            // 格式: "col.op.val,col.op.val"
            const orExpr = filter.value
            if (typeof orExpr === 'string') {
              if (orExpr.length > MAX_QUERY_OR_LENGTH) {
                return jsonError(res, 400, `OR 条件过长，最多 ${MAX_QUERY_OR_LENGTH} 个字符`)
              }
              const orParts = parseOrExpression(orExpr, params, paramIndex)
              if (orParts.clause) {
                whereClauses.push(`(${orParts.clause})`)
                paramIndex = orParts.paramIndex
              }
            }
            break
          }
        }
      }

      if (whereClauses.length > 0) {
        sql += ` WHERE ${whereClauses.join(' AND ')}`
      }
    }

    // 对 update/delete 加 RETURNING *
    if ((operation === 'update' || operation === 'delete') && returnData) {
      sql += ' RETURNING *'
    }

    if ((operation === 'update' || operation === 'delete') && whereClauses.length === 0 && !ALLOW_FULL_TABLE_WRITE) {
      return jsonError(res, 400, `${operation} 操作必须至少包含一个过滤条件`) 
    }

    // ORDER BY
    if (options?.order && options.order.length > 0) {
      const orderClauses = options.order
        .filter(o => sanitizeColumn(o.column))
        .map(o => `${o.column} ${o.ascending ? 'ASC' : 'DESC'}`)
      if (orderClauses.length > 0) {
        sql += ` ORDER BY ${orderClauses.join(', ')}`
      }
    }

    // LIMIT（仅在前端显式传入时生效，避免无意截断媒体列表）
    if (operation === 'select' && options?.limit !== undefined && options?.limit !== null) {
      const safeLimit = Math.min(
        parseSafeInteger(options.limit, DEFAULT_QUERY_LIMIT),
        MAX_QUERY_LIMIT
      )
      sql += ` LIMIT ${safeLimit}`
    }

    const result = await executeQuery(sql, params)
    res.setHeader('X-Request-Id', randomUUID())
    res.json(result)

  } catch (error) {
    console.error('查询构建错误:', error)
    res.status(500).json({ success: false, data: null, error: error.message })
  }
})

/**
 * 解析 Supabase PostgREST 风格的 OR 表达式
 * 例如：name.ilike.%test%,description.ilike.%test%
 */
function parseOrExpression(expression, params, paramIndex) {
  const parts = expression.split(',')
  const clauses = []

  for (const part of parts) {
    const match = part.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\.([a-z]+)\.(.+)$/)
    if (match) {
      const [, col, op, val] = match
      if (!sanitizeColumn(col)) continue

      switch (op) {
        case 'eq':
          clauses.push(`${col} = $${paramIndex}`)
          params.push(val === 'true' ? true : val === 'false' ? false : val)
          paramIndex++
          break
        case 'neq':
          clauses.push(`${col} != $${paramIndex}`)
          params.push(val)
          paramIndex++
          break
        case 'ilike':
          clauses.push(`${col} ILIKE $${paramIndex}`)
          params.push(val)
          paramIndex++
          break
        case 'like':
          clauses.push(`${col} LIKE $${paramIndex}`)
          params.push(val)
          paramIndex++
          break
        case 'is':
          if (val === 'null') {
            clauses.push(`${col} IS NULL`)
          } else {
            clauses.push(`${col} = $${paramIndex}`)
            params.push(val)
            paramIndex++
          }
          break
        default:
          // 不支持的操作符，跳过
          break
      }
    }
  }

  return {
    clause: clauses.length > 0 ? clauses.join(' OR ') : '',
    paramIndex
  }
}

// ==================== RPC 调用 ====================

/**
 * RPC 端点 - 模拟 Supabase RPC 调用
 * POST /api/rpc/:functionName
 */
app.post('/api/rpc/:functionName', async (req, res) => {
  const { functionName } = req.params
  const fnParams = req.body

  try {
    switch (functionName) {
      case 'increment_template_use': {
        const result = await executeQuery(
          'UPDATE templates SET use_count = COALESCE(use_count, 0) + 1 WHERE id = $1 RETURNING *',
          [fnParams.template_id]
        )
        res.json(result)
        break
      }

      case 'rate_template': {
        // 简单平均评分更新
        const result = await executeQuery(
          `UPDATE templates SET
            rating = (COALESCE(rating, 0) * COALESCE(rating_count, 0) + $2) / (COALESCE(rating_count, 0) + 1),
            rating_count = COALESCE(rating_count, 0) + 1
          WHERE id = $1 RETURNING *`,
          [fnParams.template_id, fnParams.new_rating]
        )
        res.json(result)
        break
      }

      default:
        res.status(400).json({ success: false, data: null, error: `未知的 RPC 函数: ${functionName}` })
    }
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: error.message })
  }
})

// ==================== 文件存储 API（替代 Supabase Storage）====================

async function saveFileToDb(bucket, filePath, contentType, buffer) {
  const isChunked = false
  const totalChunks = 1
  const inlineData = buffer

  const upsertResult = await executeQuery(
    `INSERT INTO file_storage (bucket, path, file_data, content_type, file_size, is_chunked, total_chunks, chunk_size, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
     ON CONFLICT (bucket, path)
     DO UPDATE SET
       file_data = EXCLUDED.file_data,
       content_type = EXCLUDED.content_type,
       file_size = EXCLUDED.file_size,
       is_chunked = EXCLUDED.is_chunked,
       total_chunks = EXCLUDED.total_chunks,
       chunk_size = EXCLUDED.chunk_size,
       created_at = NOW()
     RETURNING id, is_chunked, total_chunks`,
    [bucket, filePath, inlineData, contentType, buffer.length, isChunked, totalChunks, null]
  )

  if (!upsertResult.success || !upsertResult.data?.length) {
    throw new Error(upsertResult.error || '保存文件元数据失败')
  }

  const fileId = upsertResult.data[0].id

  // 清理旧分片，确保覆盖上传后分片一致
  const deleteChunksResult = await executeQuery('DELETE FROM file_chunks WHERE file_id = $1', [fileId])
  if (!deleteChunksResult.success) {
    throw new Error(deleteChunksResult.error || '清理旧文件分片失败')
  }

  return { fileId, isChunked, totalChunks }
}

async function upsertChunkedFileMetadata(bucket, filePath, contentType, fileSize, totalChunks, chunkSize, resetChunks = false) {
  const upsertResult = await executeQuery(
    `INSERT INTO file_storage (bucket, path, file_data, content_type, file_size, is_chunked, total_chunks, chunk_size, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
     ON CONFLICT (bucket, path)
     DO UPDATE SET
       file_data = EXCLUDED.file_data,
       content_type = EXCLUDED.content_type,
       file_size = EXCLUDED.file_size,
       is_chunked = EXCLUDED.is_chunked,
       total_chunks = EXCLUDED.total_chunks,
       chunk_size = EXCLUDED.chunk_size,
       created_at = NOW()
     RETURNING id`,
    [bucket, filePath, Buffer.alloc(0), contentType, fileSize, true, totalChunks, chunkSize]
  )

  if (!upsertResult.success || !upsertResult.data?.length) {
    throw new Error(upsertResult.error || '初始化分片文件失败')
  }

  const fileId = upsertResult.data[0].id
  if (resetChunks) {
    const resetResult = await executeQuery('DELETE FROM file_chunks WHERE file_id = $1', [fileId])
    if (!resetResult.success) {
      throw new Error(resetResult.error || '重置分片失败')
    }
  }

  return fileId
}

async function loadFileFromDb(bucket, filePath) {
  const fileResult = await executeQuery(
    `SELECT id, file_data, content_type, file_size, is_chunked, total_chunks
     FROM file_storage
     WHERE bucket = $1 AND path = $2
     LIMIT 1`,
    [bucket, filePath]
  )

  if (!fileResult.success) {
    throw new Error(fileResult.error || '查询文件失败')
  }

  const file = fileResult.data?.[0]
  if (!file) return null

  if (!file.is_chunked) {
    return {
      data: file.file_data || Buffer.alloc(0),
      contentType: file.content_type || 'application/octet-stream',
      fileSize: file.file_size || 0
    }
  }

  const chunksResult = await executeQuery(
    `SELECT chunk_data
     FROM file_chunks
     WHERE file_id = $1
     ORDER BY chunk_index ASC`,
    [file.id]
  )

  if (!chunksResult.success) {
    throw new Error(chunksResult.error || '查询文件分片失败')
  }

  const buffers = (chunksResult.data || []).map((row) => row.chunk_data || Buffer.alloc(0))
  const merged = Buffer.concat(buffers)
  return {
    data: merged,
    contentType: file.content_type || 'application/octet-stream',
    fileSize: file.file_size || merged.length
  }
}

/**
 * 文件上传
 * POST /api/storage/:bucket/upload
 */
app.post('/api/storage/:bucket/upload', uploadLimiter, express.raw({ type: '*/*', limit: process.env.API_UPLOAD_LIMIT || '5gb' }), async (req, res) => {
  const { bucket } = req.params
  if (!ensureValidBucket(res, bucket)) return

  const filePath = normalizeStoragePath(String(req.headers['x-file-path'] || `${Date.now()}`))
  const contentType = String(req.headers['content-type'] || 'application/octet-stream')

  if (!filePath) {
    return jsonError(res, 400, '无效的文件路径')
  }

  if (!ensureAllowedUploadContentType(contentType)) {
    return jsonError(res, 415, '不支持的文件类型')
  }

  const headerLength = parseSafeInteger(req.headers['content-length'], 0)
  if (headerLength > MAX_UPLOAD_BYTES) {
    return jsonError(res, 413, `文件过大，最大允许 ${MAX_UPLOAD_BYTES} 字节`)
  }

  try {
    const buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body)
    if (!buffer || buffer.length === 0) {
      return jsonError(res, 400, '上传内容不能为空')
    }
    if (buffer.length > MAX_UPLOAD_BYTES) {
      return jsonError(res, 413, `文件过大，最大允许 ${MAX_UPLOAD_BYTES} 字节`)
    }

    await saveFileToDb(bucket, filePath, contentType, buffer)

    res.json({
      success: true,
      data: { path: filePath },
      error: null
    })
  } catch (error) {
    console.error('上传失败:', error)
    res.status(500).json({ success: false, data: null, error: error.message })
  }
})

/**
 * 分片上传（默认禁用）
 * POST /api/storage/:bucket/upload-chunk
 */
app.post('/api/storage/:bucket/upload-chunk', uploadChunkLimiter, express.raw({ type: '*/*', limit: process.env.API_UPLOAD_CHUNK_LIMIT || '64mb' }), async (req, res) => {
  if (STORAGE_DISABLE_CHUNK_UPLOAD) {
    return jsonError(res, 400, '已禁用分片上传，请改用 /api/storage/:bucket/upload 单次上传')
  }

  const { bucket } = req.params
  if (!ensureValidBucket(res, bucket)) return

  const filePath = normalizeStoragePath(String(req.headers['x-file-path'] || ''))
  const contentType = String(req.headers['content-type'] || 'application/octet-stream')
  const chunkIndex = parseSafeNonNegativeInt(req.headers['x-chunk-index'], -1)
  const totalChunks = parseSafeInteger(req.headers['x-total-chunks'], 0)
  const fileSize = parseSafeInteger(req.headers['x-file-size'], 0)
  const chunkSize = parseSafeInteger(req.headers['x-chunk-size'], DEFAULT_UPLOAD_CHUNK_SIZE)

  if (!filePath) {
    return jsonError(res, 400, '无效的文件路径')
  }

  if (!ensureAllowedUploadContentType(contentType)) {
    return jsonError(res, 415, '不支持的文件类型')
  }

  if (chunkIndex < 0 || totalChunks <= 0 || chunkIndex >= totalChunks) {
    return jsonError(res, 400, '无效的分片参数')
  }

  if (fileSize <= 0 || fileSize > MAX_TOTAL_UPLOAD_BYTES) {
    return jsonError(res, 413, `文件总大小超限，最大允许 ${MAX_TOTAL_UPLOAD_BYTES} 字节`)
  }

  const buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body)
  if (!buffer || buffer.length === 0) {
    return jsonError(res, 400, '分片内容不能为空')
  }

  if (buffer.length > MAX_UPLOAD_CHUNK_BYTES) {
    return jsonError(res, 413, `分片过大，最大允许 ${MAX_UPLOAD_CHUNK_BYTES} 字节`)
  }

  try {
    const fileId = await upsertChunkedFileMetadata(
      bucket,
      filePath,
      contentType,
      fileSize,
      totalChunks,
      chunkSize,
      chunkIndex === 0
    )

    const saveChunkResult = await executeQuery(
      `INSERT INTO file_chunks (file_id, chunk_index, chunk_data, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (file_id, chunk_index)
       DO UPDATE SET chunk_data = EXCLUDED.chunk_data, created_at = NOW()`,
      [fileId, chunkIndex, buffer]
    )

    if (!saveChunkResult.success) {
      return jsonError(res, 500, saveChunkResult.error || '保存分片失败')
    }

    let isComplete = false
    if (chunkIndex === totalChunks - 1) {
      const countResult = await executeQuery(
        'SELECT COUNT(*) AS chunk_count FROM file_chunks WHERE file_id = $1',
        [fileId]
      )
      if (countResult.success) {
        const count = parseSafeInteger(countResult.data?.[0]?.chunk_count, 0)
        isComplete = count >= totalChunks
      }
    }

    return res.json({
      success: true,
      data: {
        path: filePath,
        chunkIndex,
        totalChunks,
        isComplete
      },
      error: null
    })
  } catch (error) {
    console.error('分片上传失败:', error)
    return jsonError(res, 500, error.message)
  }
})

/**
 * 获取文件二进制（数据库）
 * GET /api/storage/:bucket/file?path=...
 */
app.get('/api/storage/:bucket/file', async (req, res) => {
  const { bucket } = req.params
  if (!ensureValidBucket(res, bucket)) return
  const filePath = normalizeStoragePath(String(req.query.path || ''))

  if (!filePath) {
    return jsonError(res, 400, 'path 不能为空')
  }

  try {
    const file = await loadFileFromDb(bucket, filePath)
    if (!file) {
      return res.status(404).json({ success: false, data: null, error: '文件不存在' })
    }

    res.setHeader('Content-Type', file.contentType)
    res.setHeader('Content-Length', String(file.fileSize))
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.send(file.data)
  } catch (error) {
    console.error('文件读取失败:', error)
    res.status(500).json({ success: false, data: null, error: error.message })
  }
})

/**
 * 获取公共 URL
 * GET /api/storage/:bucket/public/:path(*)
 */
app.get('/api/storage/:bucket/public-url', (req, res) => {
  const { bucket } = req.params
  if (!ensureValidBucket(res, bucket)) return
  const filePath = normalizeStoragePath(String(req.query.path || ''))
  if (!filePath) {
    return jsonError(res, 400, '无效的文件路径')
  }
  const publicUrl = `${req.protocol}://${req.get('host')}/api/storage/${bucket}/file?path=${encodeURIComponent(filePath)}`
  res.json({
    success: true,
    data: { publicUrl },
    error: null
  })
})

/**
 * 删除文件
 * POST /api/storage/:bucket/remove
 */
app.post('/api/storage/:bucket/remove', async (req, res) => {
  const { bucket } = req.params
  if (!ensureValidBucket(res, bucket)) return
  const { paths } = req.body

  try {
    const pathList = Array.isArray(paths)
      ? paths.map((p) => normalizeStoragePath(String(p))).filter(Boolean)
      : []
    if (pathList.length === 0) {
      return res.json({ success: true, data: [], error: null })
    }

    const selectResult = await executeQuery(
      'SELECT id, path FROM file_storage WHERE bucket = $1 AND path = ANY($2::text[])',
      [bucket, pathList]
    )

    if (!selectResult.success) {
      return res.status(500).json({ success: false, data: null, error: selectResult.error })
    }

    const ids = (selectResult.data || []).map((r) => r.id)
    const idToPath = new Map((selectResult.data || []).map((r) => [r.id, r.path]))

    if (ids.length > 0) {
      const deleteChunksResult = await executeQuery('DELETE FROM file_chunks WHERE file_id = ANY($1::uuid[])', [ids])
      if (!deleteChunksResult.success) {
        return res.status(500).json({ success: false, data: null, error: deleteChunksResult.error })
      }
    }

    const deleteFilesResult = await executeQuery(
      'DELETE FROM file_storage WHERE bucket = $1 AND path = ANY($2::text[]) RETURNING id, path',
      [bucket, pathList]
    )

    if (!deleteFilesResult.success) {
      return res.status(500).json({ success: false, data: null, error: deleteFilesResult.error })
    }

    const results = []
    const removedPathSet = new Set((deleteFilesResult.data || []).map((row) => row.path))
    for (const p of pathList) {
      if (removedPathSet.has(p)) {
        results.push({ path: p, removed: true })
      } else if ([...idToPath.values()].includes(p)) {
        results.push({ path: p, removed: false, note: '删除失败' })
      } else {
        results.push({ path: p, removed: false, note: '文件不存在' })
      }
    }

    res.json({ success: true, data: results, error: null })
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: error.message })
  }
})

/**
 * 删除 Cloudinary 资源（用于回收站硬删除时同步删除云端资源）
 * POST /api/cloudinary/delete
 * Body: { publicId: string, resourceType?: 'image'|'video'|'raw' }
 */
app.post('/api/cloudinary/delete', async (req, res) => {
  const publicId = String(req.body?.publicId || '').trim()
  const resourceType = String(req.body?.resourceType || 'video').trim().toLowerCase()

  if (!publicId) {
    return jsonError(res, 400, 'publicId 不能为空')
  }

  if (!['image', 'video', 'raw'].includes(resourceType)) {
    return jsonError(res, 400, 'resourceType 必须是 image、video 或 raw')
  }

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return jsonError(res, 503, 'Cloudinary 删除未配置（缺少 CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET）')
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000)
    const signParams = {
      invalidate: 'true',
      public_id: publicId,
      timestamp: String(timestamp)
    }

    const signature = buildCloudinarySignature(signParams, CLOUDINARY_API_SECRET)

    const body = new URLSearchParams({
      public_id: publicId,
      invalidate: 'true',
      api_key: CLOUDINARY_API_KEY,
      timestamp: String(timestamp),
      signature
    })

    const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(CLOUDINARY_CLOUD_NAME)}/${resourceType}/destroy`
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    })

    const json = await response.json().catch(() => ({}))

    if (!response.ok || (json?.result !== 'ok' && json?.result !== 'not found')) {
      const msg = json?.error?.message || `Cloudinary 删除失败 (${response.status})`
      return jsonError(res, 502, msg)
    }

    return res.json({
      success: true,
      data: {
        publicId,
        resourceType,
        result: json?.result || 'ok'
      },
      error: null
    })
  } catch (error) {
    return jsonError(res, 500, error.message || 'Cloudinary 删除请求失败')
  }
})

/**
 * 生成 R2 预签名上传地址（用于前端直传）
 * POST /api/r2/presign-upload
 * Body: { fileName: string, contentType?: string, mediaType?: 'photo'|'video' }
 */
app.post('/api/r2/presign-upload', async (req, res) => {
  if (!isR2Configured()) {
    return jsonError(res, 503, 'R2 未配置（缺少 R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET / R2_ENDPOINT）')
  }

  const fileName = normalizeUploadFilename(req.body?.fileName)
  const contentType = String(req.body?.contentType || 'application/octet-stream').trim()
  const mediaType = String(req.body?.mediaType || 'video').trim().toLowerCase()
  const fileSize = parseSafeNonNegativeInt(req.body?.fileSize, -1)

  if (!fileName) {
    return jsonError(res, 400, 'fileName 不能为空')
  }

  if (!['photo', 'video'].includes(mediaType)) {
    return jsonError(res, 400, 'mediaType 必须是 photo 或 video')
  }

  if (fileSize > MAX_UPLOAD_BYTES) {
    return jsonError(res, 413, `文件过大，最大允许 ${MAX_UPLOAD_BYTES} 字节`)
  }

  try {
    const client = getR2Client()
    if (!client) {
      return jsonError(res, 503, 'R2 客户端初始化失败')
    }

    const prefix = mediaType === 'photo' ? 'photos' : 'videos'
    const objectKey = `${prefix}/${Date.now()}_${randomUUID().slice(0, 8)}_${fileName}`

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: objectKey,
      ContentType: contentType,
      ...(fileSize > 0 ? { ContentLength: fileSize } : {})
    })

    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: R2_SIGNED_URL_EXPIRES_SECONDS
    })

    return res.json({
      success: true,
      data: {
        uploadUrl,
        objectKey,
        publicUrl: buildR2PublicUrl(objectKey),
        expiresIn: R2_SIGNED_URL_EXPIRES_SECONDS
      },
      error: null
    })
  } catch (error) {
    return jsonError(res, 500, error.message || '生成 R2 预签名地址失败')
  }
})

/**
 * 生成 R2 预签名下载地址（用于私有桶播放）
 * POST /api/r2/presign-read
 * Body: { objectKey: string }
 */
app.post('/api/r2/presign-read', async (req, res) => {
  if (!isR2Configured()) {
    return jsonError(res, 503, 'R2 未配置（缺少 R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET / R2_ENDPOINT）')
  }

  const objectKey = normalizeR2ObjectKey(req.body?.objectKey)
  if (!objectKey) {
    return jsonError(res, 400, 'objectKey 无效')
  }

  try {
    const client = getR2Client()
    if (!client) {
      return jsonError(res, 503, 'R2 客户端初始化失败')
    }

    const command = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: objectKey
    })

    const signedUrl = await getSignedUrl(client, command, {
      expiresIn: R2_SIGNED_URL_EXPIRES_SECONDS
    })

    return res.json({
      success: true,
      data: {
        objectKey,
        signedUrl,
        expiresIn: R2_SIGNED_URL_EXPIRES_SECONDS
      },
      error: null
    })
  } catch (error) {
    return jsonError(res, 500, error.message || '生成 R2 预签名下载地址失败')
  }
})

/**
 * 通过后端代理流式读取 R2 对象（支持 Range，便于 video 播放）
 * GET /api/r2/stream?objectKey=...
 */
app.get('/api/r2/stream', async (req, res) => {
  if (!isR2Configured()) {
    return jsonError(res, 503, 'R2 未配置（缺少 R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET / R2_ENDPOINT）')
  }

  const objectKey = normalizeR2ObjectKey(req.query?.objectKey)
  if (!objectKey) {
    return jsonError(res, 400, 'objectKey 无效')
  }

  try {
    const client = getR2Client()
    if (!client) {
      return jsonError(res, 503, 'R2 客户端初始化失败')
    }

    const rangeHeader = typeof req.headers.range === 'string' ? req.headers.range.trim() : ''
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: objectKey,
      ...(rangeHeader ? { Range: rangeHeader } : {})
    })

    const output = await client.send(command)
    const body = output.Body
    if (!body) {
      return jsonError(res, 404, '对象不存在或内容为空')
    }

    const hasRange = Boolean(output.ContentRange)
    res.status(hasRange ? 206 : 200)
    res.setHeader('Accept-Ranges', 'bytes')
    res.setHeader('Cache-Control', 'private, max-age=60')

    if (output.ContentType) res.setHeader('Content-Type', output.ContentType)
    if (output.ContentLength != null) res.setHeader('Content-Length', String(output.ContentLength))
    if (output.ContentRange) res.setHeader('Content-Range', output.ContentRange)
    if (output.ETag) res.setHeader('ETag', output.ETag)
    if (output.LastModified) res.setHeader('Last-Modified', output.LastModified.toUTCString())

    if (typeof body.pipe === 'function') {
      body.on('error', (streamError) => {
        if (!res.headersSent) {
          return jsonError(res, 500, String(streamError?.message || streamError || 'R2 流式读取失败'))
        }
        res.destroy(streamError)
      })
      body.pipe(res)
      return
    }

    if (typeof body.transformToWebStream === 'function') {
      const nodeStream = Readable.fromWeb(body.transformToWebStream())
      nodeStream.on('error', (streamError) => {
        if (!res.headersSent) {
          return jsonError(res, 500, String(streamError?.message || streamError || 'R2 流式读取失败'))
        }
        res.destroy(streamError)
      })
      nodeStream.pipe(res)
      return
    }

    if (typeof body.transformToByteArray === 'function') {
      const bytes = await body.transformToByteArray()
      res.end(Buffer.from(bytes))
      return
    }

    return jsonError(res, 500, '不支持的 R2 响应流类型')
  } catch (error) {
    const message = String(error?.message || error || '')
    const statusCode = Number(error?.$metadata?.httpStatusCode || 0)
    if (statusCode === 404 || message.includes('NoSuchKey') || message.includes('NotFound')) {
      return jsonError(res, 404, 'R2 对象不存在')
    }
    return jsonError(res, 500, error.message || 'R2 流式读取失败')
  }
})

/**
 * 删除 R2 对象
 * POST /api/r2/delete
 * Body: { objectKey: string }
 */
app.post('/api/r2/delete', async (req, res) => {
  if (!isR2Configured()) {
    return jsonError(res, 503, 'R2 未配置（缺少 R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET / R2_ENDPOINT）')
  }

  const objectKey = normalizeR2ObjectKey(req.body?.objectKey)
  if (!objectKey) {
    return jsonError(res, 400, 'objectKey 无效')
  }

  try {
    const client = getR2Client()
    if (!client) {
      return jsonError(res, 503, 'R2 客户端初始化失败')
    }

    await client.send(new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: objectKey
    }))

    return res.json({
      success: true,
      data: { objectKey, deleted: true },
      error: null
    })
  } catch (error) {
    return jsonError(res, 500, error.message || '删除 R2 对象失败')
  }
})

/**
 * 解析 R2 公共 URL（用于前端兼容回退）
 * POST /api/r2/public-url
 * Body: { objectKey: string }
 */
app.post('/api/r2/public-url', async (req, res) => {
  if (!isR2Configured()) {
    return jsonError(res, 503, 'R2 未配置（缺少 R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET / R2_ENDPOINT）')
  }

  const objectKey = normalizeR2ObjectKey(req.body?.objectKey)
  if (!objectKey) {
    return jsonError(res, 400, 'objectKey 无效')
  }

  const publicUrl = buildR2PublicUrl(objectKey)
  if (!publicUrl) {
    return jsonError(res, 500, '无法生成 R2 公共 URL')
  }

  return res.json({
    success: true,
    data: { objectKey, publicUrl },
    error: null
  })
})

/**
 * 云存储统计
 * GET /api/storage/stats
 */
app.get('/api/storage/stats', async (req, res) => {
  try {
    const [summaryResult, bucketResult, orphanResult] = await Promise.all([
      executeQuery(
        `SELECT
           COUNT(*) AS total_files,
           COALESCE(SUM(file_size), 0) AS total_bytes,
           COALESCE(SUM(CASE WHEN is_chunked THEN 1 ELSE 0 END), 0) AS chunked_files,
           MAX(created_at) AS last_upload_at
         FROM file_storage`
      ),
      executeQuery(
        `SELECT
           bucket,
           COUNT(*) AS files,
           COALESCE(SUM(file_size), 0) AS total_bytes,
           COALESCE(SUM(CASE WHEN is_chunked THEN 1 ELSE 0 END), 0) AS chunked_files,
           MAX(created_at) AS last_upload_at
         FROM file_storage
         GROUP BY bucket
         ORDER BY total_bytes DESC`
      ),
      executeQuery(
        `SELECT COUNT(*) AS orphan_chunks
         FROM file_chunks c
         LEFT JOIN file_storage f ON c.file_id = f.id
         WHERE f.id IS NULL`
      )
    ])

    if (!summaryResult.success || !bucketResult.success || !orphanResult.success) {
      return jsonError(res, 500, summaryResult.error || bucketResult.error || orphanResult.error || '统计失败')
    }

    const summaryRaw = summaryResult.data?.[0] || {}
    const orphanRaw = orphanResult.data?.[0] || {}
    const buckets = (bucketResult.data || []).map((row) => ({
      bucket: row.bucket,
      files: parseSafeInteger(row.files, 0),
      totalBytes: parseSafeInteger(row.total_bytes, 0),
      chunkedFiles: parseSafeInteger(row.chunked_files, 0),
      lastUploadAt: row.last_upload_at || null
    }))

    res.setHeader('Cache-Control', 'no-store')
    res.json({
      success: true,
      data: {
        summary: {
          totalFiles: parseSafeInteger(summaryRaw.total_files, 0),
          totalBytes: parseSafeInteger(summaryRaw.total_bytes, 0),
          chunkedFiles: parseSafeInteger(summaryRaw.chunked_files, 0),
          orphanChunks: parseSafeInteger(orphanRaw.orphan_chunks, 0),
          lastUploadAt: summaryRaw.last_upload_at || null
        },
        buckets
      },
      error: null
    })
  } catch (error) {
    return jsonError(res, 500, error.message)
  }
})

/**
 * 清理孤儿分片（仅管理员）
 * POST /api/storage/admin/cleanup-orphans
 * Body: { dryRun?: boolean, limit?: number }
 */
app.post('/api/storage/admin/cleanup-orphans', requireStorageAdminToken, async (req, res) => {
  try {
    const dryRun = req.body?.dryRun !== false
    const limit = Math.min(parseSafeInteger(req.body?.limit, 5000), 20000)

    const countResult = await executeQuery(
      `SELECT COUNT(*) AS orphan_chunks
       FROM file_chunks c
       LEFT JOIN file_storage f ON c.file_id = f.id
       WHERE f.id IS NULL`
    )

    if (!countResult.success) {
      return jsonError(res, 500, countResult.error || '统计孤儿分片失败')
    }

    const orphanCount = parseSafeInteger(countResult.data?.[0]?.orphan_chunks, 0)
    if (dryRun || orphanCount === 0) {
      return res.json({
        success: true,
        data: {
          dryRun: true,
          orphanChunks: orphanCount,
          deletedChunks: 0
        },
        error: null
      })
    }

    const deleteResult = await executeQuery(
      `DELETE FROM file_chunks
       WHERE file_id IN (
         SELECT orphan_file_id FROM (
           SELECT c.file_id AS orphan_file_id
           FROM file_chunks c
           LEFT JOIN file_storage f ON c.file_id = f.id
           WHERE f.id IS NULL
           LIMIT $1
         ) t
       )`,
      [limit]
    )

    if (!deleteResult.success) {
      return jsonError(res, 500, deleteResult.error || '清理孤儿分片失败')
    }

    return res.json({
      success: true,
      data: {
        dryRun: false,
        orphanChunks: orphanCount,
        deletedChunks: deleteResult.count || 0,
        remainingEstimate: Math.max(0, orphanCount - (deleteResult.count || 0))
      },
      error: null
    })
  } catch (error) {
    return jsonError(res, 500, error.message)
  }
})

/**
 * 清理未被 student_media 引用的文件对象（仅管理员）
 * 默认 dryRun=true，只返回可清理体积，不删除数据。
 * POST /api/storage/admin/cleanup-unreferenced-files
 * Body: { dryRun?: boolean, limit?: number, bucket?: string }
 */
app.post('/api/storage/admin/cleanup-unreferenced-files', requireStorageAdminToken, async (req, res) => {
  try {
    const dryRun = req.body?.dryRun !== false
    const bucket = String(req.body?.bucket || 'student-media')
    const limit = Math.min(parseSafeInteger(req.body?.limit, 1000), 20000)

    if (!SAFE_BUCKET_PATTERN.test(bucket)) {
      return jsonError(res, 400, '无效的 bucket 参数')
    }

    const countResult = await executeQuery(
      `SELECT
         COUNT(*) AS orphan_files,
         COALESCE(SUM(f.file_size), 0) AS orphan_bytes
       FROM file_storage f
       LEFT JOIN student_media m ON m.storage_path = f.path
       WHERE f.bucket = $1 AND m.id IS NULL`,
      [bucket]
    )

    if (!countResult.success) {
      return jsonError(res, 500, countResult.error || '统计未引用文件失败')
    }

    const orphanFiles = parseSafeInteger(countResult.data?.[0]?.orphan_files, 0)
    const orphanBytes = parseSafeInteger(countResult.data?.[0]?.orphan_bytes, 0)

    if (dryRun || orphanFiles === 0) {
      return res.json({
        success: true,
        data: {
          dryRun: true,
          bucket,
          orphanFiles,
          orphanBytes,
          deletedFiles: 0,
          deletedBytes: 0
        },
        error: null
      })
    }

    const candidatesResult = await executeQuery(
      `SELECT f.id, COALESCE(f.file_size, 0) AS file_size
       FROM file_storage f
       LEFT JOIN student_media m ON m.storage_path = f.path
       WHERE f.bucket = $1 AND m.id IS NULL
       LIMIT $2`,
      [bucket, limit]
    )

    if (!candidatesResult.success) {
      return jsonError(res, 500, candidatesResult.error || '读取待清理文件失败')
    }

    const candidates = candidatesResult.data || []
    if (candidates.length === 0) {
      return res.json({
        success: true,
        data: {
          dryRun: false,
          bucket,
          orphanFiles,
          orphanBytes,
          deletedFiles: 0,
          deletedBytes: 0
        },
        error: null
      })
    }

    const candidateIds = candidates.map((row) => row.id)
    const deletedBytes = candidates.reduce((acc, row) => acc + parseSafeInteger(row.file_size, 0), 0)

    const deleteChunkResult = await executeQuery(
      'DELETE FROM file_chunks WHERE file_id = ANY($1::uuid[])',
      [candidateIds]
    )

    if (!deleteChunkResult.success) {
      return jsonError(res, 500, deleteChunkResult.error || '删除分片失败')
    }

    const deleteFileResult = await executeQuery(
      'DELETE FROM file_storage WHERE id = ANY($1::uuid[])',
      [candidateIds]
    )

    if (!deleteFileResult.success) {
      return jsonError(res, 500, deleteFileResult.error || '删除文件失败')
    }

    return res.json({
      success: true,
      data: {
        dryRun: false,
        bucket,
        orphanFiles,
        orphanBytes,
        deletedFiles: deleteFileResult.count || 0,
        deletedBytes,
        remainingEstimate: Math.max(0, orphanFiles - (deleteFileResult.count || 0))
      },
      error: null
    })
  } catch (error) {
    return jsonError(res, 500, error.message)
  }
})

// ==================== 管理员认证 API ====================

app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      data: null,
      error: '用户名和密码不能为空'
    })
  }

  const result = await executeQuery(
    'SELECT id, username, full_name, role, status FROM admin_users WHERE username = $1 AND password = $2 AND status = $3 LIMIT 1',
    [username, password, 'active']
  )

  if (result.success && result.data?.length > 0) {
    res.json({ success: true, data: result.data[0], error: null })
    return
  }

  // 如果数据库不可用或未找到用户，尝试本地回退文件（开发模式）
  try {
    const fallbackPath = join(__dirname, 'fallback_admin_users.json')
    if (existsSync(fallbackPath)) {
      const raw = JSON.parse(readFileSync(fallbackPath, 'utf8'))
      const found = raw.find(u => u.username === username && u.password === password && u.status === 'active')
      if (found) {
        res.json({ success: true, data: found, error: null })
        return
      }
    }
  } catch (err) {
    console.warn('回退用户读取失败:', err.message)
  }

  res.status(401).json({ success: false, data: null, error: '用户名或密码错误' })
})

app.get('/api/admin/user/:username', async (req, res) => {
  const { username } = req.params
  const result = await executeQuery(
    'SELECT id, username, full_name, role, status, password FROM admin_users WHERE username = $1 LIMIT 1',
    [username]
  )
  if (result.success && result.data && result.data.length > 0) {
    res.json({ ...result, data: result.data[0] })
    return
  }

  // DB 不可用或未找到，尝试本地回退
  try {
    const fallbackPath = join(__dirname, 'fallback_admin_users.json')
    if (existsSync(fallbackPath)) {
      const raw = JSON.parse(readFileSync(fallbackPath, 'utf8'))
      const found = raw.find(u => u.username === username) || null
      res.json({ success: !!found, data: found, error: found ? null : '用户未找到（回退）' })
      return
    }
  } catch (err) {
    console.warn('回退用户读取失败:', err.message)
  }

  res.json({ ...result, data: result.data?.[0] || null })
})

// ==================== 快捷 API（保持兼容）====================

app.get('/api/student-profiles', async (req, res) => {
  const result = await executeQuery('SELECT * FROM student_profiles ORDER BY created_at DESC')
  res.json(result)
})

app.get('/api/student-profiles/:studentId', async (req, res) => {
  const { studentId } = req.params
  const result = await executeQuery(
    'SELECT * FROM student_profiles WHERE student_id = $1 LIMIT 1',
    [studentId]
  )
  res.json({ ...result, data: result.data?.[0] || null })
})

app.get('/api/stats', async (req, res) => {
  try {
    const [profileCount, mediaCount, docCount, savedDocCount] = await Promise.all([
      executeQuery('SELECT COUNT(*) as count FROM student_profiles'),
      executeQuery('SELECT COUNT(*) as count FROM student_media WHERE deleted_at IS NULL'),
      executeQuery('SELECT COUNT(*) as count FROM student_documents WHERE deleted_at IS NULL'),
      executeQuery('SELECT COUNT(*) as count FROM saved_documents')
    ])

    res.json({
      success: true,
      data: {
        student_profiles: parseInt(profileCount.data?.[0]?.count || '0'),
        student_media: parseInt(mediaCount.data?.[0]?.count || '0'),
        student_documents: parseInt(docCount.data?.[0]?.count || '0'),
        saved_documents: parseInt(savedDocCount.data?.[0]?.count || '0')
      },
      error: null
    })
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: error.message })
  }
})

app.get('/api/student-media/:studentId', async (req, res) => {
  const { studentId } = req.params
  const result = await executeQuery(
    'SELECT * FROM student_media WHERE student_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC',
    [studentId]
  )
  res.json(result)
})

app.get('/api/student-documents/:studentId', async (req, res) => {
  const { studentId } = req.params
  const result = await executeQuery(
    'SELECT * FROM student_documents WHERE student_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC',
    [studentId]
  )
  res.json(result)
})

// ==================== 健康检查 ====================

app.get('/health', async (req, res) => {
  try {
    const result = await executeQuery('SELECT 1')
    if (result.success) {
      res.json({ status: 'healthy', database: 'connected', timestamp: new Date().toISOString() })
    } else {
      res.status(503).json({ status: 'unhealthy', database: 'disconnected', error: result.error })
    }
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', database: 'error', error: error.message })
  }
})

// ==================== 启动服务器 ====================

const PORT = process.env.API_PORT || 3001

app.listen(PORT, () => {
  console.log(`✅ API 服务器已启动: http://localhost:${PORT}`)
  console.log(`📊 健康检查: http://localhost:${PORT}/health`)
  console.log(`🔗 数据库连接池: 已初始化`)
})

process.on('SIGINT', async () => {
  console.log('\n🛑 正在关闭...')
  await pool.end()
  process.exit(0)
})
