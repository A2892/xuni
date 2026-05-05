# 🚀 立即开始迁移 - 操作指南

**准备时间：** 2 分钟  
**执行时间：** 5-15 分钟  
**总耗时：** 7-20 分钟

---

## ⚡ 30 秒快速开始

### 最简单的方式：一条命令

```bash
cd /Applications/存储空间/21/vsid-student-generator && ./scripts/migration/migrate-to-cockroachdb.sh
```

**完成！** 脚本会自动：
1. 导出 Supabase 数据
2. 初始化 CockroachDB
3. 导入所有数据
4. 验证迁移结果
5. 更新配置
6. 生成报告

---

## 📋 前置要求（2 分钟检查）

### ✅ 检查清单

```bash
# 1. 检查 Node.js (需要 >= 20.19.0)
node -v

# 2. 检查 .env 文件存在
cat .env | head -5

# 3. 检查 Supabase 配置
grep SUPABASE .env

# 4. 设置 CockroachDB 环境变量
export COCKROACHDB_URL="postgresql://xhuni:vv5GAB3d5lhkQ7DgUUeaFQ@tall-clam-21927.j77.cockroachlabs.cloud:26257/xn1?sslmode=verify-full"
```

---

## 🎯 选择迁移方式

### 方式 1️⃣：完全自动（推荐）⭐

```bash
./scripts/migration/migrate-to-cockroachdb.sh
```

**优点：**
- ✅ 最快（5-15 分钟）
- ✅ 自动处理所有步骤
- ✅ 无需额外配置
- ✅ 生成完整报告

**缺点：**
- ❌ 无法暂停和调试

---

### 方式 2️⃣：分步手动

适用于需要更多控制的场景。

#### 第 1 步：导出 Supabase 数据（1-3 分钟）

```bash
node scripts/migration/export-supabase-data.js
```

**预期输出：**
```
🚀 开始从 Supabase 导出数据...
📥 开始导出表: student_profiles
✅ 表 student_profiles 导出完成，共 150 行
...
✅ 导出完成！
📁 导出文件: scripts/migration/export/supabase-export-2024-01-15.json
```

#### 第 2 步：初始化 CockroachDB（1 分钟）

```bash
# 方式 A：使用 psql（推荐）
psql "postgresql://xhuni:vv5GAB3d5lhkQ7DgUUeaFQ@tall-clam-21927.j77.cockroachlabs.cloud:26257/xn1?sslmode=verify-full" \
  -f scripts/migration/0-init-cockroachdb.sql

# 方式 B：或在 CockroachDB Console 中直接执行 SQL
# 1. 打开 CockroachDB Dashboard
# 2. 进入 SQL 编辑器
# 3. 复制 scripts/migration/0-init-cockroachdb.sql 的内容
# 4. 执行
```

#### 第 3 步：导入数据（2-5 分钟）

```bash
export COCKROACHDB_URL="postgresql://xhuni:vv5GAB3d5lhkQ7DgUUeaFQ@tall-clam-21927.j77.cockroachlabs.cloud:26257/xn1?sslmode=verify-full"
node scripts/migration/import-cockroachdb.js scripts/migration/export/supabase-export-*.json
```

**预期输出：**
```
📤 导入表: student_profiles (150 行)
✅ 表 student_profiles 导入完成，共导入 150 行
...
✅ 导入完成！
```

#### 第 4 步：验证迁移（1 分钟）

```bash
node scripts/migration/verify-migration.js
```

**预期输出：**
```
✅ student_profiles: 150 行
✅ student_media: 2500 行
...
✅ 验证完成：所有数据已完整迁移！
```

---

## ✅ 迁移完成后

### 1. 查看迁移报告

```bash
# 自动化脚本用户：
cat MIGRATION_REPORT_*.md

# 手动执行用户：
cat scripts/migration/export/supabase-export-*.json | head -50
```

### 2. 验证数据

```bash
# 连接 CockroachDB 检查
psql "postgresql://xhuni:vv5GAB3d5lhkQ7DgUUeaFQ@tall-clam-21927.j77.cockroachlabs.cloud:26257/xn1?sslmode=verify-full"

# 在 psql 中执行：
SELECT COUNT(*) FROM student_profiles;
SELECT COUNT(*) FROM student_media;
```

### 3. 更新应用配置

如果未自动更新，手动编辑 `.env`：

```env
# 移除（或注释掉）:
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...

# 添加:
COCKROACHDB_URL=postgresql://xhuni:vv5GAB3d5lhkQ7DgUUeaFQ@tall-clam-21927.j77.cockroachlabs.cloud:26257/xn1?sslmode=verify-full
```

### 4. 更新应用代码

查看 `COCKROACHDB_MIGRATION_GUIDE.md` 的"第五步：配置应用连接"部分

---

## 🆘 问题排查

### 连接失败

```bash
# 测试 Supabase 连接
echo $VITE_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# 测试 CockroachDB 连接
psql "postgresql://xhuni:vv5GAB3d5lhkQ7DgUUeaFQ@tall-clam-21927.j77.cockroachlabs.cloud:26257/xn1?sslmode=verify-full" \
  -c "SELECT version();"
```

### 网络问题

```bash
# 检查网络连接
ping tall-clam-21927.j77.cockroachlabs.cloud
curl -I https://gfeekvcpbepotwulfbrg.supabase.co/health
```

### 权限问题

```bash
# 检查 CockroachDB 用户权限
psql "$COCKROACHDB_URL" -c "SELECT user_name, create_role_permission FROM system.users;"
```

---

## 📚 查看详细文档

| 现在想... | 查看... |
|----------|--------|
| 5分钟快速参考 | [MIGRATION_QUICK_START.md](./MIGRATION_QUICK_START.md) |
| 完整详细步骤 | [COCKROACHDB_MIGRATION_GUIDE.md](./COCKROACHDB_MIGRATION_GUIDE.md) |
| 资源和检查表 | [MIGRATION_RESOURCES.md](./MIGRATION_RESOURCES.md) |
| 这个总结 | [MIGRATION_COMPLETE_SUMMARY.md](./MIGRATION_COMPLETE_SUMMARY.md) |
| 脚本使用说明 | [scripts/migration/README.md](./scripts/migration/README.md) |

---

## 🎯 推荐流程

```
第 1 天：迁移准备
├─ ✅ 阅读本文件（5 分钟）
├─ ✅ 运行检查清单（2 分钟）
└─ ✅ 准备好环境

第 2 天：执行迁移
├─ ✅ 运行自动迁移脚本（15 分钟）
├─ ✅ 查看迁移报告（5 分钟）
└─ ✅ 验证数据（5 分钟）

第 3 天：应用更新
├─ ✅ 更新应用代码（30 分钟）
├─ ✅ 本地测试（30 分钟）
└─ ✅ 部署上线（30 分钟）
```

---

## 💡 提示和最佳实践

### 🟢 做这些

- ✅ 在开发环境先测试迁移
- ✅ 保留导出的 JSON 文件作为备份
- ✅ 记录迁移开始和结束时间
- ✅ 在迁移前备份 Supabase 数据
- ✅ 测试应用的所有关键功能

### 🔴 避免这些

- ❌ 在生产环境直接迁移（先在开发环境测试）
- ❌ 删除导出的 JSON 文件（保留作为备份）
- ❌ 同时运行多个迁移脚本（可能导致冲突）
- ❌ 在迁移中途中断（等待脚本完成）
- ❌ 忘记更新应用配置（导致连接错误）

---

## 📞 需要帮助？

### 问题排查步骤

1. **看输出信息** → 检查脚本输出中的错误提示
2. **查看日志** → 脚本会输出详细日志
3. **查日期文档** → [故障排除指南](./COCKROACHDB_MIGRATION_GUIDE.md#-故障排除)
4. **查资源列表** → [问题速解表](./MIGRATION_RESOURCES.md#-故障排除快速指南)

---

## ⏱️ 时间预估

| 步骤 | 自动脚本 | 手动执行 |
|------|----------|---------|
| 检查环境 | 1 分钟 | 2 分钟 |
| 导出数据 | 自动 | 1-3 分钟 |
| 初始化DB | 自动 | 1 分钟 |
| 导入数据 | 自动 | 2-5 分钟 |
| 验证迁移 | 自动 | 1 分钟 |
| 更新配置 | 自动 | 1 分钟 |
| **总计** | **5-15 分钟** | **8-15 分钟** |

---

## 🎉 成功迹象

迁移成功时，你应该看到：

- ✅ 脚本无错误完成
- ✅ 生成的报告显示所有表都已导入
- ✅ 数据行数与 Supabase 匹配
- ✅ 应用可以连接到 CockroachDB
- ✅ 所有功能正常工作

---

## 🚀 现在就开始！

### 准备好了吗？执行这一条命令：

```bash
cd /Applications/存储空间/21/vsid-student-generator && ./scripts/migration/migrate-to-cockroachdb.sh
```

**就这么简单！** ☕ 坐下来享受咖啡，脚本会帮你完成所有工作。

---

**记住：** 
- 📌 迁移是**安全的** - 原始数据保留在 Supabase
- 📌 可以**重复运行** - 支持多次迁移
- 📌 有**完整备份** - JSON 导出文件永久保存
- 📌 **可以回滚** - 保留原始配置备份

---

**版本：** 1.0.0 | **日期：** 2024年1月15日

**祝迁移顺利！🎊**
