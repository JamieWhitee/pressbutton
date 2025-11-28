# PressButton 🔴 / 按钮游戏

**Instagram-style button game inspired by willyoupressthebutton.com**
**灵感来源于 willyoupressthebutton.com 的 Instagram 风格按钮游戏**

> Would you press the button? A social dilemma game where users vote on hypothetical scenarios.
> 你会按下按钮吗？一个让用户对假设情景进行投票的社交两难游戏。

## 🏗️ Architecture / 架构

```text
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│  Next.js Web    │ ◄──────────────► │   NestJS API    │
│  (Frontend)     │                 │   (Backend)     │
└─────────────────┘                 └─────────────────┘
                                            │ Prisma ORM
                                            ▼
                                    ┌─────────────────┐
                                    │   PostgreSQL    │
                                    └─────────────────┘
```

## 🚀 Quick Start / 快速开始

```bash
# Clone and install / 克隆并安装
git clone https://github.com/username/pressbutton.git
cd pressbutton
cd pressbutton-api && npm install
cd ../pressbutton-web && npm install

# Database setup / 数据库设置
cd pressbutton-api
npx prisma migrate dev && npx prisma db seed

# Development / 开发
# Terminal 1: cd pressbutton-api && npm run start:dev
# Terminal 2: cd pressbutton-web && npm run dev
```

**Access / 访问:** Frontend <http://localhost:3000> | API <http://localhost:3001/api> | Docs <http://localhost:3001/docs>

## 🛠️ Tech Stack / 技术栈

**Frontend:** Next.js 15.5.0, React 19.1.0, TypeScript 5, Tailwind CSS, React Hook Form + Yup
**Backend:** NestJS 11.0.1, Prisma ORM, PostgreSQL, JWT, Swagger
**Dev Tools:** ESLint, Prettier, Jest, Husky

## 📁 Structure / 目录结构

```text
pressbutton/
├── pressbutton-api/           # Backend NestJS / 后端
│   ├── src/auth/             # Authentication / 身份验证
│   ├── src/modules/questions/ # Questions / 问题管理
│   └── src/common/           # Enterprise utilities / 企业工具
├── pressbutton-web/          # Frontend Next.js / 前端
│   ├── src/app/              # Pages / 页面
│   ├── src/components/       # UI components / UI组件
│   └── src/lib/              # Utilities / 工具库
```

## 🗄️ Database Schema / 数据库模式

```prisma
model User {
  id        String @id @default(cuid())
  email     String @unique
  username  String @unique
  password  String // Hashed / 加密

  questions Question[]
  votes     Vote[]
  comments  Comment[]
}

model Question {
  id          String @id @default(cuid())
  benefit     String // "You become rich" / "你变富有"
  consequence String // "But no more games" / "但再也没有游戏"

  author   User @relation(fields: [authorId], references: [id])
  authorId String
  votes    Vote[]
  comments Comment[]
}

model Vote {
  choice ButtonChoice // PRESS or DONT_PRESS / 按下或不按下
  @@unique([userId, questionId])
}

enum ButtonChoice { PRESS, DONT_PRESS }
```

## 🎯 Core Features / 核心功能

1. **Authentication** - JWT-based login/register / JWT身份验证
2. **Questions** - Create dilemma scenarios / 创建两难情景
3. **Voting** - Binary choice with stats / 二选一投票统计
4. **Social** - Comments and rankings / 评论和排行

## 🏢 Enterprise Features / 企业级功能

### 1. Global Exception Handling / 全局异常处理

```typescript
/**
 * Enterprise Exception Handler / 企业级异常处理器
 * Standardized error responses / 标准化错误响应
 */
@Catch()
export class EnterpriseExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Return structured error response / 返回结构化错误响应
    return {
      success: false,
      timestamp: new Date().toISOString(),
      error: { code, message, details }
    };
  }
}
```

### 2. Enterprise Logging / 企业级日志

```typescript
/**
 * Enterprise Logger / 企业级日志
 * Replaces console.log with NestJS Logger / 用NestJS Logger替代console.log
 */
export class EnterpriseLogger {
  logUserOperation(userId: string, operation: string, details: any) {
    this.logger.log({ event: 'USER_OPERATION', userId, operation, details });
  }

  logApiCall(method: string, url: string, statusCode: number) {
    this.logger.log({ event: 'API_CALL', method, url, statusCode });
  }
}
```

### 3. Advanced Data Management / 高级数据管理

```typescript
/**
 * Enterprise Data Manager / 企业级数据管理器
 * Advanced pagination, filtering, sorting / 高级分页、过滤、排序
 */
export class EnterpriseDataManager<T> {
  async paginate(options: PaginationOptions): Promise<PaginatedResult<T>> {
    // Dynamic filtering and pagination / 动态过滤和分页
    return { data, pagination: { page, limit, total, hasNext, hasPrev } };
  }
}
```

### 4. Unified API Client / 统一API客户端

```typescript
/**
 * Enterprise API Client / 企业级API客户端
 * Consistent API communication / 一致的API通信
 */
export class EnterpriseApiClient {
  async makeRequest<T>(method: string, endpoint: string): Promise<ApiResponse<T>> {
    // Standardized response format / 标准化响应格式
    return { success, data, message, timestamp };
  }
}
```

### 5. Configuration Management / 配置管理

```typescript
/**
 * Enterprise Config Service / 企业级配置服务
 * Environment-aware configuration / 环境感知配置
 */
@Injectable()
export class EnterpriseConfigService {
  getDatabaseConfig(): DatabaseConfig { /* ... */ }
  getJwtConfig(): JwtConfig { /* ... */ }
  isProduction(): boolean { /* ... */ }
}
```

**Implementation Status / 实现状态:**
✅ Exception Handler | ✅ Logger | ✅ Data Manager | ✅ API Client | ✅ Config Management

## 📝 Bilingual Standards / 双语注释标准

All code follows bilingual commenting (English/Chinese):

```typescript
/**
 * Create new question / 创建新问题
 */
async function createQuestion(data: CreateQuestionDto): Promise<Question> {
  // Validate data / 验证数据
  if (!data.benefit || !data.consequence) {
    throw new Error('Benefit and consequence required / 好处和后果必需');
  }
  return this.prisma.question.create({ data });
}

interface ButtonProps {
  variant?: 'primary' | 'secondary'; // Button style / 按钮样式
  onClick?: () => void;               // Click handler / 点击处理
  children: React.ReactNode;          // Content / 内容
}
```

## 🚀 Deployment / 部署

```bash
# Production build / 生产构建
cd pressbutton-api && npm run build && npm run dev-clean
cd pressbutton-web && npm run build && npm run dev
```

**Environment Variables / 环境变量:**

```env
# Backend / 后端
DATABASE_URL="postgresql://user:pass@localhost:5432/pressbutton"
JWT_SECRET="your-secret-key"

# Frontend / 前端
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 🤝 Contributing / 贡献

1. Fork → Create branch → Bilingual comments → Tests → Pull request
2. **Standards:** ESLint + Prettier, TypeScript strict, Jest testing
3. **Requirements:** All functions need bilingual comments / 所有函数需要双语注释

## 📄 License & Acknowledgments / 许可证与致谢

**MIT License** - see [LICENSE](LICENSE) / 查看许可证文件

**Thanks to:** willyoupressthebutton.com (inspiration), Instagram (design), NestJS & Next.js (frameworks)

---

**PressButton Team** - GitHub: [github.com/username/pressbutton](https://github.com/username/pressbutton)
**问题反馈** - 如有问题或贡献建议，请访问我们的GitHub仓库
