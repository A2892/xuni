#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg
const rootDir = process.cwd()

const sourceUrl = process.env.COCKROACHDB_URL || process.env.VITE_COCKROACHDB_URL || ''
const targetUrl = process.env.SUPABASE_DB_URL || process.env.VITE_SUPABASE_DB_URL || ''
const targetCertPathRaw = process.env.SUPABASE_DB_SSL_ROOT_CERT || process.env.DB_SSL_ROOT_CERT || ''

function stripSslMode(url) {
  if (!url) return url
  return url
    .replace(/([?&])sslmode=[^&]*&?/gi, '$1')
    .replace(/[?&]$/, '')
    .replace('?&', '?')
}

if (!sourceUrl) {
  console.error('Error: missing source DB URL (COCKROACHDB_URL or VITE_COCKROACHDB_URL).')
  process.exit(1)
}

if (!targetUrl) {
  console.error('Error: missing target DB URL (SUPABASE_DB_URL).')
  process.exit(1)
}

const targetCertPath = targetCertPathRaw
  ? (path.isAbsolute(targetCertPathRaw) ? targetCertPathRaw : path.join(rootDir, targetCertPathRaw))
  : ''

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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function isRetriablePoolerError(err) {
  const msg = String(err?.message || err || '')
  return (
    msg.includes('MaxClientsInSessionMode') ||
    msg.includes('Unable to check out connection from the pool due to timeout') ||
    msg.includes('DbHandler exited') ||
    msg.includes('Connection terminated unexpectedly') ||
    msg.includes('SSL connection has been closed unexpectedly') ||
    msg.includes('connection to server was lost')
  )
}

async function main() {
  const sourcePool = new Pool({
    connectionString: sourceUrl,
    max: 1
  })

  sourcePool.on('error', (err) => {
    console.warn(`source pool notice: ${err.message}`)
  })

  const targetPoolConfig = {
    connectionString: targetUrl,
    max: 1
  }

  if (targetCertPath) {
    if (!fs.existsSync(targetCertPath)) {
      console.error(`Error: target SSL cert file not found: ${targetCertPath}`)
      process.exit(1)
    }

    targetPoolConfig.connectionString = stripSslMode(targetUrl)
    targetPoolConfig.ssl = {
      rejectUnauthorized: true,
      ca: fs.readFileSync(targetCertPath, 'utf8')
    }
  }

  const targetPool = new Pool(targetPoolConfig)

  targetPool.on('error', (err) => {
    if (isRetriablePoolerError(err)) {
      console.warn(`target pool transient notice: ${err.message}`)
      return
    }
    console.warn(`target pool notice: ${err.message}`)
  })

  async function targetQuery(sql, params = [], label = 'target query') {
    const maxRetries = Number(process.env.MIGRATION_TARGET_RETRIES || 120)
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await targetPool.query(sql, params)
      } catch (err) {
        if (!isRetriablePoolerError(err) || i === maxRetries - 1) {
          throw err
        }

        const waitMs = Math.min(30000, 2000 + i * 1000)
        console.warn(`${label} busy (${i + 1}/${maxRetries}), retry in ${waitMs}ms: ${err.message}`)
        await sleep(waitMs)
      }
    }
  }

  try {
    await sourcePool.query('select 1')
    await targetQuery('select 1', [], 'connect target')

    const sourceTablesRes = await sourcePool.query(`
      select table_name
      from information_schema.tables
      where table_schema = 'public' and table_type = 'BASE TABLE'
      order by table_name
    `)
    const sourceTables = sourceTablesRes.rows.map(r => r.table_name)

    if (sourceTables.length === 0) {
      throw new Error('No public tables found in source database.')
    }

    const getTargetTables = async () => {
      const res = await targetQuery(`
        select table_name
        from information_schema.tables
        where table_schema = 'public' and table_type = 'BASE TABLE'
        order by table_name
      `, [], 'list target tables')
      return res.rows.map(r => r.table_name)
    }

    let targetTables = await getTargetTables()
    let commonTables = sourceTables.filter(t => targetTables.includes(t))
    let missingTables = sourceTables.filter(t => !targetTables.includes(t))

    if (missingTables.length > 0) {
      const initSqlPath = path.join(rootDir, 'scripts/migration/0-init-supabase-from-cockroach.sql')
      if (fs.existsSync(initSqlPath)) {
        console.log(`Applying init SQL: ${initSqlPath}`)
        const initSql = fs.readFileSync(initSqlPath, 'utf8')
        await targetQuery(initSql, [], 'apply init sql')

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

    const truncateSql = `TRUNCATE TABLE ${commonTables.map(quoteIdent).join(', ')} RESTART IDENTITY CASCADE`
    await targetQuery(truncateSql, [], 'truncate target tables')

    for (const table of commonTables) {
      const selectSql = `SELECT * FROM ${quoteIdent(table)}`
      const { rows } = await sourcePool.query(selectSql)
      console.log(`Migrating ${table}: ${rows.length} rows`)

      if (rows.length === 0) continue

      const columns = Object.keys(rows[0])
      const columnsSql = columns.map(quoteIdent).join(', ')
      const batches = chunkArray(rows, 200)

      for (const batch of batches) {
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

        const insertSql = `INSERT INTO ${quoteIdent(table)} (${columnsSql}) VALUES ${placeholders.join(', ')}`
        await targetQuery(insertSql, values, `insert ${table}`)
      }
    }

    let mismatch = false
    console.log('Row count verification:')
    for (const table of commonTables) {
      const src = await sourcePool.query(`SELECT count(*)::bigint AS c FROM ${quoteIdent(table)}`)
      const dst = await targetQuery(`SELECT count(*)::bigint AS c FROM ${quoteIdent(table)}`, [], `count ${table}`)
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

main().catch(err => {
  console.error('Migration failed:', err.message || err)
  process.exit(1)
})
