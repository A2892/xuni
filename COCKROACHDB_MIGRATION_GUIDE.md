# Supabase 到 CockroachDB 数据迁移指南

## 📋 概述

本指南将指导您将 **Supabase PostgreSQL** 数据库中的所有数据迁移到 **CockroachDB**。

### 系统要求

- Node.js >= 20.19.0
- PostgreSQL 客户端工具（`psql`）
- 网络访问 Supabase 和 CockroachDB

### 迁移架构

```
Supabase Database ─→ Export as JSON ─→ Create CockroachDB Schema ─→ Import Data ─→ Update App Config
```

---

## 🎯 第一步：准备环境

### 1.1 检查现有环境变量

确保您的 `.env` 文件包含 Supabase 凭证：

```bash
cat .env | grep SUPABASE
```

应该看到：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`（可选，推荐用于完整导出）

### 1.2 安装依赖

```bash
npm install --save-dev pg dotenv
npm install pg  # 如果还未安装
```

### 1.3 准备迁移脚本

迁移脚本位于 `scripts/migration/` 目录：

```
scripts/migration/
├── 0-init-cockroachdb.sql       # 创建 CockroachDB 数据库架构
├── export-supabase-data.js      # 从 Supabase 导出数据
├── import-cockroachdb.js        # 导入数据到 CockroachDB
├── setup-cockroachdb-config.js  # 配置更新脚本
├── migration-complete.js        # 完整性检查
└── rollback-cockroachdb.sql     # 回滚脚本（可选）
```

---

## 📥 第二步：从 Supabase 导出数据

### 2.1 运行导出脚本

```bash
node scripts/migration/export-supabase-data.js
```

**预期输出：**
```
🚀 开始从 Supabase 导出数据...
📍 Supabase URL: https://xxxxx.supabase.co
🔑 使用服务角色密钥

📥 开始导出表: student_profiles
   📊 表 student_profiles 包含 150 行数据
   ⏳ 导出进度: 1/1 ✓
   ✅ 表 student_profiles 导出完成，共 150 行

...（其他表）...

✅ 导出完成！
📁 导出文件: scripts/migration/export/supabase-export-2024-01-15.json
📊 总记录数: 5000
```

### 2.2 验证导出数据

```bash
# 检查导出文件
ls -lh scripts/migration/export/

# 查看导出摘要
head -20 scripts/migration/export/supabase-export-*.json
```

---

## 🗄️ 第三步：初始化 CockroachDB 架构

### 3.1 连接到 CockroachDB

```bash
# 使用 psql 连接到 CockroachDB
psql "postgresql://xhuni:vv5GAB3d5lhkQ7DgUUeaFQ@tall-clam-21927.j77.cockroachlabs.cloud:26257/xn1?sslmode=verify-full"
```

### 3.2 创建数据库（如果需要）

```sql
-- 在 CockroachDB 中创建数据库（如果未创建）
CREATE DATABASE IF NOT EXISTS xn1;
USE xn1;
```

### 3.3 执行初始化脚本

```bash
# 方法 1：使用 psql
psql "postgresql://xhuni:vv5GAB3d5lhkQ7DgUUeaFQ@tall-clam-21927.j77.cockroachlabs.cloud:26257/xn1?sslmode=verify-full" \
  -f scripts/migration/0-init-cockroachdb.sql

# 方法 2：在 psql 中直接输入
\i scripts/migration/0-init-cockroachdb.sql
```

**预期输出：**
```
CREATE TABLE
CREATE INDEX
...
✅ 所有表创建完成
```

### 3.4 验证架构

```bash
# 连接到 CockroachDB 并检查表
psql "postgresql://xhuni:vv5GAB3d5lhkQ7DgUUeaFQ@tall-clam-21927.j77.cockroachlabs.cloud:26257/xn1?sslmode=verify-full"

# 在 psql 中执行
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

---

## 📤 第四步：导入数据到 CockroachDB

### 4.1 运行导入脚本

```bash
# 设置 CockroachDB 连接字符串环境变量
export COCKROACHDB_URL="postgresql://xhuni:vv5GAB3d5lhkQ7DgUUeaFQ@tall-clam-21927.j77.cockroachlabs.cloud:26257/xn1?sslmode=verify-full"

# 运行导入脚本
node scripts/migration/import-cockroachdb.js scripts/migration/export/supabase-export-2024-01-15.json
```

**预期输出：**
```
🚀 开始导入数据到 CockroachDB...
📍 CockroachDB URL: postgresql://xhuni:***@tall-clam-21927.j77.cockroachlabs.cloud:26257/xn1?sslmode=verify-full
✅ 已连接到数据库
   PostgreSQL 12.0 on x86_64-pc-linux-gnu...

📤 导入表: student_profiles (150 行)
  ⏳ 进度: 150/150 行
  ✅ 表 student_profiles 导入完成，共导入 150 行

...（其他表）...

✅ 导入完成！
📊 总导入记录数: 5000

📋 数据验证:
  - student_profiles: 150 行
  - student_media: 2500 行
  - student_documents: 1200 行
  ...
```

### 4.2 验证导入完整性

```bash
# 验证记录计数
psql "postgresql://xhuni:vv5GAB3d5lhkQ7DgUUeaFQ@tall-clam-21927.j77.cockroachlabs.cloud:26257/xn1?sslmode=verify-full" \
  -c "SELECT table_name, COUNT(*) as row_count FROM (
    SELECT 'student_profiles' as table_name FROM student_profiles
    UNION ALL
    SELECT 'student_media' FROM student_media
    UNION ALL
    SELECT 'student_documents' FROM student_documents
  ) t GROUP BY table_name ORDER BY table_name;"
```

---

## ⚙️ 第五步：配置应用连接

### 5.1 更新 .env 文件

```bash
# 方法 1：自动更新（推荐）
node scripts/migration/setup-cockroachdb-config.js

# 方法 2：手动编辑
# 编辑 .env 文件，增加：
COCKROACHDB_URL=postgresql://xhuni:vv5GAB3d5lhkQ7DgUUeaFQ@tall-clam-21927.j77.cockroachlabs.cloud:26257/xn1?sslmode=verify-full

# 移除或注释掉旧的 Supabase 配置：
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...
```

### 5.2 更新应用代码

需要修改应用代码以使用 CockroachDB 而不是 Supabase：

#### 更新 `src/lib/database.ts` 或类似文件

**原来的 Supabase 方式：**
```typescript
import { supabase } from '@/lib/supabase'

// 查询数据
const { data, error } = await supabase
  .from('student_profiles')
  .select('*')
  .eq('student_id', 'S001')
```

**新的 CockroachDB 方式：**
```typescript
import { getPool } from '@/lib/cockroachdb'

// 查询数据
const pool = getPool()
const result = await pool.query(
  'SELECT * FROM student_profiles WHERE student_id = $1',
  ['S001']
)
const data = result.rows
```

### 5.3 关键应用文件的更新

更新以下文件以使用 CockroachDB 连接：

- `src/stores/auth.ts` - 管理员登录
- `src/views/AdminManagementView.vue` - 管理员界面
- 所有数据库查询相关的文件

---

## ✅ 第六步：验证迁移

### 6.1 运行完整性检查

```bash
node scripts/migration/migration-complete.js
```

### 6.2 测试应用连接

```bash
# 启动应用
npm run dev

# 在浏览器中测试：
# - 登录功能
# - 查看学生档案
# - 查看媒体文件
# - 查看文档
```

### 6.3 性能基准测试

```bash
# 记录查询时间以比较性能
psql "postgresql://xhuni:vv5GAB3d5lhkQ7DgUUeaFQ@tall-clam-21927.j77.cockroachlabs.cloud:26257/xn1?sslmode=verify-full" \
  --command="EXPLAIN ANALYZE SELECT * FROM student_profiles LIMIT 10;"
```

---

## 🔄 回滚计划

如果需要回到 Supabase，请执行：

```bash
# 1. 恢复 .env 文件中的 Supabase 配置
# 2. 恢复应用代码中的 Supabase 导入
# 3. 重新启动应用

# 注意：CockroachDB 中的数据将保留，不会自动删除
```

---

## 📊 迁移后期维护

### 备份 CockroachDB 数据

```bash
# 定期导出备份
node scripts/migration/export-cockroachdb.js > backup-$(date +%Y%m%d).json
```

### 监控性能

监控 CockroachDB 的性能指标：
- 查询响应时间
- 连接数
- CPU 和内存使用

### 更新索引

根据查询模式添加额外的索引以优化性能。

---

## 🆘 故障排除

### 导出失败

**问题：** "Failed to fetch data from Supabase"

**解决方案：**
- 检查 `SUPABASE_SERVICE_ROLE_KEY` 是否正确
- 验证网络连接
- 检查 Supabase 表是否存在

### 导入失败

**问题：** "Connection refused" 或 "SSL error"

**解决方案：**
- 验证 CockroachDB 连接字符串
- 检查防火墙设置
- 确保 SSL/TLS 证书有效
- 验证用户权限

### 数据不一致

**问题：** 导入的数据行数与导出数据不匹配

**解决方案：**
- 检查重复的主键
- 验证数据类型转换
- 检查约束条件
- 查看 CockroachDB 日志

---

## 📚 相关资源

- [CockroachDB 文档](https://www.cockroachlabs.com/docs/)
- [PostgreSQL 兼容性](https://www.cockroachlabs.com/docs/stable/postgresql-compatibility)
- [性能优化](https://www.cockroachlabs.com/docs/stable/performance-best-practices)

---

## ✨ 迁移完成检查清单

- [ ] 准备环境和依赖
- [ ] 从 Supabase 导出所有数据
- [ ] 初始化 CockroachDB 架构
- [ ] 导入所有数据到 CockroachDB
- [ ] 验证数据完整性
- [ ] 更新应用配置文件
- [ ] 更新应用代码（数据库调用）
- [ ] 测试应用功能
- [ ] 建立备份计划
- [ ] 监控系统性能
- [ ] 文档更新完成

---

**迁移日期：** 2024年1月15日  
**迁移状态：** ✅ 完成
