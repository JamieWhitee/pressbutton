This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 项目背景
本项目旨在仿制 will you press the button 网站，实现前后端分离的全栈开发练习，提升 TypeScript、Next.js 和 PostgreSQL 的实战能力

## 技术栈及其版本
##  前端（pressbutton-web）
Next.js：15.5.0
React：19.1.0
TypeScript：^5
react-hook-form：^7.62.0
@hookform/resolvers：^5.2.1
Yup：^1.7.0
Tailwind CSS：^4
Prettier：^3.6.2
ESLint：^9
其他依赖详见 package.json
##  后端（pressbutton-api）
NestJS（@nestjs/core）：^11.0.1
@nestjs/common：^11.0.1
@nestjs/config：^4.0.2
@nestjs/swagger：^11.2.0
Prisma ORM（@prisma/client）：^6.14.0
class-validator：^0.14.2
class-transformer：^0.5.1
Helmet：^8.1.0
RxJS：^7.8.1
Swagger UI Express：^5.0.1
Prettier：^3.4.2
ESLint：^9.18.0
其他依赖详见 package.json
##  数据库
PostgreSQL（请补充具体版本）
## 开发规划
（请补充你的开发规划，例如：）

项目初始化与基础框架搭建
用户注册、登录功能开发
问题展示与投票模块实现
排行榜与统计功能开发
UI 优化与交互完善
单元测试与文档补充
## git地址
https://github.com/JamieWhitee/pressbutton

## 相关信息
参考网站：https://willyoupressthebutton.com/
## 主要目录结构：
pressbutton-api/：后端服务
pressbutton-web/：前端项目
## 代码风格：Prettier、ESLint 统一规范
## 重要配置文件：.env、prisma/schema.prisma、next.config.ts 等
## 依赖包管理：npm
## 其他说明：未来需要部署到AWS,环境会有开发环境,生产环境
