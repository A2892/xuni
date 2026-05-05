# 🚀 Supabase → CockroachDB 快速迁移卡

## 📋 5 分钟快速开始

### 前置条件
```bash
# ✅ 检查 Node.js
node -v  # 需要 >= 20.19.0

# ✅ 确保 .env 文件存在
cat .env | grep SUPABASE_URL
cat .env | grep COCKROACHDB_URL
```

### 自动迁移（推荐）
```bash
# 🚀 一键执行所有步骤
cd /path/to/vsid-student-generator
./scripts/migration/migrate-to-cockroachdb.sh
```

### 手动分步迁移

#### 1️⃣ 导出 Supabase 数据
```bash
node scripts/migration/export-supabase-data.js
# ✅ 输出: scripts/migration/export/supabase-export-YYYY-MM-DD.json
```

#### 2️⃣ 初始化 CockroachDB
```bash
psql "postgresql://xhuni:vv5GAB3d5lhkQ7DgUUeaFQ@tall-clam-21927.j77.cockroachlabs.cloud:26257/xn1?sslmode=verify-full" \
  -f scripts/migration/0-init-cockroachdb.sql
```

#### 3️⃣ 导入数据
```bash
export COCKROACHDB_URL="postgresql://xhuni:vv5GAB3d5lhkQ7DgUUeaFQ@tall-clam-21927.j77.cockroachlabs.cloud:26257/xn1?sslmode=verify-full"
node scripts/migration/import-cockroachdb.js scripts/migration/export/supabase-export-*.json
```

#### 4️⃣ 验证迁移
```bash
node scripts/migration/verify-migration.js
```

---

## 🔧 常用命令参考

| 任务 | 命令 |
|------|------|
| **导出数据** | `node scripts/migration/export-supabase-data.js` |
| **初始化DB** | `psql "$COCKROACHDB_URL" -f scripts/migration/0-init-cockroachdb.sql` |
| **导入数据** | `node scripts/migration/import-cockroachdb.js ./export/supabase-export-*.json` |
| **验证迁移** | `node scripts/migration/verify-migration.js` |
| **更新配置** | `node scripts/migration/setup-cockroachdb-config.js` |
| **查看帮助** | `cat scripts/migration/README.md` |

---

## 🗄️ 数据库连接字符串

### Supabase（旧）
```env
VITE_SUPABASE_URL=https://gfeekvcpbepotwulfbrg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### CockroachDB（新）
```env
COCKROACHDB_URL=postgresql://xhuni:vv5GAB3d5lhkQ7DgUUeaFQ@tall-clam-21927.j77.cockroachlabs.cloud:26257/xn1?sslmode=verify-full
```

---

## 📊 迁移涉及的表

```
✅ student_profiles      (学生档案)
✅ student_media         (学生媒体)
✅ student_documents     (学生文档)
✅ saved_documents       (保存的文档)
✅ admin_users           (管理员用户)
✅ user_roles            (用户角色)
✅ courses               (课程)
✅ universities          (大学)
✅ students              (学生)
```

---

## 🆘 常见问题速解

| 问题 | 解决方案 |
|------|----------|
| **连接失败** | 检查 CockroachDB URL 和网络连接 |
| **导出缓慢** | 检查 Supabase 网络连接 |
| **导入超时** | 增加批处理大小或检查网络 |
| **重复键错误** | 清空表并重新导入 |
| **找不到表** | 确保 SQL 初始化脚本已执行 |

---

## 📁 关键文件位置

```
scripts/migration/
├── 0-init-cockroachdb.sql         ← CockroachDB 架构定义
├── export-supabase-data.js        ← 导出工具
├── import-cockroachdb.js          ← 导入工具
├── verify-migration.js            ← 验证工具
├── setup-cockroachdb-config.js    ← 配置工具
├── migrate-to-cockroachdb.sh      ← 一键迁移脚本
├── README.md                      ← 完整说明
└── export/                        ← 导出数据目录
    ├── supabase-export-2024-01-15.json
    └── supabase-export-2024-01-16.json
```

---

## ✅ 迁移检查列表

- [ ] 检查 Node.js 版本 >= 20.19.0
- [ ] 配置 .env 文件（Supabase + CockroachDB）
- [ ] 运行自动迁移脚本或手动分步执行
- [ ] 验证数据完整性
- [ ] 更新应用代码（从 Supabase 改为 CockroachDB）
- [ ] 测试应用功能
- [ ] 建立备份计划
- [ ] 记录迁移时间和统计

---

## 📞 获取帮助

1. **查看详细指南** → `COCKROACHDB_MIGRATION_GUIDE.md`
2. **查看脚本说明** → `scripts/migration/README.md`
3. **检查迁移报告** → `MIGRATION_REPORT_*.md`

---

**版本：** 1.0.0 | **日期：** 2024年1月15日 | **状态：** ✅ 就绪
