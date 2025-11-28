# PressButton Project Structure 🔴

**Instagram-style button game inspired by willyoupressthebutton.com**

> A social dilemma game where users vote on hypothetical scenarios.

## 🏗️ Architecture Overview

```
┌─────────────────────┐    HTTP/REST    ┌─────────────────────┐
│   Next.js 15.5.0    │ ◄──────────────► │   NestJS 11.0.1     │
│   (Frontend)        │                  │   (Backend)         │
│   Port: 3000        │                  │   Port: 3001        │
└─────────────────────┘                  └─────────────────────┘
                                                    │
                                                    │ Prisma ORM
                                                    ▼
                                          ┌─────────────────────┐
                                          │   PostgreSQL        │
                                          │   (Database)        │
                                          └─────────────────────┘
```

## 🛠️ Tech Stack

**Frontend:**
- Next.js 15.5.0 (App Router)
- React 19.1.0
- TypeScript 5
- Tailwind CSS 4
- React Hook Form + Yup

**Backend:**
- NestJS 11.0.1
- Prisma ORM 6.14.0
- PostgreSQL
- JWT Authentication
- Swagger API Documentation

**DevOps & Tools:**
- ESLint + Prettier
- Jest (Testing)
- Husky (Git Hooks)
- Pino Logger
- Helmet (Security)

## 📁 Directory Structure

```
pressbutton/
├── 📦 Root Configuration
│   ├── package.json              # Monorepo scripts management
│   ├── .env.example              # Environment variables template
│   ├── .eslintrc.base.cjs        # Shared ESLint configuration
│   ├── .prettierrc.js            # Code formatting rules
│   ├── README.md                 # Main project documentation
│   └── PROJECT_STRUCTURE.md      # This file
│
├── 🔧 pressbutton-api/           # Backend NestJS Application
│   ├── src/
│   │   ├── main.ts               # Application entry point (Port 3001)
│   │   ├── app.module.ts         # Root module (integrates all modules)
│   │   │
│   │   ├── auth/                 # 🔐 Authentication Module
│   │   │   ├── auth.controller.ts    # Login/Register endpoints
│   │   │   ├── auth.service.ts       # JWT authentication logic
│   │   │   ├── dto/                  # Data Transfer Objects
│   │   │   │   ├── login.dto.ts
│   │   │   │   └── register.dto.ts
│   │   │   ├── guards/               # JWT Guards
│   │   │   │   └── jwt-auth.guard.ts
│   │   │   └── strategies/           # Passport JWT Strategy
│   │   │       └── jwt.strategy.ts
│   │   │
│   │   ├── modules/
│   │   │   ├── questions/        # 📝 Questions Module
│   │   │   │   ├── questions.controller.ts  # CRUD endpoints
│   │   │   │   ├── questions.service.ts     # Business logic
│   │   │   │   ├── questions.module.ts      # Module definition
│   │   │   │   ├── dto/                     # DTOs for questions
│   │   │   │   │   ├── create-question.dto.ts
│   │   │   │   │   ├── update-question.dto.ts
│   │   │   │   │   ├── vote.dto.ts
│   │   │   │   │   └── query-questions.dto.ts
│   │   │   │   └── filters/                 # Query filters
│   │   │   │
│   │   │   └── comments/         # 💬 Comments Module
│   │   │       ├── comments.controller.ts
│   │   │       ├── comments.service.ts
│   │   │       └── comments.module.ts
│   │   │
│   │   ├── common/               # 🛠️ Common Utilities
│   │   │   ├── filters/          # Global exception filters
│   │   │   │   └── http-exception.filter.ts
│   │   │   └── utils/            # Utility functions
│   │   │
│   │   └── prisma/               # 🗄️ Database Module
│   │       ├── prisma.module.ts
│   │       └── prisma.service.ts
│   │
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema definition
│   │   ├── seed.ts               # Database seed data
│   │   └── migrations/           # Database migrations
│   │
│   ├── test/                     # Test files
│   │   ├── app.e2e-spec.ts
│   │   └── jest-e2e.json
│   │
│   ├── dist/                     # Compiled output
│   ├── node_modules/             # Dependencies
│   ├── package.json              # Backend dependencies
│   ├── tsconfig.json             # TypeScript configuration
│   ├── nest-cli.json             # NestJS CLI configuration
│   └── .env                      # Environment variables (gitignored)
│
└── 🎨 pressbutton-web/           # Frontend Next.js Application
    ├── src/
    │   ├── app/                  # Next.js 15 App Router
    │   │   ├── layout.tsx        # Root layout (Providers)
    │   │   ├── page.tsx          # Home page (Questions feed)
    │   │   ├── globals.css       # Global styles
    │   │   │
    │   │   ├── questions/        # Questions pages
    │   │   │   ├── [id]/         # Dynamic question detail page
    │   │   │   └── create/       # Create question page
    │   │   │
    │   │   ├── rank/             # Ranking page
    │   │   │   └── page.tsx
    │   │   │
    │   │   └── users/            # User-related pages
    │   │       ├── login/
    │   │       ├── register/
    │   │       └── profile/
    │   │
    │   ├── components/           # 🧩 Reusable UI Components
    │   │   ├── Button.tsx        # Button component
    │   │   ├── Input.tsx         # Input field component
    │   │   ├── Navigation.tsx    # Navigation bar
    │   │   ├── ErrorMessage.tsx  # Error display component
    │   │   └── TokenDebugger.tsx # JWT token debugger
    │   │
    │   ├── contexts/             # 📦 React Context Providers
    │   │   ├── AuthContext.tsx   # Authentication state management
    │   │   └── EnterpriseContext.tsx  # Enterprise features context
    │   │
    │   └── lib/                  # 📚 Utility Libraries
    │       ├── api/              # API Layer
    │       │   ├── auth.ts       # Authentication API calls
    │       │   ├── questions.ts  # Questions API calls
    │       │   ├── comments.ts   # Comments API calls
    │       │   ├── enterprise-api-client.ts  # Enterprise API client
    │       │   └── index.ts      # API exports
    │       │
    │       ├── api-client.ts     # Unified API client
    │       ├── api.ts            # Legacy API functions
    │       ├── config.ts         # Configuration management
    │       ├── exceptions/       # Exception handling
    │       └── logging/          # Logging utilities
    │
    ├── public/                   # Static assets
    │   ├── favicon.ico
    │   └── images/
    │
    ├── .next/                    # Next.js build output
    ├── node_modules/             # Dependencies
    ├── package.json              # Frontend dependencies
    ├── next.config.ts            # Next.js configuration
    ├── tailwind.config.js        # Tailwind CSS configuration
    ├── postcss.config.mjs        # PostCSS configuration
    ├── tsconfig.json             # TypeScript configuration
    └── .env.local                # Environment variables (gitignored)
```

## 🗄️ Database Schema (Prisma)

### User Model
```prisma
model User {
  id          Int         @id @default(autoincrement())
  email       String      @unique
  name        String?
  password    String      // Hashed with bcrypt
  avatar      String?
  accountType AccountType @default(REGULAR)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  // Relations
  questions   Question[]
  votes       Vote[]
  comments    Comment[]
}
```

### Question Model
```prisma
model Question {
  id              Int       @id @default(autoincrement())
  positiveOutcome String    // The benefit
  negativeOutcome String    // The consequence
  authorId        Int
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  author          User      @relation(fields: [authorId], references: [id])
  votes           Vote[]
  comments        Comment[]
}
```

### Vote Model
```prisma
model Vote {
  id         Int          @id @default(autoincrement())
  userId     Int
  questionId Int
  choice     ButtonChoice // PRESS or DONT_PRESS
  createdAt  DateTime     @default(now())

  // Relations
  user       User         @relation(fields: [userId], references: [id])
  question   Question     @relation(fields: [questionId], references: [id])

  @@unique([userId, questionId])
}
```

### Comment Model
```prisma
model Comment {
  id         Int      @id @default(autoincrement())
  content    String
  userId     Int
  questionId Int
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Relations
  user       User     @relation(fields: [userId], references: [id])
  question   Question @relation(fields: [questionId], references: [id])
}
```

### Enums
```prisma
enum ButtonChoice {
  PRESS
  DONT_PRESS
}

enum AccountType {
  REGULAR
  GUEST
}
```

## 🔑 Core Features

### Backend (NestJS)

#### 1. Authentication Module (`auth/`)
- **JWT Token Generation & Validation**
- **User Registration** - Email validation, password hashing
- **User Login** - Credential verification, token issuance
- **Passport JWT Strategy** - Protected route authentication
- **Guards** - Route protection with JWT verification

#### 2. Questions Module (`modules/questions/`)
- **CRUD Operations** - Create, Read, Update, Delete questions
- **Voting System** - Binary choice (PRESS/DONT_PRESS)
- **Vote Statistics** - Real-time vote counting and percentages
- **Pagination** - Efficient data loading with page/limit
- **Advanced Filtering** - Sort by date, popularity, votes
- **User-specific Queries** - Get questions by author

#### 3. Comments Module (`modules/comments/`)
- **Comment CRUD** - Create, read, update, delete comments
- **Question Association** - Link comments to questions
- **User Attribution** - Track comment authors

#### 4. Enterprise Features
- **Global Exception Handling** - Standardized error responses
- **Pino Logging System** - Structured, high-performance logging
- **Helmet Security** - HTTP security headers
- **Throttler Rate Limiting** - Prevent brute force attacks
- **Swagger Documentation** - Auto-generated API docs at `/docs`
- **CORS Configuration** - Cross-origin request handling
- **Validation Pipes** - Automatic request validation

### Frontend (Next.js)

#### 1. Page Routes
- **`/`** - Home page with questions feed
- **`/questions/[id]`** - Question detail with voting and comments
- **`/questions/create`** - Create new question form
- **`/rank`** - Leaderboard and statistics
- **`/users/login`** - User login page
- **`/users/register`** - User registration page
- **`/users/profile`** - User profile management

#### 2. State Management
- **AuthContext** - User authentication state
  - Login/logout functionality
  - JWT token management
  - User profile data
- **EnterpriseContext** - Enterprise-level features
  - Error handling
  - Loading states
  - Global notifications

#### 3. API Communication
- **Unified API Client** - Centralized HTTP requests
- **Automatic JWT Injection** - Token added to all requests
- **Error Handling** - Standardized error responses
- **Retry Mechanism** - Automatic retry on network failures
- **Type Safety** - Full TypeScript support

#### 4. UI Components
- **Button** - Reusable button with variants
- **Input** - Form input with validation
- **Navigation** - Responsive navigation bar
- **ErrorMessage** - User-friendly error display

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL database

### Installation

```bash
# Clone the repository
git clone https://github.com/username/pressbutton.git
cd pressbutton

# Install dependencies for both frontend and backend
npm run install:all

# Or install separately
npm run install:api
npm run install:web
```

### Environment Setup

1. **Copy environment variables**
```bash
# Backend
cp .env.example pressbutton-api/.env

# Frontend
cp .env.example pressbutton-web/.env.local
```

2. **Configure backend environment** (`pressbutton-api/.env`)
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/pressbutton_dev
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3001
CORS_ORIGIN=http://localhost:3000
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

3. **Configure frontend environment** (`pressbutton-web/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NODE_ENV=development
```

### Database Setup

```bash
cd pressbutton-api

# Run database migrations
npx prisma migrate dev

# Seed the database with sample data
npx prisma db seed

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### Development

```bash
# Start both frontend and backend concurrently
npm run dev

# Or start separately
# Terminal 1: Backend
npm run dev:api

# Terminal 2: Frontend
npm run dev:web
```

### Access Points
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api
- **API Documentation:** http://localhost:3001/docs

## 📦 Available Scripts

### Root Directory
```bash
npm run dev              # Start both frontend and backend
npm run build            # Build both applications
npm run test             # Run all tests
npm run lint             # Lint all code
npm run lint:fix         # Fix linting issues
npm run clean            # Clean dependencies and build files
```

### Backend (`pressbutton-api/`)
```bash
npm run start:dev        # Start in development mode
npm run build            # Build for production
npm run start:prod       # Start production server
npm run test             # Run unit tests
npm run test:e2e         # Run end-to-end tests
npm run lint             # Lint backend code
npm run db:seed          # Seed database
```

### Frontend (`pressbutton-web/`)
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Lint frontend code
npm run lint:fix         # Fix linting issues
npm run type-check       # TypeScript type checking
```

## 🏢 Enterprise-Grade Features

### 1. Standardized API Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}
```

### 2. Global Exception Handling
```typescript
@Catch()
export class EnterpriseExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Returns structured error response
    return {
      success: false,
      timestamp: new Date().toISOString(),
      error: { code, message, details }
    };
  }
}
```

### 3. Enterprise Logging
```typescript
export class EnterpriseLogger {
  logUserOperation(userId: string, operation: string, details: any) {
    this.logger.log({ event: 'USER_OPERATION', userId, operation, details });
  }

  logApiCall(method: string, url: string, statusCode: number) {
    this.logger.log({ event: 'API_CALL', method, url, statusCode });
  }
}
```

### 4. Security Features
- **Helmet** - Security headers (XSS, clickjacking protection)
- **CORS** - Configurable cross-origin requests
- **JWT Authentication** - Secure token-based auth
- **Rate Limiting** - Throttler to prevent abuse
- **Password Hashing** - Bcrypt for secure password storage
- **Input Validation** - Class-validator for DTO validation

### 5. API Documentation
- **Swagger UI** - Interactive API documentation
- **Auto-generated** - Based on decorators and DTOs
- **Bearer Auth** - JWT token testing in Swagger UI
- **Request/Response Examples** - Clear API contracts

## 🧪 Testing

### Backend Testing
```bash
cd pressbutton-api

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Testing
```bash
cd pressbutton-web

# Run tests
npm run test

# Watch mode
npm run test:watch
```

## 📝 Code Standards

### Bilingual Comments
All code follows bilingual commenting (English/Chinese):

```typescript
/**
 * Create new question
 * 创建新问题
 */
async function createQuestion(data: CreateQuestionDto): Promise<Question> {
  // Validate data
  // 验证数据
  if (!data.positiveOutcome || !data.negativeOutcome) {
    throw new Error('Both outcomes are required');
  }
  return this.prisma.question.create({ data });
}
```

### TypeScript Standards
- **Strict Mode** - Full type safety
- **Interface Definitions** - Clear contracts
- **Type Inference** - Leverage TypeScript's power
- **No `any` Types** - Explicit typing required

### Code Formatting
- **ESLint** - Code quality rules
- **Prettier** - Consistent formatting
- **Husky** - Pre-commit hooks
- **Lint-staged** - Staged files linting

## 🚢 Deployment

### Production Build

```bash
# Build backend
cd pressbutton-api
npm run build
npm run start:prod

# Build frontend
cd pressbutton-web
npm run build
npm run start
```

### Environment Variables (Production)

**Backend:**
```env
DATABASE_URL=postgresql://prod_user:prod_pass@prod_host:5432/pressbutton_prod
JWT_SECRET=production-secret-key-very-secure
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

**Frontend:**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NODE_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Add bilingual comments to all functions
4. Write tests for new features
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Contribution Standards
- **ESLint + Prettier** - Code must pass linting
- **TypeScript Strict** - Full type safety required
- **Jest Testing** - Tests for new features
- **Bilingual Comments** - English/Chinese documentation

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- **Inspiration:** willyoupressthebutton.com
- **Design:** Instagram
- **Frameworks:** NestJS & Next.js
- **Database:** PostgreSQL & Prisma

---

**PressButton Team** - For issues or contributions, visit our [GitHub repository](https://github.com/username/pressbutton)
