import express from 'express'
import cors from 'cors'
import pg from 'pg'
import bcrypt from 'bcryptjs'
import serverless from 'serverless-http'

const { Pool } = pg
const connectionString = process.env.COCKROACHDB_URL || process.env.VITE_COCKROACHDB_URL
const pool = connectionString ? new Pool({ connectionString }) : null

const app = express()

app.use(cors())
app.use(express.json({ limit: '20mb' }))

function jsonError(res, status, error) {
  return res.status(status).json({ success: false, data: null, error })
}

function isBcryptHash(value) {
  return typeof value === 'string' && /^\$2[aby]\$\d{2}\$/.test(value)
}

function parseSafeInteger(value, fallbackValue) {
  const n = Number.parseInt(String(value), 10)
  if (!Number.isFinite(n) || n <= 0) return fallbackValue
  return n
}

function sanitizeColumn(col) {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(String(col || '')) ? col : null
}

function parseOrExpression(expression, params, paramIndex) {
  const parts = String(expression || '').split(',')
  const clauses = []

  for (const part of parts) {
    const match = part.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\.([a-z]+)\.(.+)$/)
    if (!match) continue

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
        break
    }
  }

  return {
    clause: clauses.length > 0 ? clauses.join(' OR ') : '',
    paramIndex
  }
}

const ALLOWED_TABLES = [
  'student_profiles', 'student_media', 'student_documents',
  'saved_documents', 'admin_users', 'user_roles', 'templates'
]

const MAX_QUERY_FILTERS = Number(process.env.MAX_QUERY_FILTERS || 30)
const MAX_QUERY_OR_LENGTH = Number(process.env.MAX_QUERY_OR_LENGTH || 2000)
const DEFAULT_QUERY_LIMIT = Number(process.env.DEFAULT_QUERY_LIMIT || 500)
const MAX_QUERY_LIMIT = Number(process.env.MAX_QUERY_LIMIT || 2000)

async function executeQuery(text, values = []) {
  try {
    const result = await query(text, values)
    return { success: true, data: result.rows, error: null }
  } catch (error) {
    return { success: false, data: null, error: error.message }
  }
}

async function query(text, values = []) {
  if (!pool) {
    throw new Error('数据库连接字符串未配置')
  }

  return pool.query(text, values)
}

async function handleHealth(req, res) {
  try {
    const result = await query('SELECT 1 AS ok')
    return res.json({
      status: 'ok',
      database: result?.rows?.[0]?.ok === 1 ? 'connected' : 'unknown'
    })
  } catch (error) {
    return res.status(503).json({
      status: 'error',
      database: 'error',
      error: error.message
    })
  }
}

async function handleAdminLogin(req, res) {
  const username = String(req.body?.username || '').trim()
  const password = String(req.body?.password || '').trim()

  if (!username || !password) {
    return jsonError(res, 400, '用户名和密码不能为空')
  }

  try {
    const result = await query(
      'SELECT id, username, full_name, role, status, password, created_at, updated_at FROM admin_users WHERE username = $1 LIMIT 1',
      [username]
    )

    const user = result.rows?.[0]
    if (!user) {
      return jsonError(res, 401, '用户名或密码错误')
    }

    if (user.status !== 'active') {
      return jsonError(res, 403, '账号已被禁用')
    }

    const storedPassword = String(user.password || '')
    const passwordValid = isBcryptHash(storedPassword)
      ? await bcrypt.compare(password, storedPassword)
      : storedPassword === password

    if (!passwordValid) {
      return jsonError(res, 401, '用户名或密码错误')
    }

    const { password: _password, ...safeUser } = user
    return res.json({ success: true, data: safeUser, error: null })
  } catch (error) {
    return jsonError(res, 500, error.message || '登录失败')
  }
}

async function handleAdminUser(req, res) {
  const { username } = req.params

  try {
    const result = await query(
      'SELECT id, username, full_name, role, status, created_at, updated_at FROM admin_users WHERE username = $1 LIMIT 1',
      [username]
    )

    if (result.rows.length > 0) {
      return res.json({ success: true, data: result.rows[0], error: null })
    }

    return res.json({ success: true, data: null, error: null })
  } catch (error) {
    return jsonError(res, 500, error.message || '查询管理员失败')
  }

}

app.get(['/health', '/api/health'], handleHealth)
app.post(['/api/admin/login', '/admin/login'], handleAdminLogin)
app.get(['/api/admin/user/:username', '/admin/user/:username'], handleAdminUser)

app.post('/api/query', async (req, res) => {
  const { table, operation, select, data, filters, options, returnData } = req.body || {}

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
        let selectCols = '*'
        if (select && select !== '*') {
          const cols = String(select).split(',').map((c) => c.trim())
          const safeCols = cols.filter((c) => sanitizeColumn(c) || c === '*')
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
          if (data.length === 0) {
            return res.json({ success: true, data: [], error: null })
          }
          const cols = Object.keys(data[0]).filter((c) => sanitizeColumn(c))
          const allValues = []
          const valueSets = data.map((row) => {
            const vals = cols.map((c) => {
              allValues.push(row[c] !== undefined ? row[c] : null)
              return `$${paramIndex++}`
            })
            return `(${vals.join(', ')})`
          })
          sql = `INSERT INTO ${table} (${cols.join(', ')}) VALUES ${valueSets.join(', ')}`
          params = allValues
        } else {
          const cols = Object.keys(data).filter((c) => sanitizeColumn(c))
          const vals = cols.map((c) => {
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
        const cols = Object.keys(data).filter((c) => sanitizeColumn(c))
        if (cols.length === 0) {
          return jsonError(res, 400, '没有有效的更新字段')
        }
        const setClauses = cols.map((c) => {
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

    if ((operation === 'update' || operation === 'delete') && returnData) {
      sql += ' RETURNING *'
    }

    if ((operation === 'update' || operation === 'delete') && whereClauses.length === 0) {
      return jsonError(res, 400, `${operation} 操作必须至少包含一个过滤条件`)
    }

    if (operation === 'select' && options?.order && options.order.length > 0) {
      const orderClauses = options.order
        .filter((o) => sanitizeColumn(o.column))
        .map((o) => `${o.column} ${o.ascending ? 'ASC' : 'DESC'}`)
      if (orderClauses.length > 0) {
        sql += ` ORDER BY ${orderClauses.join(', ')}`
      }
    }

    if (operation === 'select' && options?.limit !== undefined && options?.limit !== null) {
      const safeLimit = Math.min(
        parseSafeInteger(options.limit, DEFAULT_QUERY_LIMIT),
        MAX_QUERY_LIMIT
      )
      sql += ` LIMIT ${safeLimit}`
    }

    const result = await executeQuery(sql, params)
    res.json(result)
  } catch (error) {
    return res.status(500).json({ success: false, data: null, error: error.message })
  }
})

app.get('/api/student-media/:studentId', async (req, res) => {
  const result = await executeQuery(
    'SELECT * FROM student_media WHERE student_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC',
    [req.params.studentId]
  )
  res.json(result)
})

app.get('/api/student-documents/:studentId', async (req, res) => {
  const result = await executeQuery(
    'SELECT * FROM student_documents WHERE student_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC',
    [req.params.studentId]
  )
  res.json(result)
})

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

    return res.json({
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

export const handler = serverless(app)