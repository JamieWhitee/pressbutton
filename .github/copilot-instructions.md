# Copilot AI Coding Agent Instructions

## 项目背景
这个项目是模仿这个网站(https://willyoupressthebutton.com),采用instagram风格配色,主要目的是实现用户注册登录,选择是否按下按钮,创建问题,发布评论

## 项目架构概览
  - `pressbutton-api/`：NestJS 服务，Prisma ORM，`src/modules/` 按功能模块划分（如 users、comments）。
  - `pressbutton-web/`：Next.js 15+ App Router，`src/app/` 按业务分文件夹（如 users、ranks、questions、comments）。

## 关键开发流程
  - 启动：`cd /Users/ibairah/vscodeprojects/pressbutton/pressbutton-web && npm run dev`（端口 3000）
  - 主要入口：`src/app/page.tsx`，页面按目录自动路由。
  - 表单校验统一用 `react-hook-form` + `Yup`，示例见 `src/app/users/login/page.tsx`。
  - 问题详情页需支持评论功能，建议在 `questions/[id]/page.tsx` 及 `comments/` 相关目录实现，前后端均需支持评论的增删查。
  - 样式采用 Tailwind CSS。
  - 启动：`cd /Users/ibairah/vscodeprojects/pressbutton/pressbutton-api && pm run start:dev`（端口 3001，见 .env 配置）
  - 主要入口：`src/main.ts`，业务模块在 `src/modules/` 下。
  - 数据库建模与迁移用 Prisma，schema 见 `prisma/schema.prisma`，评论相关表结构需同步维护。
  - 单元测试：`npm run test`，e2e 测试：`npm run test:e2e`

## 项目约定与模式

## 集成与依赖

## 参考文件
  - `pressbutton-web/src/app/users/login/page.tsx`（表单校验与登录）
  - `pressbutton-api/src/modules/users/`（用户相关后端逻辑）
  - `pressbutton-api/prisma/schema.prisma`（数据库建模）


## 部署与运维规划
- 生产环境部署优先考虑 AWS 云服务：
  - 计算：EC2 部署 Node.js 服务，支持自动扩缩容。
  - 数据库：RDS 托管 PostgreSQL，定期快照与备份。
  - 静态资源：S3 存储前端构建产物，配合 CloudFront CDN 加速。
  - 环境变量与密钥管理：建议使用 AWS Secrets Manager 或 SSM Parameter Store。
- 监控与报警：
  - 应用与基础设施监控建议集成 AWS CloudWatch（日志、指标、报警）、Prometheus、Grafana。
  - 关键业务/接口需配置健康检查与自动重启策略。
  - 监控与报警相关脚本、配置建议统一放在 `deploy/` 或 `infra/` 目录，便于 IaC（基础设施即代码）管理。
- 持续集成/持续部署（CI/CD）：
  - 推荐使用 GitHub Actions、AWS CodePipeline 等自动化部署。
  - 部署流程建议包含自动测试、构建、镜像推送、回滚策略等。

## 移动端与多端扩展规划
- 计划支持多端移植，提升用户覆盖面：
  - iOS/Android App：建议采用 React Native 或 Expo 框架，最大化复用 Web 端业务逻辑与 UI 组件。
    - 目录建议：`pressbutton-mobile/react-native-app/`
    - 可通过 monorepo 管理公共代码包（如业务逻辑、API SDK、UI 组件库）。
  - 微信小程序：建议采用 Taro、uni-app 或原生小程序开发，API 层复用后端 RESTful 服务。
    - 目录建议：`pressbutton-mobile/wechat-miniprogram/`
    - 可通过接口适配层实现 Web/小程序/APP 统一 API 调用。
- 移动端相关目录结构：
  - `pressbutton-mobile/`：移动端主目录
    - `react-native-app/`：React Native/Expo 项目（iOS/Android）
    - `wechat-miniprogram/`：微信小程序项目


## AI 代码注释与教学风格要求
- 作为 AI 代码助手，输出代码时需像老师一样工作：
  - 对每一段用户的对话,纠正英语的表达语法
  - 对每一段代码、每个函数、每个复杂结构都要用英文详细注释，解释写了什么、为什么要这样写。
  - 对于初学者容易困惑的类型、解构、三元表达式、可选链等结构，注释中要逐步拆解说明其含义和作用。
  - 回答问题时，先引导用户思考和表达，再给出提示和反馈，避免直接给出完整代码，鼓励自主实践。
  - 如用户要求，可直接给出详细注释和分步解释的代码。
  - 所有代码输出均需遵循最佳实践,符合真实公司项目，确保可读性和可维护性。
  - 一旦用户清楚明白了当前需要做的事情,就停止继续不停的提出问题,给出明确的带有checkbox list步骤,并提供的类似代码示例作为参考或者提供思路,比如应该在哪个文件夹创建什么文件,这个文件用户需要完成什么功能。
