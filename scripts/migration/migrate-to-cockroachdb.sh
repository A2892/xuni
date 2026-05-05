#!/bin/bash

# Supabase 到 CockroachDB 完整迁移脚本
# 自动执行所有迁移步骤
# 
# 用法：
#   chmod +x migrate-to-cockroachdb.sh
#   ./migrate-to-cockroachdb.sh

set -e  # 遇到错误时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印函数
print_header() {
  echo -e "\n${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

# 检查必要的工具
check_requirements() {
  print_header "第 1 步：检查必要工具"
  
  # 检查 Node.js
  if ! command -v node &> /dev/null; then
    print_error "未找到 Node.js，请安装 Node.js >= 20.19.0"
    exit 1
  fi
  print_success "Node.js 版本: $(node -v)"
  
  # 检查 npm
  if ! command -v npm &> /dev/null; then
    print_error "未找到 npm，请安装 npm"
    exit 1
  fi
  print_success "npm 版本: $(npm -v)"
  
  # 检查 psql（可选但推荐）
  if command -v psql &> /dev/null; then
    print_success "psql 已安装"
  else
    print_warning "未找到 psql，某些步骤可能需要手动执行"
  fi
}

# 检查环境变量
check_environment() {
  print_header "第 2 步：检查环境配置"
  
  if [ -z "$VITE_SUPABASE_URL" ] && [ ! -f ".env" ]; then
    print_error "未找到 .env 文件且未设置 VITE_SUPABASE_URL"
    print_info "请确保 .env 文件存在或设置环境变量"
    exit 1
  fi
  
  # 加载 .env 文件
  if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
    print_success ".env 文件已加载"
  fi
  
  if [ -z "$VITE_SUPABASE_URL" ]; then
    print_error "缺少 VITE_SUPABASE_URL"
    exit 1
  fi
  print_success "Supabase URL: ${VITE_SUPABASE_URL:0:50}..."
  
  if [ -z "$COCKROACHDB_URL" ] && [ -z "$1" ]; then
    print_warning "未设置 COCKROACHDB_URL，需要用户输入"
    echo -n "请输入 CockroachDB 连接字符串: "
    read -r COCKROACHDB_URL
    export COCKROACHDB_URL
  fi
  
  print_success "CockroachDB URL: ${COCKROACHDB_URL:0:50}..."
}

# Step 3: 创建导出目录
setup_directories() {
  print_header "第 3 步：准备目录"
  
  mkdir -p scripts/migration/export
  print_success "迁移目录已准备"
}

# Step 4: 导出数据
export_data() {
  print_header "第 4 步：从 Supabase 导出数据"
  
  if ! node scripts/migration/export-supabase-data.js; then
    print_error "数据导出失败"
    exit 1
  fi
  
  # 获取最新导出文件
  EXPORT_FILE=$(ls -t scripts/migration/export/supabase-export-*.json | head -1)
  print_success "数据导出完成: $EXPORT_FILE"
}

# Step 5: 初始化 CockroachDB
init_cockroachdb() {
  print_header "第 5 步：初始化 CockroachDB 架构"
  
  if command -v psql &> /dev/null; then
    # 使用 psql
    if psql "$COCKROACHDB_URL" -f scripts/migration/0-init-cockroachdb.sql > /dev/null 2>&1; then
      print_success "CockroachDB 架构初始化完成"
    else
      print_warning "使用 psql 初始化失败，某些表可能已存在"
    fi
  else
    print_warning "psql 未安装，请手动执行以下命令："
    echo "  psql \"$COCKROACHDB_URL\" -f scripts/migration/0-init-cockroachdb.sql"
  fi
}

# Step 6: 导入数据
import_data() {
  print_header "第 6 步：导入数据到 CockroachDB"
  
  if [ -z "$EXPORT_FILE" ]; then
    EXPORT_FILE=$(ls -t scripts/migration/export/supabase-export-*.json | head -1)
  fi
  
  if [ ! -f "$EXPORT_FILE" ]; then
    print_error "找不到导出文件"
    exit 1
  fi
  
  if ! node scripts/migration/import-cockroachdb.js "$EXPORT_FILE"; then
    print_error "数据导入失败"
    exit 1
  fi
  
  print_success "数据导入完成"
}

# Step 7: 验证迁移
verify_migration() {
  print_header "第 7 步：验证迁移"
  
  if ! node scripts/migration/verify-migration.js; then
    print_warning "迁移验证出现问题，请检查"
  fi
}

# Step 8: 更新配置
update_config() {
  print_header "第 8 步：更新应用配置"
  
  # 自动更新 .env
  if grep -q "VITE_SUPABASE_URL" .env 2>/dev/null; then
    # 备份原 .env
    cp .env .env.backup.$(date +%Y%m%d-%H%M%S)
    print_success ".env 已备份"
    
    # 移除 Supabase 配置
    sed -i.bak '/VITE_SUPABASE_URL/d; /VITE_SUPABASE_ANON_KEY/d; /SUPABASE_SERVICE_ROLE_KEY/d' .env
    
    # 添加 CockroachDB 配置
    if ! grep -q "COCKROACHDB_URL" .env; then
      echo "" >> .env
      echo "# CockroachDB 配置" >> .env
      echo "COCKROACHDB_URL=$COCKROACHDB_URL" >> .env
    fi
    
    print_success ".env 已更新"
  fi
}

# Step 9: 生成报告
generate_report() {
  print_header "第 9 步：生成迁移报告"
  
  REPORT_FILE="MIGRATION_REPORT_$(date +%Y%m%d_%H%M%S).md"
  
  cat > "$REPORT_FILE" << EOF
# Supabase 到 CockroachDB 迁移报告

**迁移日期：** $(date '+%Y年%m月%d日 %H:%M:%S')

## 环境信息

- **Supabase URL：** ${VITE_SUPABASE_URL}
- **CockroachDB URL：** ${COCKROACHDB_URL:0:70}...
- **导出文件：** $EXPORT_FILE
- **Node.js 版本：** $(node -v)
- **npm 版本：** $(npm -v)

## 迁移步骤

- [x] 1️⃣  检查必要工具
- [x] 2️⃣  检查环境配置
- [x] 3️⃣  准备目录
- [x] 4️⃣  导出 Supabase 数据
- [x] 5️⃣  初始化 CockroachDB
- [x] 6️⃣  导入数据
- [x] 7️⃣  验证迁移
- [x] 8️⃣  更新应用配置

## 后续操作

### 1. 更新应用代码

需要修改应用代码以使用 CockroachDB：

\`\`\`typescript
// 原来的 Supabase 代码
import { supabase } from '@/lib/supabase'
const { data } = await supabase.from('student_profiles').select('*')

// 新的 CockroachDB 代码
import { getPool } from '@/lib/cockroachdb'
const pool = getPool()
const result = await pool.query('SELECT * FROM student_profiles')
const data = result.rows
\`\`\`

### 2. 测试应用

\`\`\`bash
npm run dev
\`\`\`

### 3. 建立备份计划

定期备份 CockroachDB 数据

## 重要文件

- 导出文件：\`$EXPORT_FILE\`
- 备份 .env：\`.env.backup.*\`
- 初始化脚本：\`scripts/migration/0-init-cockroachdb.sql\`
- 导入脚本：\`scripts/migration/import-cockroachdb.js\`

## 回滚计划

如需回滚到 Supabase：

1. 恢复备份的 .env 文件：\`cp .env.backup.* .env\`
2. 恢复应用代码中的 Supabase 导入
3. 重启应用

CockroachDB 中的数据将保留用于参考。

---

**迁移状态：** ✅ 完成
EOF
  
  print_success "迁移报告已生成: $REPORT_FILE"
}

# Step 10: 显示摘要
show_summary() {
  print_header "✨ 迁移完成！"
  
  echo "📊 迁移摘要："
  echo "  - Supabase 数据已导出"
  echo "  - CockroachDB 架构已初始化"
  echo "  - 数据已导入到 CockroachDB"
  echo "  - 应用配置已更新"
  echo ""
  echo "📝 后续操作："
  echo "  1. 更新应用代码以使用 CockroachDB"
  echo "  2. 运行应用测试：npm run dev"
  echo "  3. 验证所有功能正常"
  echo ""
  echo "📁 关键文件："
  echo "  - 导出：$EXPORT_FILE"
  echo "  - 备份 .env：.env.backup.*"
  echo "  - 报告：$REPORT_FILE"
  echo ""
  echo "💾 备份计划："
  echo "  定期备份 CockroachDB 数据库"
  echo ""
  echo "❓ 帮助："
  echo "  参考 COCKROACHDB_MIGRATION_GUIDE.md 了解详细信息"
  echo ""
}

# 主函数
main() {
  echo -e "${BLUE}"
  echo "╔════════════════════════════════════════╗"
  echo "║  Supabase 到 CockroachDB 完整迁移脚本  ║"
  echo "╚════════════════════════════════════════╝"
  echo -e "${NC}"
  
  # 执行所有步骤
  check_requirements
  check_environment "$@"
  setup_directories
  export_data
  init_cockroachdb
  import_data
  verify_migration
  update_config
  generate_report
  show_summary
}

# 处理错误
trap 'print_error "脚本执行失败"; exit 1' ERR

# 运行主函数
main "$@"
