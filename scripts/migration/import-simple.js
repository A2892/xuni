#!/usr/bin/env node

/**
 * 简化的数据导入脚本
 */

import pg from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const cockroachDbUrl = process.env.COCKROACHDB_URL || '';

if (!cockroachDbUrl) {
  console.error('❌ 错误：未配置 COCKROACHDB_URL');
  process.exit(1);
}

const importFile = process.argv[2];
if (!importFile) {
  console.error('❌ 错误：请指定导入文件路径');
  process.exit(1);
}

const filePath = path.resolve(importFile);
if (!fs.existsSync(filePath)) {
  console.error(`❌ 文件不存在：${filePath}`);
  process.exit(1);
}

function sqlValue(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "''")}'`;
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  if (Array.isArray(value)) {
    const items = value.map(v => sqlValue(v)).join(',');
    return `ARRAY[${items}]`;
  }
  if (typeof value === 'object') {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  }
  return 'NULL';
}

async function importTable(pool, tableName, data) {
  if (!data || data.length === 0) {
    console.log(`  ℹ️  表 ${tableName} 无数据，跳过`);
    return 0;
  }
  
  console.log(`\n📤 导入表: ${tableName} (${data.length} 行)`);
  
  try {
    const columns = Object.keys(data[0]);
    const valuesList = data.map(row => {
      const values = columns.map(col => sqlValue(row[col]));
      return `(${values.join(', ')})`;
    }).join(', ');
    
    const sql = `
      INSERT INTO ${tableName} (${columns.join(', ')})
      VALUES ${valuesList}
      ON CONFLICT DO NOTHING
    `;
    
    const result = await pool.query(sql);
    const imported = result.rowCount || data.length;
    
    console.log(`  ✅ 表 ${tableName} 导入完成，共导入 ${imported} 行`);
    return imported;
  } catch (error) {
    console.error(`  ❌ 导入表 ${tableName} 失败:`, error.message.substring(0, 100));
    return 0;
  }
}

async function importAllData() {
  console.log('🚀 开始导入数据到 CockroachDB...\n');
  
  const exportData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`📅 导出时间: ${exportData.exportDate}`);
  console.log(`📍 源 Supabase URL: ${exportData.supabaseUrl}\n`);
  
  const pool = new Pool({
    connectionString: cockroachDbUrl
  });
  
  try {
    const testResult = await pool.query('SELECT version()');
    console.log(`✅ 已连接到 CockroachDB\n`);
    
    let totalImported = 0;
    
    const tableOrder = [
      'student_profiles',
      'student_media',
      'student_documents',
      'saved_documents',
      'admin_users',
      'user_roles',
      'courses',
      'universities',
      'students'
    ];
    
    for (const tableName of tableOrder) {
      if (exportData.tables[tableName] && exportData.tables[tableName].length > 0) {
        const imported = await importTable(pool, tableName, exportData.tables[tableName]);
        totalImported += imported;
      }
    }
    
    console.log(`\n✅ 导入完成！`);
    console.log(`📊 总导入记录数: ${totalImported}`);
    
  } catch (error) {
    console.error('❌ 导入失败:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

importAllData().catch(error => {
  console.error('❌ 导入失败:', error);
  process.exit(1);
});
