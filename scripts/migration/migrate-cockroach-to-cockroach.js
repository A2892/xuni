#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg
const rootDir = process.cwd()

const sourceUrl =
  process.env.COCKROACHDB_SOURCE_URL ||
  process.env.OLD_COCKROACHDB_URL ||
  ''

const targetUrl =
  process.env.COCKROACHDB_URL ||
  process.env.COCKROACHDB_TARGET_URL ||
  process.env.VITE_COCKROACHDB_URL ||
  ''

const sourceCertPathRaw = process.env.COCKROACHDB_SOURCE_SSL_ROOT_CERT || process.env.DB_SSL_ROOT_CERT || ''
const targetCertPathRaw = process.env.COCKROACHDB_TARGET_SSL_ROOT_CERT || process.env.COCKROACHDB_SSL_ROOT_CERT || process.env.DB_SSL_ROOT_CERT || ''

if (!sourceUrl) {
  console.error('Error: missing source URL (COCKROACHDB_SOURCE_URL).')
  process.exit(1)
}

if (!targetUrl) {
  console.error('Error: missing target URL (COCKROACHDB_URL / COCKROACHDB_TARGET_URL).')
  process.exit(1)
}

function normalizePath(p) {
  if (!p) return ''
  return path.isAbsolute(p) ? p : path.join(rootDir, p)
}

function quoteIdent(v) {
  return `"${String(v).replace(/"/g, '""')}"`
}

function chunkArray(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size))
  }
  return out
}

function estimateValueBytes(value) {
  if (value === null || value === undefined) return 4
  if (Buffer.isBuffer(value)) return value.length
  if (typeof value === 'string') return Buffer.byteLength(value, 'utf8')
  if (typeof value === 'number' || typeof value === 'bigint') return 16
  if (typeof value === 'boolean') return 1
  return Buffer.byteLength(JSON.stringify(value), 'utf8')
}

function createPayloadBatches(rows, columns, options = {}) {
  const maxBytes = options.maxBytes || 8 * 1024 * 1024
  const maxRows = options.maxRows || 100

  const batches = []
  let current = []
  let currentBytes = 0

  for (const row of rows) {
    let rowBytes = 0
    for (const col of columns) {
      rowBytes += estimateValueBytes(row[col])
    }

    const willExceedBytes = current.length > 0 && (currentBytes + rowBytes > maxBytes)
    const willExceedRows = current.length >= maxRows

    if (willExceedBytes || willExceedRows) {
      batches.push(current)
      current = []
      currentBytes = 0
    }

    current.push(row)
    currentBytes += rowBytes
  }

  if (current.length > 0) {
    batches.push(current)
  }

  return batches
}

function buildPool(connectionString, certPath) {
  const config = { connectionString, max: 1 }

  if (certPath) {
    if (!fs.existsSync(certPath)) {
      throw new Error(`SSL cert file not found: ${certPath}`)
    }

    config.connectionString = connectionString
      .replace(/([?&])sslmode=[^&]*&?/gi, '$1')
      .replace(/[?&]$/, '')
      .replace('?&', '?')

    config.ssl = {
      rejectUnauthorized: true,
      ca: fs.readFileSync(certPath, 'utf8')
    }
  }

  const pool = new Pool(config)
  pool.on('error', (err) => {
    console.error('Pool error:', err.message)
  })
  return pool
}

async function withRetry(label, fn, maxRetries = 6) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      const msg = String(error?.message || error)
      const retriable =
        /timeout|Connection terminated|ECONNRESET|ENOTFOUND|Unable to check out connection from the pool/i.test(msg)

      if (!retriable || attempt === maxRetries) {
        throw error
      }

      const waitMs = attempt * 2000
      console.warn(`${label} failed (${msg}), retrying in ${waitMs}ms...`)
      await new Promise(resolve => setTimeout(resolve, waitMs))
    }
  }
}

async function main() {
  const sourceCertPath = normalizePath(sourceCertPathRaw)
  const targetCertPath = normalizePath(targetCertPathRaw)

  const sourcePool = buildPool(sourceUrl, sourceCertPath)
  const targetPool = buildPool(targetUrl, targetCertPath)

  try {
    await withRetry('source ping', () => sourcePool.query('select 1'))
    await withRetry('target ping', () => targetPool.query('select 1'))

    const sourceTablesRes = await withRetry('load source tables', () => sourcePool.query(`
      select table_name
      from information_schema.tables
      where table_schema = 'public' and table_type = 'BASE TABLE'
      order by table_name
    `))
    const sourceTables = sourceTablesRes.rows.map(r => r.table_name)

    if (sourceTables.length === 0) {
      throw new Error('No public tables found in source database.')
    }

    const getTargetTables = async () => {
      const res = await withRetry('load target tables', () => targetPool.query(`
        select table_name
        from information_schema.tables
        where table_schema = 'public' and table_type = 'BASE TABLE'
        order by table_name
      `))
      return res.rows.map(r => r.table_name)
    }

    let targetTables = await getTargetTables()
    let commonTables = sourceTables.filter(t => targetTables.includes(t))
    let missingTables = sourceTables.filter(t => !targetTables.includes(t))

    if (missingTables.length > 0) {
      const initSqlPath = path.join(rootDir, 'scripts/migration/0-init-cockroach-from-source.sql')
      if (fs.existsSync(initSqlPath)) {
        console.log(`Applying init SQL: ${initSqlPath}`)
        const initSql = fs.readFileSync(initSqlPath, 'utf8')
        await withRetry('apply init sql', () => targetPool.query(initSql))

        targetTables = await getTargetTables()
        commonTables = sourceTables.filter(t => targetTables.includes(t))
        missingTables = sourceTables.filter(t => !targetTables.includes(t))
      }
    }

    if (commonTables.length === 0) {
      throw new Error('No common public tables between source and target.')
    }

    console.log('Tables to migrate:')
    commonTables.forEach(t => console.log(`  - ${t}`))

    if (missingTables.length > 0) {
      console.log('Warning: missing in target, skipped:')
      missingTables.forEach(t => console.log(`  - ${t}`))
    }

    const truncateSql = `TRUNCATE TABLE ${commonTables.map(quoteIdent).join(', ')}`
    await withRetry('truncate target', () => targetPool.query(truncateSql))

    for (const table of commonTables) {
      const { rows } = await withRetry(`read ${table}`, () => sourcePool.query(`SELECT * FROM ${quoteIdent(table)}`))
      console.log(`Migrating ${table}: ${rows.length} rows`)

      if (rows.length === 0) continue

      const columns = Object.keys(rows[0])
      const columnsSql = columns.map(quoteIdent).join(', ')
      const isLargeBinaryTable = table === 'file_storage' || table === 'file_chunks'
      const batches = createPayloadBatches(rows, columns, {
        maxBytes: isLargeBinaryTable ? 4 * 1024 * 1024 : 8 * 1024 * 1024,
        maxRows: isLargeBinaryTable ? 8 : 100
      })

      console.log(`  ${table} split into ${batches.length} batch(es)`)

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]
        console.log(`  ${table} batch ${i + 1}/${batches.length} (${batch.length} rows)`)
        const values = []
        const placeholders = []
        let p = 1

        for (const row of batch) {
          const rowPlaceholders = []
          for (const col of columns) {
            values.push(row[col] === undefined ? null : row[col])
            rowPlaceholders.push(`$${p++}`)
          }
          placeholders.push(`(${rowPlaceholders.join(', ')})`)
        }

        const insertSql = `INSERT INTO ${quoteIdent(table)} (${columnsSql}) VALUES ${placeholders.join(', ')} ON CONFLICT DO NOTHING`
        await withRetry(`insert ${table}`, () => targetPool.query(insertSql, values))
      }
    }

    let mismatch = false
    console.log('Row count verification:')
    for (const table of commonTables) {
      const src = await withRetry(`count source ${table}`, () => sourcePool.query(`SELECT count(*)::bigint AS c FROM ${quoteIdent(table)}`))
      const dst = await withRetry(`count target ${table}`, () => targetPool.query(`SELECT count(*)::bigint AS c FROM ${quoteIdent(table)}`))
      const srcCount = Number(src.rows[0].c)
      const dstCount = Number(dst.rows[0].c)
      const status = srcCount === dstCount ? 'OK' : 'MISMATCH'
      if (status !== 'OK') mismatch = true
      console.log(`${table}: source=${srcCount}, target=${dstCount}, ${status}`)
    }

    if (mismatch) {
      throw new Error('Migration completed with row-count mismatches.')
    }

    console.log('Migration completed successfully.')
  } finally {
    await sourcePool.end()
    await targetPool.end()
  }
}

main().catch((err) => {
  console.error('Migration failed:', err.message || err)
  process.exit(1)
})
