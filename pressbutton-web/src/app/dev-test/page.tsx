"use client";
import { useState } from 'react';
import { questionsApi } from '../../lib/api/questions';

/**
 * Developer API Testing Dashboard
 * Simple page for testing all API endpoints during development
 * No fancy styling - just functional testing buttons
 * 开发者API测试仪表板 - 开发期间测试所有API端点的简单页面，无花哨样式，只有功能测试按钮
 */
export default function DevTestPage() {
  // State for storing test results from different APIs
  // 用于存储不同API测试结果的状态
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  /**
   * Generic function to test any API method and display results
   * Enhanced with detailed error information for debugging
   * 测试任何API方法并显示结果的通用函数 - 增强了详细错误信息用于调试
   */
  const testApi = async (name: string, apiCall: () => Promise<any>) => {
    setLoading(prev => ({ ...prev, [name]: true }));
    try {
      console.log(`🧪 Testing ${name}...`);
      const result = await apiCall();
      console.log(`✅ ${name} success:`, result);
      setResults(prev => ({ ...prev, [name]: { success: true, data: result } }));
    } catch (error) {
      // Enhanced error logging with more details for debugging
      // 增强的错误日志记录，包含更多调试详情
      console.group(`❌ ${name} failed - Detailed Error Information`);
      console.error('Original Error:', error);
      console.error('Error Name:', error instanceof Error ? error.name : 'Unknown');
      console.error('Error Message:', error instanceof Error ? error.message : String(error));
      console.error('Error Stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.groupEnd();

      // Store detailed error information for display
      // 存储详细错误信息用于显示
      setResults(prev => ({
        ...prev,
        [name]: {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          errorName: error instanceof Error ? error.name : 'Unknown',
          errorType: error instanceof Error ? error.constructor.name : 'Unknown',
          timestamp: new Date().toISOString(),
          // Note: Check browser Network tab for HTTP status and response details
          // 注意：检查浏览器Network面板查看HTTP状态和响应详情
          debugHint: "💡 Check browser DevTools: Network tab for HTTP details, Console tab for logs"
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }));
    }
  };

  /**
   * Function to clear all test results and reset the state
   * This allows developers to start fresh when testing multiple APIs
   * 清除所有测试结果并重置状态的函数 - 允许开发者在测试多个API时重新开始
   */
  const clearResults = () => {
    setResults({});
    setLoading({});
    console.log('🧹 Test results cleared');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔧 API Testing Dashboard</h1>
      <p>Simple testing interface for all API endpoints</p>

      {/* Questions API Tests */}
      <section style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px' }}>
        <h2>📝 Questions API</h2>

        <button
          onClick={() => testApi('questions.getAll', () => questionsApi.getAll())}
          disabled={loading['questions.getAll']}
          style={{ margin: '5px', padding: '5px 10px' }}
        >
          {loading['questions.getAll'] ? 'Testing...' : 'Test getAll()'}
        </button>

        <button
          onClick={() => testApi('questions.getAll.author2', () => questionsApi.getAll(2))}
          disabled={loading['questions.getAll.author2']}
          style={{ margin: '5px', padding: '5px 10px' }}
        >
          {loading['questions.getAll.author2'] ? 'Testing...' : 'Test getAll(authorId=2)'}
        </button>

        <button
          onClick={() => testApi('questions.getById.1', () => questionsApi.getById(1))}
          disabled={loading['questions.getById.1']}
          style={{ margin: '5px', padding: '5px 10px' }}
        >
          {loading['questions.getById.1'] ? 'Testing...' : 'Test getById(1)'}
        </button>

        <button
          onClick={() => testApi('questions.getById.2', () => questionsApi.getById(2))}
          disabled={loading['questions.getById.2']}
          style={{ margin: '5px', padding: '5px 10px' }}
        >
          {loading['questions.getById.2'] ? 'Testing...' : 'Test getById(2)'}
        </button>

        <button
          onClick={() => testApi('questions.getById.999', () => questionsApi.getById(999))}
          disabled={loading['questions.getById.999']}
          style={{ margin: '5px', padding: '5px 10px' }}
        >
          {loading['questions.getById.999'] ? 'Testing...' : 'Test getById(999) [Should Fail]'}
        </button>

        <button
          onClick={() => testApi('questions.create', () => questionsApi.create({
            positiveOutcome: 'Test question positive - Will you gain unlimited knowledge?',
            negativeOutcome: 'Test question negative - You will forget how to use technology forever'
          }))}
          disabled={loading['questions.create']}
          style={{ margin: '5px', padding: '5px 10px' }}
         >
          {loading['questions.create'] ? 'Testing...' : 'Test create() [JWT Required - Should Fail]'}
        </button>

        <button
          onClick={() => testApi('questions.createTest', () => questionsApi.createTest({
            positiveOutcome: 'You will have the power to stop time whenever you want',
            negativeOutcome: 'Every time you stop time, you age 10 years',
            authorId: 1
          }))}
          disabled={loading['questions.createTest']}
          style={{ margin: '5px', padding: '5px 10px' }}
         >
          {loading['questions.createTest'] ? 'Testing...' : 'Test createTest() [No Auth - Should Work]'}
        </button>

        <button
          onClick={() => testApi('questions.createTest.invalid', () => questionsApi.createTest({
            positiveOutcome: 'x',  // Too short - should fail validation
            negativeOutcome: 'y',   // Too short - should fail validation
            authorId: 999
          }))}
          disabled={loading['questions.createTest.invalid']}
          style={{ margin: '5px', padding: '5px 10px' }}
         >
          {loading['questions.createTest.invalid'] ? 'Testing...' : 'Test createTest() [Should Fail - Validation]'}
        </button>

      </section>

      {/* Future: Users API Tests */}
      <section style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px' }}>
        <h2>👤 Users API (Future)</h2>
        <p>Add user API tests here when ready</p>
      </section>

      {/* Future: Comments API Tests */}
      <section style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px' }}>
        <h2>💬 Comments API (Future)</h2>
        <p>Add comment API tests here when ready</p>
      </section>

      {/* Test Results Display */}
      <section style={{ marginTop: '30px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <h2>📊 Test Results</h2>

          {Object.keys(results).length > 0 && (
            <button
              onClick={clearResults}
              style={{
                padding: '8px 15px',
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#ff5252';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#ff6b6b';
              }}
            >
              🧹 Clear Results
            </button>
          )}
        </div>

        {Object.keys(results).length === 0 ? (
          <p style={{
            color: '#666',
            fontStyle: 'italic',
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px'
          }}>
            No test results yet. Click any test button above to see results here.
          </p>
        ) : (
          <pre style={{
            background: '#f5f5f5',
            padding: '15px',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            {JSON.stringify(results, null, 2)}
          </pre>
        )}
      </section>
    </div>
  );
}
