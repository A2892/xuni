# Supabase 到 CockroachDB 迁移工具

## CockroachDB 到 Supabase（当前推荐）

如果你正在把现有 CockroachDB 数据迁回 Supabase，请使用下面的新脚本：

```bash
npm run migrate:cockroach-to-supabase
```

脚本会自动执行：

1. 读取 `.env` 中的 `COCKROACHDB_URL` / `VITE_COCKROACHDB_URL` 作为源库
2. 读取 `.env` 中的 `SUPABASE_DB_URL` 作为目标库
3. 自动识别两边公共表，清空目标同名表后导入全量数据
4. 输出逐表行数校验结果

注意：若你的网络无法直连 `db.<project-ref>.supabase.co:5432`（常见于仅返回 IPv6 的环境），请在 `SUPABASE_DB_URL` 中使用 Supabase Transaction Pooler 连接串。

本工具集提供了完整的数据迁移解决方案，将 Supabase PostgreSQL 数据库中的所有数据迁移到 CockroachDB。

## 🚀 快速开始

### 最简单的方法：使用自动化脚本

```bash
# 1. 赋予脚本执行权限
chmod +x scripts/migration/migrate-to-cockroachdb.sh

# 2. 运行自动迁移脚本
./scripts/migration/migrate-to-cockroachdb.sh

# 或者指定 CockroachDB URL
./scripts/migration/migrate-to-cockroachdb.sh "postgresql://user:pass@host:26257/dbname?sslmode=verify-full"
```

### 分步执行

如果需要更细粒度的控制，可以分步执行：

#### 第 1 步：导出 Supabase 数据

```bash
node scripts/migration/export-supabase-data.js
```

导出文件将保存在 `scripts/migration/export/` 目录。

#### 第 2 步：初始化 CockroachDB

```bash
# 使用 psql 连接并执行初始化脚本
psql "YOUR_COCKROACHDB_URL" -f scripts/migration/0-init-cockroachdb.sql
```

#### 第 3 步：导入数据

```bash
export COCKROACHDB_URL="postgresql://user:pass@host:26257/dbname?sslmode=verify-full"
node scripts/migration/import-cockroachdb.js scripts/migration/export/supabase-export-*.json
```

#### 第 4 步：验证迁移

```bash
node scripts/migration/verify-migration.js
```

---

## 📁 工具文件说明

### 脚本文件

| 文件 | 功能 | 用途 |
|------|------|------|
| `0-init-cockroachdb.sql` | CockroachDB 初始化脚本 | 创建所有必需的表和索引 |
| `export-supabase-data.js` | Supabase 数据导出工具 | 从 Supabase 导出所有数据为 JSON |
| `import-cockroachdb.js` | CockroachDB 导入工具 | 将 JSON 数据导入到 CockroachDB |
| `verify-migration.js` | 迁移验证工具 | 对比 Supabase 和 CockroachDB 的数据完整性 |
| `setup-cockroachdb-config.js` | 配置设置工具 | 自动更新应用配置文件 |
| `migrate-to-cockroachdb.sh` | 完整迁移脚本 | 自动执行所有迁移步骤 |

### 文档文件

| 文件 | 功能 |
|------|------|
| `COCKROACHDB_MIGRATION_GUIDE.md` | 详细迁移指南（中文） |
| `MIGRATION_STEPS_EN.md` | 英文迁移步骤（如果存在） |
| `README.md` | 本文件 |

---

## 🔧 环境要求

### 必需

- **Node.js** >= 20.19.0
- **Supabase 凭证**
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`（推荐用于完整导出）

- **CockroachDB 连接字符串**
  - 格式：`postgresql://user:pass@host:26257/dbname?sslmode=verify-full`

### 可选但推荐

- **PostgreSQL 客户端**（`psql`）- 用于直接执行 SQL

---

## 📋 数据库架构

迁移工具支持以下表：

```
✅ student_profiles    (学生档案)
✅ student_media       (学生媒体)
✅ student_documents   (学生文档)
✅ saved_documents     (保存的文档)
✅ admin_users         (管理员用户)
✅ user_roles          (用户角色)
✅ courses             (课程)
✅ universities        (大学)
✅ students            (学生)
```

所有表都包括：
- UUID 主键
- 时间戳字段（created_at, updated_at）
- 适当的索引

---

## ⚙️ 配置

### 方法 1：使用 .env 文件（推荐）

编辑 `.env` 文件：

```env
# Supabase（导出用）
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# CockroachDB（导入用）
COCKROACHDB_URL=postgresql://user:pass@host:26257/dbname?sslmode=verify-full
```

### 方法 2：使用环境变量

```bash
export VITE_SUPABASE_URL=https://xxxxx.supabase.co
export VITE_SUPABASE_ANON_KEY=eyJhbG...
export SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
export COCKROACHDB_URL=postgresql://...

node scripts/migration/export-supabase-data.js
```

### 方法 3：命令行参数

```bash
./scripts/migration/migrate-to-cockroachdb.sh "postgresql://user:pass@host..."
```

---

## 📊 迁移过程详解

### 阶段 1：导出数据

```
Supabase Database
       ↓
   导出每个表
       ↓
   生成 JSON 文件
       ↓
export/supabase-export-YYYY-MM-DD.json
```

**导出文件结构：**
```json
{
  "exportDate": "2024-01-15T10:30:00.000Z",
  "supabaseUrl": "https://xxxxx.supabase.co",
  "tables": {
    "student_profiles": [...],
    "student_media": [...],
    ...
  }
}
```

### 阶段 2：初始化结构

```
创建 CockroachDB 数据库
       ↓
执行 SQL 初始化脚本
       ↓
创建 9 个主表
创建 15+ 个索引
定义约束条件
```

### 阶段 3：导入数据

```
读取 JSON 导出文件
       ↓
按表构建 INSERT 语句
       ↓
分批导入（每批 100 行）
       ↓
处理重复约束
       ↓
完成导入
```

### 阶段 4：验证

```
对比每个表的行数
       ↓
Supabase Count vs CockroachDB Count
       ↓
生成验证报告
```

---

## 🔍 验证和测试

### 查看导出数据摘要

```bash
# 查看导出文件中的表列表
jq '.tables | keys' scripts/migration/export/supabase-export-*.json

# 查看特定表的记录数
jq '.tables.student_profiles | length' scripts/migration/export/supabase-export-*.json
```

### 验证 CockroachDB 数据

```bash
# 连接到 CockroachDB
psql "postgresql://user:pass@host:26257/dbname?sslmode=verify-full"

# 查看所有表
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

# 查看数据统计
SELECT 'student_profiles' as table_name, COUNT(*) as count FROM student_profiles
UNION ALL
SELECT 'student_media', COUNT(*) FROM student_media
...
```

### 运行完整验证

```bash
node scripts/migration/verify-migration.js
```

---

## 🔄 常见操作

### 重新导出数据

```bash
# 导出会覆盖现有文件，创建新的导出文件
node scripts/migration/export-supabase-data.js

# 查看所有导出文件
ls -lh scripts/migration/export/
```

### 部分导入

如果只想导入特定表的数据，可以编辑导入脚本中的 `tableOrder` 数组。

### 备份导入前的状态

```bash
# 导出 CockroachDB 数据
pg_dump "postgresql://user:pass@host:26257/dbname" > backup-before-import.sql

# 使用恢复（如需要）
psql "postgresql://..." < backup-before-import.sql
```

---

## 🆘 故障排除

### 错误：连接失败

**症状：** "Connection refused" 或 "Network error"

**解决方案：**
1. 检查 CockroachDB 连接字符串
2. 验证网络连接
3. 确保防火墙允许端口 26257
4. 检查用户权限

### 错误：数据类型不匹配

**症状：** "Invalid text representation" 或类似错误

**解决方案：**
1. 检查源数据中的特殊字符
2. 验证 UUID 字段格式
3. 检查 JSON 数据的有效性

### 错误：唯一约束违反

**症状：** "Unique constraint violated"

**解决方案：**
1. 检查是否有重复的主键
2. 清除目标表并重新导入
3. 检查数据导出的完整性

### 导览缓慢

**症状：** 导入过程非常缓慢

**解决方案：**
1. 增加批处理大小（修改脚本中的 `batchSize`）
2. 禁用约束检查（导入后再启用）
3. 使用更快的网络连接

---

## 📈 性能优化

### 优化导出

```bash
# 减少导出记录数（用于测试）
# 编辑 export-supabase-data.js 中的 BATCH_SIZE
```

### 优化导入

```bash
# 修改 import-cockroachdb.js 中的批次大小
const batchSize = 100;  // 增加此值以加快导入

# 或在导入前禁用约束（高级用户）
```

---

## 🔐 安全考虑

### 凭证管理

- 📌 **不要**在代码中硬编码凭证
- 📌 **使用** `.env` 文件（添加到 `.gitignore`）
- 📌 **使用** 环境变量（在 CI/CD 中）
- 📌 **定期轮换**凭证

### 备份策略

```bash
# 迁移前备份 Supabase（自动）
# scripts/migration/export-supabase-data.js 会创建备份

# 迁移前备份 CockroachDB（手动）
pg_dump "$COCKROACHDB_URL" > backup-$(date +%Y%m%d).sql

# 迁移后定期备份 CockroachDB
0 2 * * * /path/to/backup-script.sh  # Cron 示例
```

---

## 📚 更多信息

- [详细迁移指南](./COCKROACHDB_MIGRATION_GUIDE.md)
- [CockroachDB 官方文档](https://www.cockroachlabs.com/docs/)
- [PostgreSQL 兼容性](https://www.cockroachlabs.com/docs/stable/postgresql-compatibility)

---

## 📞 支持

遇到问题？

1. 检查 [故障排除](#-故障排除) 部分
2. 查看迁移报告：`MIGRATION_REPORT_*.md`
3. 检查脚本日志输出
4. 参考 [详细迁移指南](./COCKROACHDB_MIGRATION_GUIDE.md)

---

## ✧ 贡献

如果发现 bug 或有改进建议，欢迎提交 issue 或 pull request。

---

**最后更新：** 2024年1月15日  
**版本：** 1.0.0  
**状态：** ✅ 生产就绪
