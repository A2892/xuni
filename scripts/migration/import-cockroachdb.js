#!/usr/bin/env node

/**
 * CockroachDB 数据导入脚本
 * 将导出的 JSON 数据导入到 CockroachDB
 * 
 * 使用方式：
 *   node import-cockroachdb.js <exported-json-file>
 *   
 * 例如：
 *   node import-cockroachdb.js ./export/supabase-export-2024-01-15.json
 * 
 * 环境变量：
 *   COCKROACHDB_URL: CockroachDB 连接字符串
 *   如：postgresql://user:pass@host:26257/dbname?sslmode=verify-full
 */

import * as fs from 'fs';
import * as path from 'path';
import pg from 'pg';
import * as dotenv from 'dotenv';

// 加载 .env 文件
dotenv.config();

const { Pool } = pg;
const cockroachDbUrl = process.env.COCKROACHDB_URL || '';

if (!cockroachDbUrl) {
  console.error('❌ 错误：未配置 COCKROACHDB_URL');
  console.error('请在环境变量中设置 CockroachDB 连接字符串');
  console.error('例如：postgresql://user:pass@host:26257/dbname?sslmode=verify-full');
  process.exit(1);
}

// 获取导入文件
const importFile = process.argv[2];
if (!importFile) {
  console.error('❌ 错误：请指定导入文件路径');
  console.error('用法：node import-cockroachdb.js <exported-json-file>');
  process.exit(1);
}

const filePath = path.resolve(importFile);
if (!fs.existsSync(filePath)) {
  console.error(`❌ 文件不存在：${filePath}`);
  process.exit(1);
}

/**
 * 将值标准化为 SQL 格式
 */
function sqlValue(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (typeof value === 'string') {
    // 正确转义单引号
    return `'${value.replace(/'/g, "''")}'`;
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  if (Array.isArray(value)) {
    // 处理数组（PostgreSQL 特定）
    const items = value.map(v => sqlValue(v)).join(',');
    return `ARRAY[${items}]`;
  }
  if (typeof value === 'object') {
    // 处理 JSON 对象
    return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  }
  return 'NULL';
}

/**
 * 导入表数据
 */
async function importTable(pool, tableName, data) {
  if (!data || data.length === 0) {
    console.log(`  ℹ️  表 ${tableName} 无数据，跳过`);
    return 0;
  }
  
  console.log(`\n📤 导入表: ${tableName} (${data.length} 行)`);
  
  const batchSize = 100; // 每 100 行为一个批次
  let importedCount = 0;
  
  try {
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, Math.min(i + batchSize, data.length));
      const columns = Object.keys(batch[0]);
      
      // 构建 INSERT 语句
      const valuesList = batch.map(row => {
        const values = columns.map(col => sqlValue(row[col]));
        return `(${values.join(', ')})`;
      }).join(', ');
      
      const sql = `
        INSERT INTO ${tableName} (${columns.join(', ')})
        VALUES ${valuesList}
        ON CONFLICT DO NOTHING
      `;
      
      // 执行导入
      const result = await pool.query(sql);
      importedCount += result.rowCount || 0;
      
      const progress = Math.min(i + batchSize, data.length);
      process.stdout.write(`  ⏳ 进度: ${progress}/${data.length} 行 \r`);
    }
    
    console.log(`  ✅ 表 ${tableName} 导入完成，共导入 ${importedCount} 行`);
    return importedCount;
  } catch (error) {
    console.error(`  ❌ 导入表 ${tableName} 失败:`, error.message);
    throw error;
  }
}

/**
 * 主导入函数
 */
async function importAllData() {
  console.log('🚀 开始导入数据到 CockroachDB...');
  console.log(`📍 CockroachDB URL: ${cockroachDbUrl.replace(/:[^@]*@/, ':***@')}`);
  
  // 加载导出数据
  console.log(`\n📂 读取导出文件: ${filePath}`);
  const exportData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`📅 导出时间: ${exportData.exportDate}`);
  console.log(`📍 源 Supabase URL: ${exportData.supabaseUrl}\n`);
  
  // 创建连接池
  const pool = new Pool({
    connectionString: cockroachDbUrl
  });
  
  try {
    // 测试连接
    const testResult = await pool.query('SELECT version()');
    console.log(`✅ 已连接到数据库`);
    console.log(`   ${testResult.rows[0].version.substring(0, 60)}...\n`);
    
    let totalImported = 0;
    
    // 导入每个表（按特定顺序，避免外键约束问题）
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
    
    // 验证导入
    console.log(`\n📋 数据验证:`);
    for (const tableName of tableOrder) {
      const result = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      const count = result.rows[0]?.count || 0;
      console.log(`  - ${tableName}: ${count} 行`);
    }
    
  } catch (error) {
    console.error('❌ 导入失败:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 运行导入
importAllData().catch(error => {
  console.error('❌ 导入失败:', error);
  process.exit(1);
});
