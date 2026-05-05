# 快速启动：CockroachDB 学生管理系统

## ⚡ 5 分钟上手

### 1. 配置环境 (1 分钟)
```bash
# 确保 .env 文件包含以下内容：
VITE_COCKROACHDB_URL=postgresql://xhuni:***@tall-clam-21927.j77.cockroachlabs.cloud:26257/xn1?sslmode=verify-full

# 安装依赖（如果还没有）
npm install
```

### 2. 启动应用 (1 分钟)
```bash
# 开发模式
npm run dev

# 应用将在 http://localhost:5173 启动
```

### 3. 登录 (1 分钟)
- 打开应用 → 登录页面
- 使用数据库中的管理员账户登录
- **默认账户**: 请参见 `admin_users` 表

### 4. 访问学生管理 (1 分钟)
- 登录后，在侧边栏找到 **学生管理** 部分
- 点击 **学生列表** 查看现有学生
- 点击 **新建学生** 创建新学生

### 5. 操作学生数据 (1 分钟)
- **查看列表**: http://localhost:5173/student-list
- **新建学生**: http://localhost:5173/student-form  
- **编辑学生**: 点击列表中学生的编辑按钮
- **删除学生**: 点击列表中学生的删除按钮

---

## 📱 功能演示

### 学生列表页面
显示所有学生信息，包括：
- 📊 **统计信息**: 学生数、媒体数、文档数、保存数
- 🔍 **搜索功能**: 按学号或姓名搜索
- 🏷️ **分类筛选**: 按专业筛选学生
- ✏️ **编辑/删除**: 管理学生信息

**访问**: http://localhost:5173/student-list

### 学生表单页面
创建或编辑学生信息：
- **基本信息**: 学号、姓名、邮箱、电话
- **学术信息**: 学校、学院、专业
- **时间信息**: 入学日期、预期毕业日期
- **媒体**: 照片 URL 和预览

**创建新学生**: http://localhost:5173/student-form  
**编辑学生**: http://localhost:5173/student-form/[学生ID]

---

## 🎯 常见任务

### 创建新学生
```bash
1. 访问 http://localhost:5173/student-form
2. 填写以下必填字段：
   - 学号 (student_id)
   - 姓名 (student_name)
3. 填写其他可选字段
4. 点击 "创建学生" 按钮
5. 成功后自动返回学生列表
```

### 编辑学生信息
```bash
1. 访问 http://localhost:5173/student-list
2. 找到要编辑的学生
3. 点击学生卡片上的 "编辑" 按钮
4. 修改表单字段
5. 点击 "更新" 按钮
6. 成功后自动返回学生列表
```

### 搜索学生
```bash
1. 在学生列表页面
2. 在搜索框中输入：
   - 学号（如：2024001）
   - 或 姓名（如：张三）
3. 列表会实时过滤显示匹配的学生
```

### 按专业筛选
```bash
1. 在学生列表页面
2. 点击 "按专业筛选" 下拉菜单
3. 选择要查看的专业
4. 列表只显示该专业的学生
```

---

## 📊 数据统计

学生列表页面顶部显示 4 项统计指标：

| 指标 | 说明 |
|------|------|
| 学生总数 | `student_profiles` 表的记录数 |
| 媒体文件 | `student_media` 表的记录数 |
| 学生文档 | `student_documents` 表的记录数 |
| 保存表单 | `saved_documents` 表的记录数 |

示例：
- 学生总数: 1
- 媒体文件: 552
- 学生文档: 6
- 保存表单: 14

---

## 🔍 查看数据库内容

### 在浏览器中查看
```typescript
// 在浏览器控制台执行
import { getAllStudentProfiles, getDataStats } from '@/utils/cockroachdbService'

// 获取所有学生
const result = await getAllStudentProfiles()
console.log(result.data)

// 获取统计信息
const stats = await getDataStats()
console.log(stats)
```

### 在 CockroachDB 管理界面查看
1. 访问 CockroachDB 控制台
2. 连接到数据库 `xn1`
3. 运行 SQL 查询：
```sql
SELECT * FROM student_profiles;
SELECT COUNT(*) FROM student_media;
SELECT COUNT(*) FROM student_documents;
```

---

## 🆘 快速排查

### 问题: 页面显示空白或加载失败

**原因**: 可能是数据库连接问题

**解决**:
1. 检查 `.env` 文件中的 CockroachDB URL
2. 在浏览器控制台查看错误信息
3. 确保网络能访问 CockroachDB 服务器
4. 尝试重新启动应用

```bash
npm run dev
```

### 问题: 学生列表为空（但数据库中有数据）

**原因**: 可能是数据加载失败或权限问题

**解决**:
1. 打开浏览器开发者工具 (F12)
2. 查看 Network 选项卡的错误
3. 查看 Console 选项卡的错误消息
4. 检查数据库用户的权限

### 问题: 保存学生时显示错误

**原因**: 可能是必填字段缺失或数据格式错误

**检查**:
- 学号和姓名是否填写？(必填)
- 邮箱格式是否正确？(如有)
- 日期格式是否正确？(YYYY-MM-DD)
- 是否有重复的学号？

### 问题: 编辑时学号字段变灰色（不可编辑）

**这是正确的行为**！学号在编辑时被禁用，防止意外修改。如需更改学号：
1. 删除旧记录（可选）
2. 创建新记录并设置新学号

---

## 🗄️ 数据库信息

### CockroachDB 连接
- **主机**: tall-clam-21927.j77.cockroachlabs.cloud
- **端口**: 26257
- **数据库**: xn1
- **用户**: xhuni
- **SSL**: 启用 (verify-full)

### 已有数据量
- 学生总数: **1**
- 媒体文件: **552**
- 学生文档: **6**
- 保存表单: **14**
- 管理员用户: **2**
- **总记录数**: 577

---

## 📚 更多帮助

### 详细文档
- **完整迁移总结**: [COCKROACHDB_MIGRATION_COMPLETE.md](./COCKROACHDB_MIGRATION_COMPLETE.md)
- **技术参考**: [COCKROACHDB_TECH_REFERENCE.md](./COCKROACHDB_TECH_REFERENCE.md)
- **现有 README**: [README.md](./README.md)

### 代码参考
- **数据服务**: [src/utils/cockroachdbService.ts](./src/utils/cockroachdbService.ts)
- **数据库连接**: [src/lib/cockroachdb.ts](./src/lib/cockroachdb.ts)
- **认证系统**: [src/stores/auth-new.ts](./src/stores/auth-new.ts)
- **学生列表**: [src/views/StudentListView.vue](./src/views/StudentListView.vue)
- **学生表单**: [src/views/StudentFormView.vue](./src/views/StudentFormView.vue)

### 联系支持
如有问题：
1. 查看浏览器控制台的错误信息
2. 检查 CockroachDB 连接状态
3. 参考技术文档了解 API 使用方法

---

## ✅ 验证清单

启动应用后，按以下步骤验证一切正常工作：

- [ ] 应用成功启动 (http://localhost:5173)
- [ ] 可以登录系统
- [ ] 学生列表页面可以加载
- [ ] 统计信息显示正确数字
- [ ] 可以搜索和过滤学生
- [ ] 可以创建新学生（点击新建按钮）
- [ ] 可以编辑现有学生
- [ ] 可以删除学生
- [ ] 表单验证正常工作
- [ ] 成功/错误消息正常显示

如果所有项都能通过，🎉 **恭喜！系统已准备就绪！**

---

## 🚀 下一步

### 推荐的后续步骤

1. **自定义学生表单**
   - 添加更多字段（如国籍、身份证号等）
   - 修改表单布局和样式
   - 添加自定义验证规则

2. **扩展功能**
   - 添加媒体文件上传
   - 实现文档管理
   - 添加数据导出功能（CSV/Excel）

3. **优化性能**
   - 为常用查询添加索引
   - 实现分页加载
   - 缓存频繁请求的数据

4. **集成现有功能**
   - 将其他视图迁移到 CockroachDB
   - 更新所有 Supabase 导入
   - 移除不再使用的 Supabase 代码

5. **部署**
   - 测试生产环境连接
   - 配置 CI/CD 流程
   - 监控数据库性能

---

**准备好了吗？访问 http://localhost:5173/student-list 开始使用！** 🎯

**最后更新**: 2026-02-13  
**版本**: 1.0
