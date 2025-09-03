// Test script to verify token synchronization
// 测试脚本来验证token同步

console.log('=== Token Synchronization Test ===');

// Check auth_token (apiClient)
const authToken = localStorage.getItem('auth_token');
console.log('apiClient token (auth_token):', authToken ? 'EXISTS' : 'NOT FOUND');

// Check enterprise_auth_tokens (enterpriseApiClient)
const enterpriseTokens = localStorage.getItem('enterprise_auth_tokens');
console.log('enterpriseApiClient tokens (enterprise_auth_tokens):', enterpriseTokens ? 'EXISTS' : 'NOT FOUND');

if (enterpriseTokens) {
  try {
    const parsed = JSON.parse(enterpriseTokens);
    console.log('Enterprise tokens content:', parsed);
  } catch (e) {
    console.log('Failed to parse enterprise tokens');
  }
}

// Show the same token in both places
if (authToken && enterpriseTokens) {
  try {
    const enterpriseParsed = JSON.parse(enterpriseTokens);
    console.log('Token match:', authToken === enterpriseParsed.accessToken ? 'YES' : 'NO');
  } catch (e) {
    console.log('Cannot compare tokens due to parse error');
  }
}
