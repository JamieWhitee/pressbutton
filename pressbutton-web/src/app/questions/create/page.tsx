"use client";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import Navigation from '../../../components/Navigation';
import { useRouter } from 'next/navigation';
import { questionsApi } from '../../../lib/api/questions';
import { useAuth } from '../../../contexts/AuthContext';
import ErrorMessage from '../../../components/ErrorMessage';

export default function CreateQuestionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  // Validation schema for question creation
  // 问题创建的验证模式 - 与后端验证保持一致
  const schema = yup.object({
    positiveOutcome: yup.string()
      .required("好的结果是必需的")
      .min(5, "请提供更多细节（至少5个字符）")
      .max(500, "保持合理长度（最多500个字符）"),
    negativeOutcome: yup.string()
      .required("坏的结果是必需的")
      .min(5, "请提供更多细节（至少5个字符）")
      .max(500, "保持合理长度（最多500个字符）"),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e91e63, #9c27b0, #ff9800)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <Navigation />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 60px)',
        padding: '20px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          padding: '40px',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '10px',
            background: 'linear-gradient(135deg, #e91e63, #9c27b0, #ff9800)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            width: '100%'
          }}>
            创建按钮困境
          </h1>

          <p style={{
            textAlign: 'center',
            color: '#666',
            marginBottom: '20px',
            fontSize: '1.1rem'
          }}>
            创建一个道德困境：如果有人按下按钮，会发生什么好事和坏事？
          </p>

          {/* Error message display / 错误消息显示 */}
          {error && (
            <div style={{ width: '100%', marginBottom: '20px' }}>
              <ErrorMessage error={error} />
            </div>
          )}

          <form onSubmit={handleSubmit(async (data) => {
            // Check if user is authenticated before creating question
            // 在创建问题前检查用户是否已认证
            if (!user) {
              setError('你需要登录才能创建问题');
              return;
            }

            setIsLoading(true);
            setError(null);
            
            try {
              // Call the real API to create question
              // JWT token is automatically included by the API client
              // 调用真实API创建问题，JWT令牌由API客户端自动包含
              const newQuestion = await questionsApi.create({
                positiveOutcome: data.positiveOutcome,
                negativeOutcome: data.negativeOutcome,
              });

              console.log('Question created successfully:', newQuestion);

              // Navigate to the profile page or questions list
              // 导航到个人资料页面或问题列表
              router.push('/users/profile');
            } catch (error) {
              console.error('Failed to create question:', error);
              
              // Handle different types of errors
              // 处理不同类型的错误
              if (error instanceof Error) {
                if (error.message.includes('Unauthorized') || error.message.includes('401')) {
                  setError('认证已过期，请重新登录');
                } else if (error.message.includes('validation') || error.message.includes('400')) {
                  setError('输入验证失败，请检查你的内容');
                } else {
                  setError(`创建问题失败: ${error.message}`);
                }
              } else {
                setError('创建问题时发生未知错误');
              }
            } finally {
              setIsLoading(false);
            }
          })} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '25px',
            width: '100%',
            alignItems: 'center'
          }}>

            <div style={{ width: '100%' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#2d3748'
              }}>
                ✅ 按下按钮会发生的好事：
              </label>
              <textarea
                placeholder="你将变得富有和出名，住在豪宅里，再也不用担心金钱..."
                {...register("positiveOutcome")}
                style={{
                  width: '100%',
                  minHeight: '120px',
                  maxHeight: '200px',
                  padding: '15px',
                  fontSize: '16px',
                  borderRadius: '12px',
                  border: errors.positiveOutcome ? '2px solid #ef4444' : '2px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  resize: 'vertical',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  lineHeight: '1.5'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#e91e63';
                  e.target.style.boxShadow = '0 0 0 3px rgba(233, 30, 99, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.positiveOutcome ? '#ef4444' : '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.positiveOutcome && (
                <p style={{
                  color: '#ef4444',
                  fontSize: '0.875rem',
                  marginTop: '5px',
                  marginLeft: '5px'
                }}>
                  {errors.positiveOutcome.message}
                </p>
              )}
            </div>

            <div style={{ width: '100%' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#2d3748'
              }}>
                ❌ 按下按钮会发生的坏事：
              </label>
              <textarea
                placeholder="你将失去所有家人，朋友抛弃你，你会变得完全孤独..."
                {...register("negativeOutcome")}
                style={{
                  width: '100%',
                  minHeight: '120px',
                  maxHeight: '200px',
                  padding: '15px',
                  fontSize: '16px',
                  borderRadius: '12px',
                  border: errors.negativeOutcome ? '2px solid #ef4444' : '2px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  resize: 'vertical',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  lineHeight: '1.5'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#e91e63';
                  e.target.style.boxShadow = '0 0 0 3px rgba(233, 30, 99, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.negativeOutcome ? '#ef4444' : '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.negativeOutcome && (
                <p style={{
                  color: '#ef4444',
                  fontSize: '0.875rem',
                  marginTop: '5px',
                  marginLeft: '5px'
                }}>
                  {errors.negativeOutcome.message}
                </p>
              )}
            </div>

            <div style={{
              display: 'flex',
              gap: '15px',
              width: '100%',
              marginTop: '10px'
            }}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                style={{ flex: 1 }}
              >
                取消
              </Button>

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                style={{ flex: 1 }}
              >
                创建问题
              </Button>
            </div>
          </form>

          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: 'rgba(233, 30, 99, 0.1)',
            borderRadius: '10px',
            fontSize: '0.9rem',
            color: '#666',
            textAlign: 'center'
          }}>
            <strong>💡 提示：</strong> 最好的问题会创造艰难的道德困境。
            让好的结果诱人，让坏的结果真正令人担忧！
          </div>
        </div>
      </div>
    </div>
  );
}
