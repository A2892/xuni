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

export const handler = serverless(app)