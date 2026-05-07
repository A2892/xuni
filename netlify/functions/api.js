import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';

const app = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 如果有本地后端，直接返回错误提示
// 实际上应该用独立部署的后端（Vercel、Render 等）
app.all('*', (req, res) => {
  res.status(503).json({
    error: 'Backend service not available',
    message: 'Please deploy backend to Vercel, Render, or Railway instead',
    hint: 'Update API_BASE_URL in src/utils/cockroachdbService.ts to point to your backend URL'
  });
});

export const handler = serverless(app, {
  basePath: '/.netlify/functions/api'
});





