# 西班牙劳动法助手

带 **Supabase** 持久化、认证、限流、审计、反馈与 PDF RAG 的法律聊天应用。

## 环境变量

见 [`.env.example`](.env.example)。需配置 OpenAI 与 Supabase。

## Supabase

按 [`supabase/README.md`](supabase/README.md) 创建项目并执行 SQL 迁移。

## 本地运行

```bash
nvm use
npm install
cp .env.example .env.local
npm run dev
```

## 功能

| 功能 | 说明 |
|------|------|
| 历史记录 | `conversations` + `messages` |
| 用户 | Supabase Auth |
| 限流 | 每日 30 条消息 |
| RAG | PDF 入库 + pgvector |
| 反馈 | 有帮助 / 无帮助 |
| 审计 | `audit_events` |
| 隐私 | `/privacy` + 删除账户 |

作者：[Sararellano](https://sararellano.github.io/sararellano/)
