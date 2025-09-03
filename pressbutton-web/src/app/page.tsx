"use client";
import React, { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import { useAuth } from "../contexts/AuthContext";
import { questionsApi, type Question, type VoteData } from "../lib/api/questions";

/**
 * Homepage component - "Will You Press The Button?" game
 * Features: Navigation bar + press/don't press button choices with benefits vs consequences
 * Uses Instagram-inspired gradient styling for consistency
 * 首页组件 - "你会按下按钮吗？"游戏
 * 功能：导航栏 + 按下/不按下按钮选择，显示好处vs后果
 * 使用Instagram风格的渐变样式保持一致性
 */
export default function Home() {
  const { user, createGuestAccount } = useAuth();
  
  // State for current question and voting
  // 当前问题和投票的状态
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<'PRESS' | 'NOT_PRESS' | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [noQuestionsAvailable, setNoQuestionsAvailable] = useState(false);
  const [isCreatingGuestAccount, setIsCreatingGuestAccount] = useState(false);

  // Comment state (keeping existing comment functionality)
  // 评论状态（保持现有评论功能）
  const [comments] = useState([
    {
      id: 1,
      username: "MoneyLover",
      content: "Money can buy happiness and solve most problems! I'd press it instantly! 💰",
      createdAt: "2024-01-20T10:30:00Z",
      likes: 25
    },
    {
      id: 2,
      username: "GamerForLife",
      content: "NO WAY! Gaming is life. I'd rather be poor than live without new games forever.",
      createdAt: "2024-01-20T09:15:00Z",
      likes: 18
    },
    {
      id: 3,
      username: "PracticalThinker",
      content: "Being rich means I could fund game development myself... loophole found! 😏",
      createdAt: "2024-01-20T08:45:00Z",
      likes: 42
    },
    {
      id: 4,
      username: "PhilosophicalSoul",
      content: "Art and entertainment are what make life worth living. Money without joy is meaningless.",
      createdAt: "2024-01-19T22:30:00Z",
      likes: 31
    }
  ]);

  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  /**
   * Fetch a random question
   * - For logged-in users: exclude questions they've already voted on
   * - For anonymous users: show any random question (they can't vote anyway)
   * 获取随机问题
   * - 对于已登录用户：排除已投票的问题
   * - 对于匿名用户：显示任意随机问题（反正不能投票）
   */
  const fetchRandomQuestion = async () => {
    try {
      setIsLoading(true);
      setNoQuestionsAvailable(false);
      
      console.log('🎲 Fetching random question for user:', user?.id || 'anonymous');
      
      // Get random question
      // For logged-in users, exclude ones they've already voted on
      // For anonymous users, just get any random question
      // 获取随机问题
      // 对于已登录用户，排除已投票的问题
      // 对于匿名用户，获取任意随机问题
      const question = await questionsApi.getRandom(user?.id);
      
      if (!question) {
        console.log('⚠️ No available questions found');
        setNoQuestionsAvailable(true);
        setCurrentQuestion(null);
      } else {
        console.log('✅ Got random question:', question.id);
        setCurrentQuestion(question);
        setHasVoted(false);
        setSelectedOption(null);
      }
    } catch (error) {
      console.error('❌ Error fetching random question:', error);
      setNoQuestionsAvailable(true);
      setCurrentQuestion(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial question on component mount
  // 组件挂载时加载初始问题
  useEffect(() => {
    fetchRandomQuestion();
  }, [user?.id]); // Re-fetch when user changes (login/logout) to get personalized questions

  /**
   * Handle voting on an option - requires user to be logged in
   * @param option - The option the user selected ('PRESS' or 'NOT_PRESS')
   * 处理投票选项 - 需要用户登录
   */
  const handleVote = async (option: 'PRESS' | 'NOT_PRESS') => {
    // Check if user is logged in first
    // 首先检查用户是否已登录
    if (!user) {
      // Don't allow voting for anonymous users
      // 不允许匿名用户投票
      return;
    }

    if (hasVoted || isVoting || !currentQuestion) {
      return;
    }

    setIsVoting(true);
    setSelectedOption(option);

    try {
      // Map frontend choice to backend format
      // 将前端选择映射到后端格式
      const voteChoice: VoteData['choice'] = option === 'PRESS' ? 'PRESS' : 'DONT_PRESS';
      
      console.log(`🗳️ Voting ${voteChoice} on question ${currentQuestion.id}`);
      
      // Submit vote to backend
      // 向后端提交投票
      await questionsApi.vote(currentQuestion.id, { choice: voteChoice });
      
      setHasVoted(true);
      console.log('✅ Vote submitted successfully');
      
    } catch (error) {
      console.error('❌ Error submitting vote:', error);
      // Reset state on error
      // 错误时重置状态
      setSelectedOption(null);
      alert('Failed to submit vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  /**
   * Handle click when user is not logged in
   * 处理未登录用户的点击
   */
  const handleLoginRequired = () => {
    alert('Please log in to vote on questions! Click on the "Login" button in the navigation.');
  };

  /**
   * Get next question
   * 获取下一个问题
   */
  const getNextQuestion = () => {
    fetchRandomQuestion();
  };

  /**
   * Handle guest account creation
   * 处理客人账号创建
   */
  const handleGuestSignup = async () => {
    if (isCreatingGuestAccount) return;

    setIsCreatingGuestAccount(true);
    try {
      await createGuestAccount();
      // After successful guest account creation, user will be automatically logged in
      // The page will re-render and show voting buttons instead of login prompt
      console.log('✅ Guest account created successfully');
    } catch (error) {
      console.error('❌ Failed to create guest account:', error);
      alert('Failed to create guest account. Please try again.');
    } finally {
      setIsCreatingGuestAccount(false);
    }
  };

  /**
   * Handle comment submission (existing functionality)
   * 处理评论提交（现有功能）
   */
  const handleCommentSubmit = async () => {
    if (!newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);

    // TODO: Submit comment to backend API
    // API endpoint: POST /api/questions/{id}/comments
    console.log('Submitting comment:', newComment);

    // Simulate API call delay
    setTimeout(() => {
      setNewComment("");
      setIsSubmittingComment(false);
      // TODO: Refresh comments list from API after successful submission
    }, 1000);
  };

  /**
   * Handle comment like/unlike (existing functionality)
   * 处理评论点赞/取消点赞（现有功能）
   */
  const handleCommentLike = async (commentId: number) => {
    // TODO: Send like/unlike to backend API
    console.log('Liking comment:', commentId);
  };

  /**
   * Calculate percentage for voting results
   * 计算投票结果百分比
   */
  const getTotalVotes = () => {
    if (!currentQuestion?._count) return 0;
    return currentQuestion._count.votes || 0;
  };

  const getVoteStats = () => {
    if (!currentQuestion?.votes) {
      return { pressVotes: 0, notPressVotes: 0 };
    }

    const pressVotes = currentQuestion.votes.filter(vote => vote.choice === 'PRESS').length;
    const notPressVotes = currentQuestion.votes.filter(vote => vote.choice === 'DONT_PRESS').length;
    
    return { pressVotes, notPressVotes };
  };

  const getPercentage = (votes: number) => {
    const total = getTotalVotes();
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  };

  // Loading state
  // 加载状态
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e91e63, #9c27b0, #ff9800)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Navigation />
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎲</div>
          <h2 style={{ fontSize: '1.5rem', color: '#333', margin: 0 }}>
            Loading random question...
          </h2>
        </div>
      </div>
    );
  }

  // No questions available state
  // 没有可用问题状态
  if (noQuestionsAvailable) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e91e63, #9c27b0, #ff9800)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <Navigation />
        <div style={{
          padding: '40px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 60px)'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '600px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🤔</div>
            <h2 style={{ 
              fontSize: '2rem', 
              color: '#333', 
              marginBottom: '15px',
              background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              No More Questions!
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '25px' }}>
              {user 
                ? "You've voted on all available questions! Check back later for new dilemmas, or create your own."
                : "No questions available right now. Please try again later or log in to see personalized content."
              }
            </p>
            <button
              onClick={getNextQuestion}
              style={{
                background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
                border: 'none',
                borderRadius: '25px',
                padding: '15px 30px',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main component render
  // 主组件渲染
  if (!currentQuestion) {
    return null;
  }

  const { pressVotes, notPressVotes } = getVoteStats();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e91e63, #9c27b0, #ff9800)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <Navigation />

      {/* Main Content */}
      <div style={{
        padding: '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '30px',
        minHeight: 'calc(100vh - 60px)' // Subtract navigation height
      }}>
        {/* Question Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '800px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '10px'
            }}>
              Will You Press The Button?
            </h1>
            <p style={{
              color: '#666',
              fontSize: '1.1rem',
              fontWeight: '500'
            }}>
              Make your choice carefully!
            </p>
          </div>

          {/* Question Content */}
          <div style={{
            textAlign: 'center',
            marginBottom: '40px',
            padding: '30px',
            background: '#f8f9fa',
            borderRadius: '15px',
            border: '2px dashed #e0e0e0'
          }}>
            <div style={{
              fontSize: '1.4rem',
              color: '#28a745',
              fontWeight: '600',
              marginBottom: '20px'
            }}>
              ✅ {currentQuestion.positiveOutcome}
            </div>
            <div style={{
              fontSize: '1.3rem',
              color: '#666',
              fontWeight: '500',
              marginBottom: '20px'
            }}>
              but
            </div>
            <div style={{
              fontSize: '1.4rem',
              color: '#dc3545',
              fontWeight: '600'
            }}>
              ❌ {currentQuestion.negativeOutcome}
            </div>
          </div>

          {/* Voting Buttons */}
          {!user ? (
            /* Login Required Section for Anonymous Users */
            /* 匿名用户需要登录的提示区域 */
            <div style={{
              textAlign: 'center',
              marginBottom: '30px',
              padding: '40px',
              background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
              borderRadius: '15px',
              border: '2px solid #dee2e6'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔐</div>
              <h3 style={{
                color: '#495057',
                fontSize: '1.8rem',
                fontWeight: 'bold',
                marginBottom: '15px'
              }}>
                Login Required to Vote
              </h3>
              <p style={{
                color: '#6c757d',
                fontSize: '1.1rem',
                marginBottom: '25px',
                lineHeight: '1.5'
              }}>
                You need to create an account and log in to participate in voting.
                <br />
                This helps us ensure fair voting and personalized question recommendations!
              </p>
              <div style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <a
                  href="/users/login"
                  style={{
                    background: 'linear-gradient(135deg, #007bff, #0056b3)',
                    color: 'white',
                    padding: '12px 30px',
                    borderRadius: '25px',
                    textDecoration: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(0, 123, 255, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 123, 255, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 123, 255, 0.3)';
                  }}
                >
                  Login
                </a>
                <a
                  href="/users/register"
                  style={{
                    background: 'linear-gradient(135deg, #28a745, #20c997)',
                    color: 'white',
                    padding: '12px 30px',
                    borderRadius: '25px',
                    textDecoration: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
                  }}
                >
                  Sign Up
                </a>
              </div>
              
              {/* Quick Guest Signup Section */}
              <div style={{ 
                marginTop: '30px', 
                padding: '20px',
                background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                borderRadius: '10px',
                border: '1px solid #dee2e6'
              }}>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  color: '#495057',
                  marginBottom: '10px',
                  textAlign: 'center'
                }}>
                  不想要复杂流程？
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#6c757d',
                  marginBottom: '15px',
                  textAlign: 'center',
                  lineHeight: '1.4'
                }}>
                  立即生成一个快速使用账号，无需填写任何信息
                </div>
                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={handleGuestSignup}
                    disabled={isCreatingGuestAccount}
                    style={{
                      background: isCreatingGuestAccount 
                        ? 'linear-gradient(135deg, #6c757d, #5a6268)' 
                        : 'linear-gradient(135deg, #ff9800, #ff5722)',
                      color: 'white',
                      padding: '12px 25px',
                      borderRadius: '25px',
                      border: 'none',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: isCreatingGuestAccount ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)',
                      opacity: isCreatingGuestAccount ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isCreatingGuestAccount) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 152, 0, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCreatingGuestAccount) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 152, 0, 0.3)';
                      }
                    }}
                  >
                    {isCreatingGuestAccount ? (
                      <>⏳ 创建中...</>
                    ) : (
                      <>🚀 生成快速账号</>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Browse Questions Button for Anonymous Users */}
              <div style={{ marginTop: '25px' }}>
                <button
                  onClick={getNextQuestion}
                  style={{
                    background: 'linear-gradient(135deg, #6c757d, #495057)',
                    color: 'white',
                    padding: '10px 25px',
                    borderRadius: '20px',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 3px 10px rgba(108, 117, 125, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(108, 117, 125, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 3px 10px rgba(108, 117, 125, 0.3)';
                  }}
                >
                  Browse Other Questions →
                </button>
              </div>
            </div>
          ) : (
            /* Voting Buttons for Logged-in Users */
            /* 已登录用户的投票按钮 */
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '30px'
            }}>
              {/* Press Button */}
              <button
                onClick={() => handleVote('PRESS')}
                disabled={hasVoted || isVoting}
                style={{
                  background: hasVoted
                    ? (selectedOption === 'PRESS' ? 'linear-gradient(135deg, #28a745, #20c997)' : '#f0f0f0')
                    : 'linear-gradient(135deg, #28a745, #20c997)',
                  border: 'none',
                  borderRadius: '15px',
                  padding: '30px 20px',
                  color: hasVoted && selectedOption !== 'PRESS' ? '#666' : 'white',
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  cursor: hasVoted || isVoting ? 'default' : 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  lineHeight: '1.4',
                  minHeight: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: hasVoted && selectedOption !== 'PRESS' ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!hasVoted && !isVoting) {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 15px 30px rgba(40, 167, 69, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!hasVoted && !isVoting) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <div>
                  <div style={{ marginBottom: '10px', fontSize: '2rem' }}>
                    {isVoting && selectedOption === 'PRESS' ? '⏳' : '🔴'}
                  </div>
                  <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>
                    {isVoting && selectedOption === 'PRESS' ? 'VOTING...' : 'I WILL PRESS'}
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>THE BUTTON</div>
                  {hasVoted && (
                    <div style={{
                      marginTop: '15px',
                      fontSize: '0.9rem',
                      opacity: 0.9
                    }}>
                      {getPercentage(getVoteStats().pressVotes)}% ({getVoteStats().pressVotes} votes)
                    </div>
                  )}
                </div>
              </button>

              {/* Don't Press Button */}
              <button
                onClick={() => handleVote('NOT_PRESS')}
                disabled={hasVoted || isVoting}
                style={{
                  background: hasVoted
                    ? (selectedOption === 'NOT_PRESS' ? 'linear-gradient(135deg, #dc3545, #e74c3c)' : '#f0f0f0')
                    : 'linear-gradient(135deg, #dc3545, #e74c3c)',
                  border: 'none',
                  borderRadius: '15px',
                  padding: '30px 20px',
                  color: hasVoted && selectedOption !== 'NOT_PRESS' ? '#666' : 'white',
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  cursor: hasVoted || isVoting ? 'default' : 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  lineHeight: '1.4',
                  minHeight: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: hasVoted && selectedOption !== 'NOT_PRESS' ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!hasVoted && !isVoting) {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 15px 30px rgba(220, 53, 69, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!hasVoted && !isVoting) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <div>
                  <div style={{ marginBottom: '10px', fontSize: '2rem' }}>
                    {isVoting && selectedOption === 'NOT_PRESS' ? '⏳' : '🚫'}
                  </div>
                  <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>
                    {isVoting && selectedOption === 'NOT_PRESS' ? 'VOTING...' : 'I WILL NOT'}
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>PRESS THE BUTTON</div>
                  {hasVoted && (
                    <div style={{
                      marginTop: '15px',
                      fontSize: '0.9rem',
                      opacity: 0.9
                    }}>
                      {getPercentage(getVoteStats().notPressVotes)}% ({getVoteStats().notPressVotes} votes)
                    </div>
                  )}
                </div>
              </button>
            </div>
          )}

          {/* Next Question Button - only show for logged-in users who have voted */}
          {/* 下一个问题按钮 - 仅对已投票的登录用户显示 */}
          {user && hasVoted && (
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={getNextQuestion}
                style={{
                  background: 'linear-gradient(135deg, #e91e63, #9c27b0, #ff9800)',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '15px 40px',
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
                }}
              >
                Next Question →
              </button>
            </div>
          )}

          {/* Stats */}
          <div style={{
            marginTop: '30px',
            textAlign: 'center',
            color: '#888',
            fontSize: '0.9rem'
          }}>
            {user ? (
              <div>Total votes: {getTotalVotes().toLocaleString()}</div>
            ) : (
              <div>
                <div style={{ marginBottom: '5px' }}>
                  Total votes: {getTotalVotes().toLocaleString()}
                </div>
                <div style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
                  Log in to see detailed voting results and participate!
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '30px',
          maxWidth: '800px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          position: 'relative'
        }}>
          {/* Mosaic Overlay - only shown when user hasn't voted */}
          {!hasVoted && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                repeating-linear-gradient(
                  45deg,
                  rgba(233, 30, 99, 0.1) 0px,
                  rgba(233, 30, 99, 0.1) 10px,
                  rgba(156, 39, 176, 0.1) 10px,
                  rgba(156, 39, 176, 0.1) 20px
                ),
                rgba(255, 255, 255, 0.8)
              `,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              backdropFilter: 'blur(5px)'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '30px',
                borderRadius: '15px',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
              }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '15px'
                }}>
                  🔒
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '10px'
                }}>
                  Vote to See Comments
                </h3>
                <p style={{
                  color: '#666',
                  fontSize: '1rem',
                  margin: 0
                }}>
                  Choose an option above to unlock the discussion!
                </p>
              </div>
            </div>
          )}

          {/* Comments Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '25px',
            paddingBottom: '15px',
            borderBottom: '2px solid #f0f0f0'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              💬 Comments ({comments.length})
            </h3>
          </div>

          {/* Add Comment Form */}
          <div style={{
            marginBottom: '30px',
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '15px',
            border: '2px dashed #e0e0e0'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={hasVoted ? "Share your thoughts on this question... 🤔" : "Vote first to comment..."}
                disabled={!hasVoted}
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '15px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                  cursor: hasVoted ? 'text' : 'not-allowed',
                  backgroundColor: hasVoted ? 'white' : '#f5f5f5'
                }}
                onFocus={(e) => {
                  if (hasVoted) {
                    e.target.style.borderColor = '#e91e63';
                  }
                }}
                onBlur={(e) => {
                  if (hasVoted) {
                    e.target.style.borderColor = '#e0e0e0';
                  }
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  color: '#888',
                  fontSize: '0.9rem'
                }}>
                  {newComment.length}/500 characters
                </span>
                <button
                  onClick={handleCommentSubmit}
                  disabled={!hasVoted || !newComment.trim() || isSubmittingComment}
                  style={{
                    background: !hasVoted || !newComment.trim() || isSubmittingComment
                      ? '#ccc'
                      : 'linear-gradient(135deg, #e91e63, #9c27b0)',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '10px 25px',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    cursor: !hasVoted || !newComment.trim() || isSubmittingComment ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {!hasVoted ? '🔒 Vote First' : isSubmittingComment ? '📝 Posting...' : '💬 Post Comment'}
                </button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {comments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  background: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '15px',
                  padding: '20px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#e91e63';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(233, 30, 99, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Comment Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* User Avatar */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1.2rem'
                    }}>
                      {comment.username.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        color: '#333'
                      }}>
                        {comment.username}
                      </div>
                      <div style={{
                        fontSize: '0.8rem',
                        color: '#888'
                      }}>
                        {new Date(comment.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Like Button */}
                  <button
                    onClick={() => handleCommentLike(comment.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      color: '#666',
                      cursor: 'pointer',
                      padding: '5px 10px',
                      borderRadius: '15px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f0f0f0';
                      e.currentTarget.style.color = '#e91e63';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                      e.currentTarget.style.color = '#666';
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>❤️</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                      {comment.likes}
                    </span>
                  </button>
                </div>

                {/* Comment Content */}
                <div style={{
                  fontSize: '1rem',
                  lineHeight: '1.5',
                  color: '#333',
                  marginLeft: '50px'
                }}>
                  {comment.content}
                </div>
              </div>
            ))}
          </div>

          {/* Load More Comments */}
          <div style={{ textAlign: 'center', marginTop: '25px' }}>
            <button
              style={{
                background: 'none',
                border: '2px solid #e91e63',
                borderRadius: '20px',
                padding: '10px 25px',
                color: '#e91e63',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e91e63';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = '#e91e63';
              }}
              onClick={() => {
                // TODO: Load more comments from API
                // API endpoint: GET /api/questions/{id}/comments?page={page}&limit={limit}
                console.log('Loading more comments...');
              }}
            >
              📄 Load More Comments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
