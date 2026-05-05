#!/usr/bin/env node

/**
 * 根据导出的数据自动生成和执行 CockroachDB 初始化脚本
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
  console.error('❌ 错误：请指定导出文件路径');
  process.exit(1);
}

const filePath = path.resolve(importFile);
if (!fs.existsSync(filePath)) {
  console.error(`❌ 文件不存在：${filePath}`);
  process.exit(1);
}

function getColumnType(value) {
  if (value === null || value === undefined) {
    return 'TEXT';
  }
  if (typeof value === 'boolean') {
    return 'BOOLEAN';
  }
  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return value > 2147483647 ? 'BIGINT' : 'INTEGER';
    }
    return 'NUMERIC';
  }
  if (Array.isArray(value)) {
    return 'TEXT[]';
  }
  if (typeof value === 'object') {
    return 'JSONB';
  }
  return 'TEXT';
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

async function initializeAndImport() {
  console.log('🚀 开始初始化 CockroachDB 并导入数据...\n');
  
  const exportData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`📅 导出时间: ${exportData.exportDate}`);
  console.log(`📍 源: ${exportData.supabaseUrl}\n`);
  
  const pool = new Pool({
    connectionString: cockroachDbUrl
  });
  
  try {
    await pool.query('SELECT version()');
    console.log('✅ 已连接到 CockroachDB\n');
    
    let totalImported = 0;
    
    for (const [tableName, data] of Object.entries(exportData.tables)) {
      if (!data || data.length === 0) {
        console.log(`⏭️  表 ${tableName}: 无数据，跳过`);
        continue;
      }
      
      console.log(`\n📝 处理表: ${tableName}`);
      
      // 1. 删除旧表
      try {
        await pool.query(`DROP TABLE IF EXISTS ${tableName} CASCADE`);
        console.log(`  ✅ 删除旧表`);
      } catch (e) {
        // 忽略错误
      }
      
      // 2. 分析字段类型
      const columnTypes = {};
      const firstRow = data[0];
      
      for (const [col, value] of Object.entries(firstRow)) {
        let type = getColumnType(value);
        
        // 特殊处理已知的字段
        if (col === 'id') {
          type = 'UUID PRIMARY KEY DEFAULT gen_random_uuid()';
        } else if (col.endsWith('_at')) {
          type = 'TIMESTAMP WITH TIME ZONE';
        } else if (col === 'user_id' && value && value.length === 36) {
          type = 'UUID';
        } else if (col === 'student_id' || col === 'username') {
          type = 'TEXT';
        }
        
        columnTypes[col] = type;
      }
      
      // 3. 生成 CREATE TABLE 语句
      const columns = Object.entries(columnTypes)
        .map(([col, type]) => `${col} ${type}`)
        .join(',\n  ');
      
      const createTableSQL = `CREATE TABLE ${tableName} (\n  ${columns}\n)`;
      
      // 4. 执行创建表
      try {
        await pool.query(createTableSQL);
        console.log(`  ✅ 表已创建`);
      } catch (error) {
        console.error(`  ❌ 创建表失败:`, error.message.substring(0, 80));
        continue;
      }
      
      // 5. 插入数据
      try {
        const columns = Object.keys(firstRow);
        const valuesList = data.map(row => {
          const values = columns.map(col => sqlValue(row[col]));
          return `(${values.join(', ')})`;
        }).join(', ');
        
        const insertSQL = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${valuesList}`;
        
        await pool.query(insertSQL);
        console.log(`  ✅ 已导入 ${data.length} 行`);
        totalImported += data.length;
      } catch (error) {
        console.error(`  ❌ 导入数据失败:`, error.message.substring(0, 80));
      }
    }
    
    console.log(`\n✅ 初始化和导入完成！`);
    console.log(`📊 总导入记录数: ${totalImported}`);
    
  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initializeAndImport().catch(error => {
  console.error('❌ 失败:', error);
  process.exit(1);
});
