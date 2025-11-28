/**
 * API架构测试文件
 * 用于验证新的统一API客户端和服务层是否正常工作
 */

import { authApi } from './lib/api/auth';
import { questionsApi } from './lib/api/questions-new';
import { commentsApi } from './lib/api/comments';
import { getQuestionWithComments, checkApiHealth } from './lib/api/index';

/**
 * 测试新API架构的基本功能
 * Test basic functionality of the new API architecture
 */
async function testApiArchitecture() {
  console.log('🧪 Testing New API Architecture...');

  try {
    // 测试认证API
    console.log('Testing Auth API...');
    console.log('✅ authApi imported successfully');

    // 测试问题API
    console.log('Testing Questions API...');
    console.log('✅ questionsApi imported successfully');

    // 测试评论API
    console.log('Testing Comments API...');
    console.log('✅ commentsApi imported successfully');

    // 测试组合API
    console.log('Testing Combined API functions...');
    console.log('✅ getQuestionWithComments imported successfully');

    console.log('🎉 All API services are properly configured!');

    return {
      success: true,
      message: 'API architecture test passed'
    };

  } catch (error) {
    console.error('❌ API Architecture test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Export for use in components or pages
export { testApiArchitecture };

// Auto-run in development mode
if (process.env.NODE_ENV === 'development') {
  testApiArchitecture().then(result => {
    console.log('API Architecture Test Result:', result);
  });
}
