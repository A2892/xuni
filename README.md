# VSID - Student ID Generator

一个功能完整的虚拟学生证生成器，使用 Vue 3 + TypeScript + Vite 构建。

## 功能特性

### 📋 核心功能
- ✅ **学生证生成** - 创建专业的学生ID卡，包含照片、条形码和所有学生信息
- ✅ **证件设计** - 多种样式模板、配色方案和装饰选项
- ✅ **课程表管理** - 创建和管理课程时间表，支持表格和列表视图
- ✅ **录取通知书** - 生成正式的大学录取通知书
- ✅ **成绩单** - 完整的学术成绩单，包含GPA计算
- ✅ **文档下载** - 导出为PDF或PNG格式

## 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## Supabase 集成（可选）

1. 创建 Supabase 项目: https://supabase.com
2. 复制 .env.example 为 .env 并填入凭据
3. 在 Supabase SQL 编辑器中创建数据库表（见 src/lib/supabase.ts 注释）

## 技术栈
- Vue 3 + TypeScript
- Pinia (状态管理)
- Vue Router
- Supabase (可选)
- html2canvas + jsPDF (文档生成)
- jsbarcode (条形码)

---
Made with ❤️ by Condev
