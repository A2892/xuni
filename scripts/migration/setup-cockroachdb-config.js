#!/usr/bin/env node

/**
 * CockroachDB 连接配置脚本
 * 更新应用配置文件以使用 CockroachDB 而不是 Supabase
 * 
 * 使用方式：
 *   node setup-cockroachdb-config.js
 *   
 * 环境变量：
 *   COCKROACHDB_URL: CockroachDB 连接字符串
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * 更新 .env 文件
 */
function updateEnvFile(cockroachDbUrl) {
  const envPath = path.join(process.cwd(), '.env');
  
  let content = '';
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf-8');
  }
  
  // 移除旧的 Supabase 配置
  const lines = content.split('\n').filter(line => {
    return !line.startsWith('VITE_SUPABASE_') && 
           !line.startsWith('SUPABASE_');
  });
  
  // 添加 CockroachDB 配置
  lines.push('');
  lines.push('# CockroachDB 配置');
  lines.push(`COCKROACHDB_URL=${cockroachDbUrl}`);
  lines.push('');
  lines.push('# 旧的 Supabase 配置已移除，应用现在使用 CockroachDB');
  
  fs.writeFileSync(envPath, lines.join('\n'));
  console.log(`✅ 已更新 .env 文件`);
}

/**
 * 创建 supabase.ts 兼容文件（如果需要）
 */
function createCockroachDbClient() {
  const filePath = path.join(process.cwd(), 'src', 'lib', 'cockroachdb.ts');
  
  const content = `/**
 * CockroachDB 连接配置
 * 替代原来的 Supabase 客户端
 */

import pg from 'pg';

const { Pool } = pg;

const connectionString = import.meta.env.VITE_COCKROACHDB_URL || process.env.COCKROACHDB_URL || '';

// 创建连接池
let pool: any = null;

export function getPool() {
  if (!pool && connectionString) {
    pool = new Pool({
      connectionString: connectionString,
      max: 20, // 最大连接数
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

// 导出用于迁移的数据库配置
export const cockroachDbConfig = {
  connectionString,
  pool: getPool()
};

// 保持与 Supabase 客户端兼容的导出
export const cockroachDb = getPool();
`;
  
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ 已创建 CockroachDB 客户端文件: src/lib/cockroachdb.ts`);
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 CockroachDB 配置设置工具\n');
  
  // 获取 CockroachDB 连接字符串
  const cockroachDbUrl = await question(
    '请输入 CockroachDB 连接字符串\n' +
    '(例如: postgresql://user:pass@host:26257/dbname?sslmode=verify-full):\n> '
  );
  
  if (!cockroachDbUrl) {
    console.error('❌ 错误：连接字符串不能为空');
    rl.close();
    process.exit(1);
  }
  
  // 验证 URL 格式
  if (!cockroachDbUrl.startsWith('postgresql://')) {
    console.warn('⚠️  警告：连接字符串不是有效的 PostgreSQL 格式');
  }
  
  // 更新配置
  console.log('\n⏳ 正在更新配置...\n');
  
  try {
    updateEnvFile(cockroachDbUrl);
    createCockroachDbClient();
    
    console.log('\n✅ 配置更新完成！\n');
    console.log('📝 后续步骤：');
    console.log('1. 运行数据导出脚本: node scripts/migration/export-supabase-data.js');
    console.log('2. 初始化 CockroachDB 架构: psql <connection_string> -f scripts/migration/0-init-cockroachdb.sql');
    console.log('3. 导入数据: node scripts/migration/import-cockroachdb.js ./scripts/migration/export/supabase-export-*.json');
    console.log('4. 更新应用代码以使用新的数据库连接');
    
  } catch (error) {
    console.error('\n❌ 配置更新失败:', error);
    rl.close();
    process.exit(1);
  }
  
  rl.close();
}

main();
