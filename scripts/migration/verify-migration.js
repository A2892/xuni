#!/usr/bin/env node

/**
 * 数据完整性验证脚本
 * 比较 Supabase 和 CockroachDB 的数据
 * 
 * 使用方式：
 *   node verify-migration.js
 */

import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const cockroachDbUrl = process.env.COCKROACHDB_URL || '';

const { Pool } = pg;

/**
 * 比较表的数据
 */
async function verifyTableData(supabaseClient, cockroachPool, tableName) {
  console.log(`\n🔍 验证表: ${tableName}`);
  
  try {
    // 获取 Supabase 的行数
    const { count: supabaseCount, error: supabaseError } = await supabaseClient
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (supabaseError) {
      console.warn(`  ⚠️  无法从 Supabase 获取计数: ${supabaseError.message}`);
      return null;
    }
    
    // 获取 CockroachDB 的行数
    const cockroachResult = await cockroachPool.query(
      `SELECT COUNT(*) as count FROM ${tableName}`
    );
    const cockroachCount = parseInt(cockroachResult.rows[0]?.count || '0');
    
    console.log(`  Supabase: ${supabaseCount} 行`);
    console.log(`  CockroachDB: ${cockroachCount} 行`);
    
    if (supabaseCount === cockroachCount) {
      console.log(`  ✅ 行数一致`);
      return { table: tableName, status: 'OK', supabaseCount, cockroachCount };
    } else {
      const diff = cockroachCount - supabaseCount;
      const sign = diff > 0 ? '+' : '';
      console.log(`  ⚠️  差异: ${sign}${diff} 行`);
      return { table: tableName, status: 'MISMATCH', supabaseCount, cockroachCount, diff };
    }
  } catch (error) {
    console.error(`  ❌ 验证失败: ${error.message}`);
    return { table: tableName, status: 'ERROR', error: error.message };
  }
}

/**
 * 主验证函数
 */
async function verifyMigration() {
  console.log('🚀 开始数据完整性验证...\n');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ 缺少 Supabase 凭证');
    process.exit(1);
  }
  
  if (!cockroachDbUrl) {
    console.error('❌ 缺少 CockroachDB 连接字符串');
    process.exit(1);
  }
  
  // 创建客户端
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const cockroachPool = new Pool({ connectionString: cockroachDbUrl });
  
  try {
    // 测试连接
    console.log('📍 测试 Supabase 连接...');
    const { data: supTest, error: supError } = await supabase
      .from('student_profiles')
      .select('count', { count: 'exact', head: true });
    
    if (supError && supError.code !== 'PGRST116') {
      console.warn(`⚠️  Supabase: ${supError.message}`);
    } else {
      console.log('✅ Supabase 连接成功');
    }
    
    console.log('📍 测试 CockroachDB 连接...');
    await cockroachPool.query('SELECT 1');
    console.log('✅ CockroachDB 连接成功\n');
    
    // 验证表
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
    
    const results = [];
    
    for (const table of tables) {
      const result = await verifyTableData(supabase, cockroachPool, table);
      if (result) {
        results.push(result);
      }
    }
    
    // 生成验证报告
    console.log('\n' + '='.repeat(60));
    console.log('📋 验证报告');
    console.log('='.repeat(60));
    
    let totalSupabase = 0;
    let totalCockroach = 0;
    let successCount = 0;
    let mismatchCount = 0;
    let errorCount = 0;
    
    results.forEach(result => {
      if (result.status === 'OK') {
        successCount++;
        totalSupabase += result.supabaseCount;
        totalCockroach += result.cockroachCount;
      } else if (result.status === 'MISMATCH') {
        mismatchCount++;
        totalSupabase += result.supabaseCount;
        totalCockroach += result.cockroachCount;
      } else if (result.status === 'ERROR') {
        errorCount++;
      }
    });
    
    console.log(`\n✅ 完全匹配: ${successCount} 个表`);
    console.log(`⚠️  数据不一致: ${mismatchCount} 个表`);
    console.log(`❌ 错误: ${errorCount} 个表`);
    console.log(`\n📊 总体统计:`);
    console.log(`  Supabase 总行数: ${totalSupabase}`);
    console.log(`  CockroachDB 总行数: ${totalCockroach}`);
    
    if (totalSupabase === totalCockroach) {
      console.log(`\n✅ 验证完成：所有数据已完整迁移！`);
    } else {
      const diff = totalCockroach - totalSupabase;
      const sign = diff > 0 ? '+' : '';
      console.log(`\n⚠️  验证完成：存在 ${sign}${diff} 行差异`);
      console.log(`   请检查详细结果。`);
    }
    
    // 详细报告
    console.log('\n' + '='.repeat(60));
    console.log('📝 详细结果');
    console.log('='.repeat(60) + '\n');
    
    results.forEach(result => {
      const icon = result.status === 'OK' ? '✅' : result.status === 'MISMATCH' ? '⚠️ ' : '❌';
      console.log(`${icon} ${result.table}`);
      if (result.status !== 'ERROR') {
        console.log(`   Supabase: ${result.supabaseCount}`);
        console.log(`   CockroachDB: ${result.cockroachCount}`);
      } else {
        console.log(`   错误: ${result.error}`);
      }
    });
    
  } finally {
    await cockroachPool.end();
  }
}

// 运行验证
verifyMigration().catch(error => {
  console.error('❌ 验证过程出错:', error);
  process.exit(1);
});
