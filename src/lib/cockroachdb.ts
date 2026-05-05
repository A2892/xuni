/**
 * CockroachDB 数据库连接和查询服务
 * 替代 Supabase 客户端
 */

import pg from 'pg';

const { Pool } = pg;

let pool: any = null;

/**
 * 获取或创建数据库连接池
 */
export function getPool() {
  if (!pool) {
    const connectionString = import.meta.env.VITE_COCKROACHDB_URL || '';
    if (!connectionString) {
      console.warn('⚠️ VITE_COCKROACHDB_URL 未配置');
      return null;
    }
    
    pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

/**
 * 执行查询
 */
export async function query(sql: string, params?: any[]) {
  const p = getPool();
  if (!p) {
    throw new Error('数据库连接未初始化');
  }
  
  try {
    const result = await p.query(sql, params);
    return {
      data: result.rows,
      error: null,
      count: result.rowCount || 0
    };
  } catch (error: any) {
    console.error('数据库查询错误:', error.message);
    return {
      data: null,
      error: error.message,
      count: 0
    };
  }
}

/**
 * 插入数据
 */
export async function insert(table: string, data: Record<string, any>) {
  const columns = Object.keys(data);
  const values = columns.map((_, i) => `$${i + 1}`).join(', ');
  const placeholders = columns.join(', ');
  
  const sql = `INSERT INTO ${table} (${placeholders}) VALUES (${values}) RETURNING *`;
  const params = columns.map(col => data[col]);
  
  return query(sql, params);
}

/**
 * 更新数据
 */
export async function update(table: string, data: Record<string, any>, where: Record<string, any>) {
  const setClause = Object.keys(data)
    .map((key, i) => `${key} = $${i + 1}`)
    .join(', ');
  
  const whereClause = Object.keys(where)
    .map((key, i) => `${key} = $${i + Object.keys(data).length + 1}`)
    .join(' AND ');
  
  const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause} RETURNING *`;
  const params = [...Object.values(data), ...Object.values(where)];
  
  return query(sql, params);
}

/**
 * 删除数据
 */
export async function deleteRecord(table: string, where: Record<string, any>) {
  const whereClause = Object.keys(where)
    .map((key, i) => `${key} = $${i + 1}`)
    .join(' AND ');
  
  const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
  const params = Object.values(where);
  
  return query(sql, params);
}

/**
 * 从表中查询所有数据
 */
export async function selectAll(table: string, options?: {
  where?: Record<string, any>;
  orderBy?: string;
  limit?: number;
  offset?: number;
}) {
  let sql = `SELECT * FROM ${table}`;
  const params: any[] = [];
  let paramIndex = 1;
  
  if (options?.where) {
    const whereClause = Object.keys(options.where)
      .map(key => {
        const value = options.where![key];
        if (Array.isArray(value)) {
          const placeholders = value.map(() => `$${paramIndex++}`).join(', ');
          params.push(...value);
          return `${key} IN (${placeholders})`;
        } else {
          params.push(value);
          return `${key} = $${paramIndex++}`;
        }
      })
      .join(' AND ');
    sql += ` WHERE ${whereClause}`;
  }
  
  if (options?.orderBy) {
    sql += ` ORDER BY ${options.orderBy}`;
  }
  
  if (options?.limit) {
    sql += ` LIMIT $${paramIndex++}`;
    params.push(options.limit);
  }
  
  if (options?.offset) {
    sql += ` OFFSET $${paramIndex++}`;
    params.push(options.offset);
  }
  
  return query(sql, params);
}

/**
 * 从表中查询单条数据
 */
export async function selectOne(table: string, where: Record<string, any>) {
  const whereClause = Object.keys(where)
    .map((key, i) => `${key} = $${i + 1}`)
    .join(' AND ');
  
  const sql = `SELECT * FROM ${table} WHERE ${whereClause} LIMIT 1`;
  const params = Object.values(where);
  
  const result = await query(sql, params);
  return {
    data: result.data?.[0] || null,
    error: result.error,
  };
}

/**
 * CockroachDB 客户端（兼容 Supabase 风格的 API）
 */
export const cockroachdb = {
  /**
   * from(table).select() - 查询所有
   */
  from: (table: string) => ({
    select: async (columns?: string, options?: any) => {
      return selectAll(table, options);
    },
    insert: (data: any) => ({
      execute: async () => insert(table, data)
    }),
    update: (data: any) => ({
      match: (where: any) => ({
        execute: async () => update(table, data, where)
      }),
      eq: (col: string, value: any) => ({
        execute: async () => update(table, data, { [col]: value })
      })
    }),
    delete: () => ({
      match: (where: any) => ({
        execute: async () => deleteRecord(table, where)
      }),
      eq: (col: string, value: any) => ({
        execute: async () => deleteRecord(table, { [col]: value })
      })
    }),
    // Supabase 风格的链式 API
    eq: (col: string, value: any) => ({
      select: async () => selectOne(table, { [col]: value })
    }),
    single: async () => {
      const result = await selectAll(table, { limit: 1 });
      return {
        data: result.data?.[0] || null,
        error: result.error
      };
    }
  })
};

export default cockroachdb;
