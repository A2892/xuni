# 🔑 CockroachDB 认证配置 - 已完成

## 问题原因

应用程序的认证系统之前还在使用旧的 **Supabase** 配置，而数据库已经迁移到 **CockroachDB**。现在已全部修复。

---

## ✅ 已完成的修复

### 1. 认证系统升级
- ✅ **src/stores/auth.ts** - 已更新为使用 CockroachDB 认证
- ✅ **LoginView.vue** - 自动使用新的认证系统
- ✅ **src/router/index.ts** - 路由守卫已链接到 CockroachDB 认证

### 2. 认证流程

```
登录页面 (LoginView.vue)
    ↓
使用 @/stores/auth.ts (CockroachDB)
    ↓
查询 admin_users 表
    ↓
验证用户名和密码
    ↓
生成 Token 并保存
    ↓
跳转到首页
```

---

## 🔐 登录凭证

数据库中已有 **2 个有效的管理员账户**，你可以使用以下任一账户登录：

### 账户 1️⃣
```
用户名: admin
密码: 2362947129
```

### 账户 2️⃣
```
用户名: 23629
密码: 2362947129
```

**推荐使用账户 1**（用户名: admin）

---

## 🚀 现在可以登录了

### 步骤

1. **确保应用在运行**
   ```bash
   npm run dev
   ```

2. **打开登录页面**
   ```
   http://localhost:5173/login
   ```

3. **输入凭证**
   - 用户名: `admin`
   - 密码: `2362947129`
   - ✅ 勾选 "记住我"（可选）

4. **点击登录按钮**

5. **登录成功后会跳转到首页**

---

## 📊 核心代码更改

### auth.ts 现在使用 CockroachDB

```typescript
// ❌ 旧方式（Supabase）
import { supabase } from '@/lib/supabase'
const { data } = await supabase
  .from('admin_users')
  .select('*')
  .eq('username', username)

// ✅ 新方式（CockroachDB）
import { getAdminUser } from '@/utils/cockroachdbService'
const result = await getAdminUser(username)
const user = result.data
```

### 认证检查流程

```typescript
// 查询管理员用户
const result = await getAdminUser(username)
const user = result.data

// 验证密码
if (user.password !== password) {
  return false
}

// 验证状态
if (user.status !== 'active') {
  return false
}

// 生成 Token 并保存
const newToken = btoa(`${username}:${Date.now()}`)
localStorage.setItem('admin_token', newToken)
localStorage.setItem('admin_user', JSON.stringify(user))
```

---

## 🔄 迁移工作流

### 用户登录时

```
1. 用户输入用户名和密码
   ↓
2. LoginView.vue 调用 authStore.login()
   ↓
3. auth.ts 使用 getAdminUser() 查询 CockroachDB
   ↓
4. cockroachdbService.ts 执行数据库查询
   ↓
5. 验证凭证后生成 Token 和会话
   ↓
6. 路由守卫检查认证状态
   ↓
7. 允许访问受保护的页面
```

### 路由守卫（router/index.ts）

```typescript
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)

  // 如果页面需要认证但用户未登录
  if (requiresAuth && !authStore.checkAuth()) {
    next('/login')
  } 
  // 如果用户已登录但访问登录页
  else if (to.path === '/login' && authStore.checkAuth()) {
    next('/')
  } 
  else {
    next()
  }
})
```

---

## 🎯 访问新功能

登录后，你可以访问新的学生管理功能：

| 功能 | URL | 说明 |
|------|-----|------|
| 学生列表 | `/student-list` | 查看、搜索、管理学生 |
| 新建学生 | `/student-form` | 创建新学生信息 |
| 编辑学生 | `/student-form/:id` | 编辑现有学生 |

---

## ✨ 完整的认证流程图

```
┌─────────────────────┐
│   登录页面          │
│ (LoginView.vue)     │
└──────────┬──────────┘
           │ 输入凭证
           ↓
┌─────────────────────────────────┐
│   useAuthStore() 调用 login()   │
│ (stores/auth.ts)                │
└──────────┬──────────────────────┘
           │
           ↓
┌─────────────────────────────────┐
│   getAdminUser()                │
│ (utils/cockroachdbService.ts)   │
└──────────┬──────────────────────┘
           │
           ↓
┌─────────────────────────────────┐
│   CockroachDB                   │
│   SELECT * FROM admin_users     │
└──────────┬──────────────────────┘
           │
           ↓
┌─────────────────────────────────┐
│   验证密码                      │
│   验证用户状态                  │
│   生成 Token                    │
└──────────┬──────────────────────┘
           │
           ↓
┌─────────────────────────────────┐
│   保存到 localStorage           │
│   设置 isAuthenticated = true   │
└──────────┬──────────────────────┘
           │
           ↓
┌─────────────────────────────────┐
│   路由守卫检查                  │
│   (router.beforeEach)           │
└──────────┬──────────────────────┘
           │
           ↓
┌─────────────────────────────────┐
│   允许进入受保护页面            │
│ (/student-list, /student-form)  │
└─────────────────────────────────┘
```

---

## 🆘 故障排查

### 问题 1: 仍然显示"用户名或密码错误"

**原因**: 可能是密码输入错误或大小写问题

**解决**:
- 确保密码完全匹配: `2362947129`
- 检查是否有多余空格
- 尝试复制粘贴密码

### 问题 2: 登录卡住（Loading...）

**原因**: 可能是 CockroachDB 连接问题

**解决**:
1. 打开浏览器控制台 (F12)
2. 查看 Console 选项卡是否有错误
3. 检查 `.env` 中的 CockroachDB URL 是否正确
4. 重启应用: `npm run dev`

### 问题 3: 登录后立即跳出

**原因**: Token 保存失败

**解决**:
1. 清除浏览器 localStorage: 
   ```javascript
   localStorage.clear()
   ```
2. 重新登录
3. 确保浏览器允许 localStorage

### 问题 4: 无法获取认证信息

**原因**: CockroachDB 连接失败

**解决**:
```bash
# 测试数据库连接
node -e "
import pg from 'pg'
const { Client } = pg
const client = new Client({ connectionString: process.env.VITE_COCKROACHDB_URL })
await client.connect()
console.log('✅ 连接成功')
await client.end()
"
```

---

## 📝 完整的认证代码示例

### 登录函数（auth.ts）

```typescript
const login = async (username: string, password: string, remember: boolean = false) => {
  try {
    console.log('🔑 开始登录:', username)

    // 从 CockroachDB 查询管理员用户
    const result = await getAdminUser(username)
    const user = result.data

    // 检查用户是否存在
    if (!user) {
      console.error('❌ 用户不存在')
      return false
    }

    // 检查密码
    if (user.password !== password) {
      console.error('❌ 密码错误')
      return false
    }

    // 检查用户状态
    if (user.status !== 'active') {
      console.error('❌ 用户被禁用')
      return false
    }

    // 生成 Token
    const newToken = btoa(`${username}:${Date.now()}`)
    
    // 保存状态
    currentUser.value = user as AdminUser
    token.value = newToken
    isAuthenticated.value = true

    console.log('✅ 登录成功:', username)

    // 持久化会话
    if (remember) {
      localStorage.setItem('admin_token', newToken)
      localStorage.setItem('admin_user', JSON.stringify(user))
    }

    return true
  } catch (error) {
    console.error('❌ 登录失败:', error)
    return false
  }
}
```

---

## ✅ 验证清单

确保以下都已完成：

- [x] auth.ts 已更新为使用 CockroachDB
- [x] 核数据库中有有效的管理员用户
- [x] getAdminUser() 方法有实现
- [x] LoginView.vue 正确调用认证方法
- [x] 路由守卫已配置
- [x] Token 保存和恢复逻辑已实现

---

## 🎉 系统状态

```
✅ 数据库        CockroachDB (已连接)
✅ 认证系统      已升级到 CockroachDB
✅ 登录页面      已配置为使用新认证
✅ 路由保护      已链接到 CockroachDB
✅ 管理员账户    2 个可用账户
✅ Token 管理    localStorage 会话保存
```

---

## 下一步

1. **立即体验**
   ```bash
   npm run dev
   # 访问 http://localhost:5173/login
   # 输入凭证登录
   ```

2. **访问学生管理**
   - 登录后自动跳转到首页
   - 从菜单进入 "学生列表"
   - 或直接访问 `/student-list`

3. **可选操作**
   - 在 `admin_users` 表中修改密码
   - 创建新的管理员账户
   - 设置分布式认证

---

## 📚 相关文档

- [COCKROACHDB_MIGRATION_COMPLETE.md](./COCKROACHDB_MIGRATION_COMPLETE.md) - 完整迁移指南
- [QUICK_START_COCKROACHDB.md](./QUICK_START_COCKROACHDB.md) - 快速开始
- [src/stores/auth.ts](./src/stores/auth.ts) - 认证代码
- [src/views/LoginView.vue](./src/views/LoginView.vue) - 登录页面

---

**更新时间**: 2026-02-13  
**版本**: 1.0  
**状态**: ✅ 认证系统已完全迁移到 CockroachDB
