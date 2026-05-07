# 部署指南

## 当前状态

你的项目是 **前端 + 后端** 的分离架构：
- **前端**：Vue 3 + Vite（已在 Netlify 部署）
- **后端**：Node.js + Express（需要单独部署）

## 问题原因

Netlify Functions 与 server.js 的 `__filename` 声明产生冲突，导致后端无法启动。

## 解决方案（二选一）

### 方案 A：用 Vercel 部署后端（推荐，最简单）

1. **前端保持 Netlify**（已配置好）
2. **后端部署到 Vercel**：
   - 在 Vercel 官网连接你的 GitHub 仓库
   - Vercel 会自动检测 vercel.json 配置
   - 选择部署到不同的 Vercel project（名叫 `xuni-api` 之类的）
   - 配置环境变量（和 Netlify 一样的列表）
   - 部署完成后，你会获得一个 API URL，例如 `https://xuni-api.vercel.app`

3. **更新前端 API 地址**：
   ```bash
   # 修改 src/utils/cockroachdbService.ts
   const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:3001' : 'https://xuni-api.vercel.app'
   ```

4. **重新部署前端**：
   ```bash
   git push  # Netlify 会自动构建
   ```

### 方案 B：用 Render 部署后端

类似步骤，但用 [render.com](https://render.com) 而不是 Vercel。

### 方案 C：用 Railway 部署后端

类似步骤，但用 [railway.app](https://railway.app)。

## 快速步骤（用 Vercel）

```bash
# 1. 本地测试后端能否启动
npm run dev:server

# 2. 提交所有更改
git add .
git commit -m "chore: 准备后端独立部署"
git push

# 3. 去 Vercel 创建新 project → 连接 GitHub → 选择此仓库
# 4. 配置环境变量（复制 .env 内容）
# 5. 部署

# 6. 获取 Vercel 分配的 API URL（例如 xxx.vercel.app）

# 7. 更新本地 src/utils/cockroachdbService.ts
#    改 API_BASE_URL 为线上的 Vercel URL

# 8. git push，Netlify 自动重新部署前端

# 9. 打开 https://xuni0.netlify.app/login，输入账号 23629，密码 2362947129 登录
```

## 当前 Netlify 配置说明

- netlify.toml 已配置为只构建前端（`npm run build:vercel`）
- netlify/functions/api.js 是一个 stub，会返回错误提示
- 这是临时的，等你配置了真实的后端 URL 就没问题了

## 需要帮助？

1. 去 Vercel 创建项目时遇到问题 → 告诉我截图
2. 不知道 API URL → 在 Vercel project settings 里查看 Domain
3. 部署后还是登录不了 → 我可以帮你调试接口
