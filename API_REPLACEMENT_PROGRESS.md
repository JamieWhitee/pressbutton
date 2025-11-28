/**
 * 批量API调用替换进度文档
 * Batch API Call Replacement Progress
 */

## ✅ 已完成的替换 (Completed Replacements)

### 1. AuthContext.tsx - 认证上下文 ✅
- **状态**: 完全替换成功
- **更改**:
  - ❌ `import { apiClient } from '../lib/api';`
  - ❌ `import { enterpriseApiClient } from '../lib/api/enterprise-api-client';`
  - ✅ `import { authApi } from '../lib/api/auth';`
- **API调用替换**:
  - `apiClient.login()` → `authApi.login()`
  - `apiClient.register()` → `authApi.register()`
  - `apiClient.createGuestAccount()` → `authApi.guestSignup()`
  - `apiClient.getProfile()` → `authApi.getProfile()`
  - `apiClient.logout()` → `authApi.logout()`
  - 移除所有 `enterpriseApiClient` 调用

## 🔄 进行中的替换 (In Progress)

### 2. questions/[id]/page.tsx - 问题详情页
- **状态**: 部分替换，存在类型冲突
- **问题**:
  - ID类型不匹配 (number vs string)
  - 缺少某些API方法 (`getUserVote`, `getByQuestionId`)
  - 类型定义不一致 (`VoteData`, `CreateCommentData`)
- **需要**: 修复API服务或更新页面代码以匹配新API

## 📋 待替换的文件清单 (Pending Files)

### 3. app/users/profile/page.tsx - 用户个人资料页
```typescript
// 当前调用
const allQuestions = await questionsApi.getAll(user.id);

// 需要替换为
import { questionsApi } from '../../../lib/api/questions-new';
const allQuestions = await questionsApi.getAll();
```

### 4. app/rank/page.tsx - 排名页面
```typescript
// 当前调用
const questions = await questionsApi.getTop(questionLimit);

// 需要替换为
import { questionsApi } from '../../lib/api/questions-new';
const questions = await questionsApi.getTop(questionLimit);
```

### 5. 其他可能的文件
使用以下命令查找更多需要替换的文件：
```bash
grep -r "fetch(" src/
grep -r "apiClient\." src/
grep -r "enterpriseApiClient" src/
```

## 🔧 遗留问题 (Outstanding Issues)

### API接口不匹配问题
1. **ID类型**: 页面使用 `number`，新API期望 `string`
2. **缺失方法**: `getUserVote()`, `getByQuestionId()` 等
3. **类型定义**: `VoteData` vs `VoteRequest`, `CreateCommentData` vs `CreateCommentRequest`

### 解决方案选项:
- **选项A**: 修改API服务以支持原有接口
- **选项B**: 修改页面代码以匹配新API接口
- **选项C**: 创建适配器层保持兼容性

## 📈 当前进度统计

✅ **完成**: 1/4+ 文件 (25%+)
🔄 **进行中**: 1 文件
📋 **待处理**: 2+ 文件

**下一步建议**:
1. 修复 `questions/[id]/page.tsx` 的类型问题
2. 完成简单的 profile 和 rank 页面替换
3. 批量搜索并替换剩余的API调用
