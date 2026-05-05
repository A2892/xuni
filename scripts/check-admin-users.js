#!/usr/bin/env node

/**
 * 检查 CockroachDB 中的管理员用户
 * 用于验证登录凭证
 */

import pg from 'pg'
import dotenv from 'dotenv'

const { Client } = pg
dotenv.config()

const connectionString = process.env.VITE_COCKROACHDB_URL

if (!connectionString) {
  console.error('❌ 错误：VITE_COCKROACHDB_URL 环境变量未设置')
  process.exit(1)
}

async function checkAdminUsers() {
  const client = new Client({ connectionString })

  try {
    await client.connect()
    console.log('✅ 已连接到 CockroachDB')

    // 查询所有管理员用户
    const result = await client.query(`
      SELECT 
        id, 
        username, 
        password, 
        full_name, 
        role, 
        status, 
        created_at 
      FROM admin_users
      ORDER BY created_at DESC
    `)

    console.log('\n📋 数据库中的管理员用户:\n')

    if (result.rows.length === 0) {
      console.log('⚠️  没有找到管理员用户！')
      console.log('\n📝 需要创建一个管理员用户方可登录')
      
      // 显示如何创建用户
      console.log('\n💡 可以运行以下 SQL 创建用户:')
      console.log(`
INSERT INTO admin_users (id, username, password, full_name, role, status)
VALUES (
  gen_random_uuid(),
  'admin',
  'password123',
  'Administrator',
  'admin',
  'active'
);
      `)
    } else {
      result.rows.forEach((user, index) => {
        console.log(`${index + 1}. 用户名: ${user.username}`)
        console.log(`   密码: ${user.password}`)
        console.log(`   全名: ${user.full_name}`)
        console.log(`   角色: ${user.role}`)
        console.log(`   状态: ${user.status}`)
        console.log(`   创建于: ${user.created_at}`)
        console.log()
      })

      console.log('✅ 你可以使用上面的凭证登录应用')
    }

    await client.end()
  } catch (error) {
    console.error('❌ 查询失败:', error.message)
    process.exit(1)
  }
}

checkAdminUsers()
