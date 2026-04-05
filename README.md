# 智能客户池转化工具

一个基于 Next.js 14 + Supabase + Tailwind CSS + Shadcn/UI 构建的智能客户池转化工具 MVP 版本。

## 功能特性

### 核心功能
- **销售工作台**：看板式客户管理，支持拖拽改变状态
- **AI 销售助手**：智能分析客户意图，提供话术建议
- **公海池市场**：自动回收长期未跟进客户，支持一键领取
- **快速录入**：支持智能解析客户信息

### 技术栈
- **前端框架**：Next.js 14 (App Router)
- **数据库**：Supabase (PostgreSQL)
- **UI 框架**：Tailwind CSS + Shadcn/UI
- **类型安全**：TypeScript 严格模式

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填写以下配置：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
CRON_SECRET=your_cron_secret
```

### 3. 初始化数据库

在 Supabase SQL 编辑器中执行 `supabase/schema.sql` 文件内容。

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
customer-label/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API 路由
│   │   │   ├── ai/         # AI 相关接口
│   │   │   └── cron/       # 定时任务接口
│   │   ├── layout.tsx      # 根布局
│   │   ├── page.tsx        # 主页面
│   │   └── globals.css     # 全局样式
│   ├── components/         # React 组件
│   │   ├── ui/            # Shadcn/UI 组件
│   │   ├── CustomerKanban.tsx
│   │   ├── AiSidebar.tsx
│   │   ├── QuickAddCustomer.tsx
│   │   └── PublicPoolMarket.tsx
│   ├── lib/               # 工具库
│   │   ├── supabase.ts
│   │   ├── utils.ts
│   │   └── database.types.ts
│   └── types/             # TypeScript 类型定义
└── supabase/
    └── schema.sql         # 数据库 Schema
```

## 核心功能说明

### 1. 销售工作台
- 看板视图展示不同状态的客户
- 支持拖拽改变客户状态
- 点击客户卡片查看详情和 AI 建议

### 2. AI 销售助手
- 分析客户跟进记录
- 识别客户意图（价格敏感、功能咨询等）
- 提供个性化话术建议
- 给出下一步行动建议

### 3. 公海池市场
- 自动回收超过 7 天未跟进的客户
- 支持一键领取公海客户
- 显示客户 AI 评分和基本信息

### 4. 快速录入
- 表单式录入客户信息
- 智能解析粘贴的文本信息
- 自动识别姓名、电话、公司

## API 接口

### AI 销售助手
```
POST /api/ai/coach
```

请求体：
```json
{
  "customer_id": "string",
  "last_interaction": "string"
}
```

响应：
```json
{
  "customer_intent": "string",
  "suggested_script": "string",
  "next_action": "string",
  "confidence": 0.85
}
```

### 公海池回收
```
POST /api/cron/public-pool
```

需要在请求头中添加授权：
```
Authorization: Bearer your_cron_secret
```

## 部署说明

### Supabase 配置
1. 创建 Supabase 项目
2. 执行 `schema.sql` 创建数据表
3. 配置 RLS 策略
4. 获取项目 URL 和 API 密钥

### 定时任务配置
可以使用 Vercel Cron Jobs 或其他定时任务服务，每天凌晨调用：
```
POST https://your-domain.com/api/cron/public-pool
Authorization: Bearer your_cron_secret
```

## 开发建议

### 扩展 AI 功能
在 `src/app/api/ai/coach/route.ts` 中，可以集成真实的 AI 服务：
- OpenAI GPT
- Claude
- 其他大模型 API

### 自定义业务规则
- 修改 `supabase/schema.sql` 中的公海池回收规则
- 调整 AI 评分计算逻辑
- 自定义客户状态流转规则

## 许可证

MIT
