# 迁移管理员账号到 Supabase Auth

## 完整迁移步骤

### 第一步：执行数据库迁移（部分）

在 Supabase SQL Editor 中执行 `migrate_to_supabase_auth.sql` 的**步骤1**：
- 为 admin_users 表添加 user_id 字段
- 创建索引

### 第二步：在 Supabase Dashboard 创建 Auth 用户

1. 打开 Supabase Dashboard
2. 进入 **Authentication > Users**
3. 点击 **"Add User"** 或 **"Invite"**
4. 为每个管理员创建用户：
   ```
   Email: admin@yourdomain.com
   Password: admin8888
   ✓ Auto Confirm User（必须勾选）
   ```
5. **复制创建的用户 ID**（例如：`4f916e3d-25bc-47a0-9b85-af36ce73d9f9`）

### 第三步：关联 Auth 用户到管理员账号

在 SQL Editor 中执行（替换实际的 ID）：

```sql
-- 更新管理员账号1
UPDATE public.admin_users 
SET user_id = '4f916e3d-25bc-47a0-9b85-af36ce73d9f9'
WHERE username = 'admin';

-- 更新管理员账号2（如果有第二个）
UPDATE public.admin_users 
SET user_id = 'e7602780-0f03-47b7-9b25-af36ce73d9f9'
WHERE username = '系统管理员';
```

验证关联：
```sql
SELECT 
    a.username,
    a.user_id,
    u.email
FROM public.admin_users a
LEFT JOIN auth.users u ON a.user_id = u.id;
```

### 第四步：完成数据库迁移

执行 `migrate_to_supabase_auth.sql` 的**步骤4-5**：
- 更新 is_admin() 函数
- 创建基于 Auth 的 RLS 策略

### 第五步：修改前端登录代码

#### 更新登录逻辑

**原来的代码：**
```typescript
// 直接查询 admin_users 表
const { data, error } = await supabase
  .from('admin_users')
  .select('*')
  .eq('username', username)
  .eq('password', password)
  .single()
```

**新的代码：**
```typescript
// 1. 使用 Supabase Auth 登录
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: `${username}@yourdomain.com`, // 或者在表中存储邮箱
  password: password
})

if (authError) {
  console.error('登录失败:', authError.message)
  return
}

// 2. 验证是否为管理员
const { data: adminData, error: adminError } = await supabase
  .from('admin_users')
  .select('*')
  .eq('user_id', authData.user.id)
  .single()

if (adminError || !adminData) {
  await supabase.auth.signOut()
  console.error('不是管理员账号')
  return
}

// 登录成功
console.log('管理员登录成功:', adminData)
```

#### 更新退出登录

```typescript
await supabase.auth.signOut()
```

#### 检查登录状态

```typescript
// 在应用启动时检查
const { data: { session } } = await supabase.auth.getSession()

if (session) {
  // 验证是否为管理员
  const { data: adminData } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', session.user.id)
    .single()
  
  if (adminData) {
    // 已登录的管理员
  }
}
```

### 第六步：测试

1. 刷新页面，清除旧的登录状态
2. 使用 Supabase Auth 邮箱和密码登录
3. 验证可以看到所有数据
4. 测试退出登录功能

## 优势

✅ 符合 Supabase 最佳实践
✅ RLS 策略正常工作
✅ 支持会话管理、密码重置等功能
✅ 更安全的认证机制

## 注意事项

- 密码不再明文存储在 admin_users 表
- 如果需要，可以从 admin_users 表删除 password 字段
- 用户邮箱需要唯一
