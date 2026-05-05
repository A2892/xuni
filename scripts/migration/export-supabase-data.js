#!/usr/bin/env node

/**
 * Supabase 数据导出脚本
 * 从 Supabase 导出所有数据为 JSON 格式
 * 
 * 使用方式：
 *   node export-supabase-data.js
 *   
 * 环境变量：
 *   VITE_SUPABASE_URL: Supabase 项目 URL
 *   VITE_SUPABASE_ANON_KEY: Supabase 匿名密钥
 *   SUPABASE_SERVICE_ROLE_KEY: Supabase 服务角色密钥（可选，用于导出所有数据）
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// 加载 .env 文件
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 错误：未配置 Supabase 凭证');
  console.error('请在 .env 文件中设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

// 创建 Supabase 客户端（使用服务角色密钥以获得完整访问权限）
const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

// 定义要导出的表和对应的分块大小
const tables = [
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

const BATCH_SIZE = 1000; // 每批导出的行数

/**
 * 导出单个表的数据
 */
async function exportTable(client, tableName) {
  console.log(`\n📥 开始导出表: ${tableName}`);
  
  try {
    // 首先获取总行数
    const { count } = await client
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (!count) {
      console.log(`   ℹ️  表 ${tableName} 无数据`);
      return [];
    }
    
    console.log(`   📊 表 ${tableName} 包含 ${count} 行数据`);
    
    const allData = [];
    const totalBatches = Math.ceil(count / BATCH_SIZE);
    
    // 分批号导出数据
    for (let i = 0; i < totalBatches; i++) {
      const start = i * BATCH_SIZE;
      const end = start + BATCH_SIZE - 1;
      
      process.stdout.write(`   ⏳ 导出进度: ${i + 1}/${totalBatches} `);
      
      const { data, error } = await client
        .from(tableName)
        .select('*')
        .range(start, end);
      
      if (error) {
        console.error(`\n   ❌ 导出失败: ${error.message}`);
        throw error;
      }
      
      allData.push(...(data || []));
      process.stdout.write('✓\n');
    }
    
    console.log(`   ✅ 表 ${tableName} 导出完成，共 ${allData.length} 行`);
    return allData;
  } catch (error) {
    console.error(`   ❌ 导出表 ${tableName} 失败:`, error.message);
    return [];
  }
}

/**
 * 主导出函数
 */
async function exportAllData() {
  console.log('🚀 开始从 Supabase 导出数据...');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 使用${supabaseServiceKey ? '服务角色' : '匿名'}密钥\n`);
  
  const exportData = {
    exportDate: new Date().toISOString(),
    supabaseUrl: supabaseUrl,
    tables: {}
  };
  
  let totalRecords = 0;
  
  // 导出每个表
  for (const tableName of tables) {
    try {
      const data = await exportTable(supabase, tableName);
      exportData.tables[tableName] = data;
      totalRecords += data.length;
    } catch (error) {
      console.error(`⚠️  跳过表 ${tableName}: ${error.message}`);
      exportData.tables[tableName] = [];
    }
  }
  
  // 保存为 JSON 文件
  const exportDir = path.join(process.cwd(), 'scripts', 'migration', 'export');
  const fileName = `supabase-export-${new Date().toISOString().split('T')[0]}.json`;
  const filePath = path.join(exportDir, fileName);
  
  // 创建导出目录（如果不存在）
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }
  
  // 写入文件
  fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
  
  console.log(`\n✅ 导出完成！`);
  console.log(`📁 导出文件: ${filePath}`);
  console.log(`📊 总记录数: ${totalRecords}`);
  console.log(`\n导出摘要:`);
  Object.entries(exportData.tables).forEach(([tableName, data]) => {
    console.log(`  - ${tableName}: ${data.length} 行`);
  });
  
  return filePath;
}

// 运行导出
exportAllData().catch(error => {
  console.error('❌ 导出失败:', error);
  process.exit(1);
});
