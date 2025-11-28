"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navigation from "../../../components/Navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { questionsApi, type Question, type VoteRequest } from "../../../lib/api/questions-new";
import { commentsApi, type Comment, type CreateCommentRequest } from "../../../lib/api/comments";

/**
 * Question Details Page - Shows question details with comments
 * 问题详情页面 - 显示问题详情和评论
 */
export default function QuestionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const questionId = parseInt(params['id'] as string);

  // Question state
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [questionError, setQuestionError] = useState<string | null>(null);

  // Vote state
  const [selectedOption, setSelectedOption] = useState<'PRESS' | 'DONT_PRESS' | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMoreComments, setIsLoadingMoreComments] = useState(false);

  const COMMENTS_PER_PAGE = 10;

  /**
   * Fetch question details
   */
  const fetchQuestion = async () => {
    try {
      setIsLoadingQuestion(true);
      setQuestionError(null);

      const questionData = await questionsApi.getById(questionId);
      setQuestion(questionData);

      // Check if user has voted on this question
      if (user) {
        try {
          const userVote = await questionsApi.getUserVote(questionId);
          if (userVote) {
            setHasVoted(true);
            setSelectedOption(userVote.choice);
          }
        } catch (error) {
          // If error getting user vote, user probably hasn't voted yet
          console.log('No existing vote found for user');
        }
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      setQuestionError(error instanceof Error ? error.message : 'Failed to load question');
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  /**
   * Fetch comments for the question
   */
  const fetchComments = async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setIsLoadingComments(true);
      } else {
        setIsLoadingMoreComments(true);
      }
      setCommentsError(null);

      const { comments: newComments, pagination } = await commentsApi.getByQuestionId(
        questionId,
        page,
        COMMENTS_PER_PAGE
      );

      if (append) {
        setComments(prev => [...prev, ...newComments]);
      } else {
        setComments(newComments);
      }

      setCurrentPage(pagination.page);
      setTotalPages(pagination.totalPages);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setCommentsError(error instanceof Error ? error.message : 'Failed to load comments');
    } finally {
      setIsLoadingComments(false);
      setIsLoadingMoreComments(false);
    }
  };

  /**
   * Handle voting
   */
  const handleVote = async (choice: 'PRESS' | 'DONT_PRESS') => {
    if (!user) {
      alert('请先登录再投票');
      return;
    }

    if (hasVoted) {
      alert('你已经对这个问题投过票了');
      return;
    }

    try {
      setIsVoting(true);
      setSelectedOption(choice);

      const voteData: VoteData = {
        choice,
      };

      await questionsApi.vote(questionId, voteData);
      setHasVoted(true);

      // Refresh question data to get updated vote counts
      await fetchQuestion();
    } catch (error) {
      console.error('Error voting:', error);
      setSelectedOption(null);
      alert(error instanceof Error ? error.message : '投票失败，请重试');
    } finally {
      setIsVoting(false);
    }
  };

  /**
   * Handle comment submission
   */
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('请先登录再评论');
      return;
    }

    if (!newComment.trim()) {
      alert('评论内容不能为空');
      return;
    }

    if (newComment.length > 1000) {
      alert('评论内容不能超过1000字符');
      return;
    }

    try {
      setIsSubmittingComment(true);

      const commentData: CreateCommentData = {
        content: newComment.trim(),
        questionId,
      };

      await commentsApi.create(commentData);
      setNewComment("");

      // Refresh comments to show the new one
      await fetchComments(1, false);
    } catch (error) {
      console.error('Error creating comment:', error);
      alert(error instanceof Error ? error.message : '发表评论失败，请重试');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  /**
   * Load more comments
   */
  const handleLoadMoreComments = () => {
    if (currentPage < totalPages && !isLoadingMoreComments) {
      fetchComments(currentPage + 1, true);
    }
  };

  /**
   * Format relative time for comments
   */
  const formatCommentTime = (createdAt: string): string => {
    const now = new Date();
    const commentTime = new Date(createdAt);
    const diffInSeconds = Math.floor((now.getTime() - commentTime.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return '刚刚';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}分钟前`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}小时前`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}天前`;
    }
  };

  /**
   * Get user display name
   */
  const getUserDisplayName = (user: Comment['user']): string => {
    return user.name || user.email.split('@')[0] || '匿名用户';
  };

  // Initial data loading
  useEffect(() => {
    if (questionId && !isNaN(questionId)) {
      fetchQuestion();
      fetchComments();
    } else {
      setQuestionError('Invalid question ID');
      setIsLoadingQuestion(false);
    }
  }, [questionId]);

  // Loading state - clean fullscreen loading without navigation clutter
  // 加载状态 - 清洁的全屏加载界面，无导航栏干扰
  if (isLoadingQuestion) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e91e63, #9c27b0, #ff9800)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          width: '90%'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎲</div>
          <h2 style={{ fontSize: '1.5rem', color: '#333', margin: 0 }}>
            加载问题详情中...
          </h2>
        </div>
      </div>
    );
  }

  if (questionError || !question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center">
              <div className="text-red-500 text-6xl mb-4">😞</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">问题未找到</h2>
              <p className="text-gray-600 mb-6">{questionError || '这个问题可能已被删除或不存在'}</p>
              <button
                onClick={() => router.push('/')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        {/* Question Card - Same width as comments section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '30px',
          maxWidth: '800px', // Same as comments section
          width: '100%',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Simplified Header */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button
              onClick={() => router.back()}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#666',
                fontSize: '1.1rem',
                cursor: 'pointer',
                marginBottom: '10px',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#666';
              }}
            >
              ← 返回
            </button>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              Your Question
            </h1>
          </div>

          {/* Question Content */}
          <div style={{
            textAlign: 'center',
            marginBottom: '20px', // Reduced from 30px
            padding: '20px', // Reduced from 25px
            background: '#f8f9fa',
            borderRadius: '15px',
            border: '2px dashed #e0e0e0'
          }}>
            <div style={{
              fontSize: '1.2rem',
              color: '#28a745',
              fontWeight: '600',
              marginBottom: '12px' // Reduced from 15px
            }}>
              ✅ {question.positiveOutcome}
            </div>
            <div style={{
              fontSize: '1.1rem',
              color: '#666',
              fontWeight: '500',
              marginBottom: '12px' // Reduced from 15px
            }}>
              but
            </div>
            <div style={{
              fontSize: '1.2rem',
              color: '#dc3545',
              fontWeight: '600'
            }}>
              ❌ {question.negativeOutcome}
            </div>
          </div>

          {/* Voting Statistics - Always show for all users */}
          <div style={{
            textAlign: 'center',
            marginBottom: '15px', // Reduced from 20px
            padding: '20px', // Reduced from 25px
            background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
            borderRadius: '15px'
          }}>
            <h3 style={{
              fontSize: '1.2rem', // Reduced from 1.3rem
              fontWeight: 'bold',
              marginBottom: '12px', // Reduced from 15px
              color: '#495057'
            }}>
              📊 投票统计
            </h3>

            {/* Total Votes */}
            <div style={{
              fontSize: '1rem', // Reduced from 1.1rem
              color: '#666',
              marginBottom: '15px' // Reduced from 20px
            }}>
              总计 {question._count ? question._count.votes : 0} 人投票
            </div>

            {/* Vote Statistics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px', // Reduced from 15px
              marginTop: '12px' // Reduced from 15px
            }}>
              <div style={{
                background: '#28a745',
                color: 'white',
                padding: '20px',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>我会按下</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '10px 0' }}>
                  {question._count && question._count.votes > 0 && question.votes
                    ? Math.round((question.votes.filter(vote => vote.choice === 'PRESS').length / question._count.votes) * 100)
                    : 0}%
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                  ({question.votes ? question.votes.filter(vote => vote.choice === 'PRESS').length : 0} 人)
                </div>
              </div>

              <div style={{
                background: '#dc3545',
                color: 'white',
                padding: '20px',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>我不会按下</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '10px 0' }}>
                  {question._count && question._count.votes > 0 && question.votes
                    ? Math.round((question.votes.filter(vote => vote.choice === 'DONT_PRESS').length / question._count.votes) * 100)
                    : 0}%
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                  ({question.votes ? question.votes.filter(vote => vote.choice === 'DONT_PRESS').length : 0} 人)
                </div>
              </div>
            </div>
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
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '25px'
          }}>
            <h3 style={{
              fontSize: '1.8rem',
              fontWeight: 'bold',
              color: '#333',
              margin: 0
            }}>
              💬 Comments ({comments.length})
            </h3>
          </div>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleCommentSubmit} style={{ marginBottom: '30px' }}>
              <div style={{
                background: '#f8f9fa',
                borderRadius: '15px',
                padding: '20px'
              }}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts on this dilemma..."
                  style={{
                    width: '100%',
                    height: '100px',
                    padding: '15px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '10px',
                    resize: 'none',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                  maxLength={1000}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#e91e63';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e0e0e0';
                  }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '15px'
                }}>
                  <span style={{
                    fontSize: '0.9rem',
                    color: '#666'
                  }}>
                    {newComment.length}/1000 characters
                  </span>
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isSubmittingComment}
                    style={{
                      background: !newComment.trim() || isSubmittingComment
                        ? '#ccc'
                        : 'linear-gradient(135deg, #e91e63, #9c27b0)',
                      color: 'white',
                      padding: '10px 25px',
                      borderRadius: '20px',
                      border: 'none',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: !newComment.trim() || isSubmittingComment ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      opacity: !newComment.trim() || isSubmittingComment ? 0.6 : 1
                    }}
                  >
                    {isSubmittingComment ? '📝 Posting...' : '📝 Post Comment'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div style={{
              background: '#f8f9fa',
              borderRadius: '15px',
              padding: '40px',
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🔐</div>
              <p style={{
                color: '#666',
                fontSize: '1.1rem',
                marginBottom: '20px'
              }}>
                Log in to join the discussion and share your thoughts!
              </p>
              <button
                onClick={() => router.push('/users/login')}
                style={{
                  background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
                  color: 'white',
                  padding: '12px 25px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(233, 30, 99, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Login to Comment
              </button>
            </div>
          )}

          {/* Comments List */}
          {isLoadingComments ? (
            <div style={{
              textAlign: 'center',
              padding: '40px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #e91e63',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px'
              }}></div>
              <p style={{ color: '#666', fontSize: '1.1rem' }}>Loading comments...</p>
            </div>
          ) : commentsError ? (
            <div style={{
              textAlign: 'center',
              padding: '40px'
            }}>
              <p style={{ color: '#dc3545', fontSize: '1.1rem', marginBottom: '15px' }}>
                {commentsError}
              </p>
              <button
                onClick={() => fetchComments()}
                style={{
                  background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Try Again
              </button>
            </div>
          ) : comments.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '15px' }}>💭</div>
              <p style={{ color: '#666', fontSize: '1.1rem' }}>
                No comments yet. Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {comments.map((comment) => (
                <div key={comment.id} style={{
                  background: '#f8f9fa',
                  borderRadius: '15px',
                  padding: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                    <div style={{
                      width: '45px',
                      height: '45px',
                      background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {getUserDisplayName(comment.user).charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '8px'
                      }}>
                        <span style={{
                          fontWeight: 'bold',
                          color: '#333',
                          fontSize: '1.1rem'
                        }}>
                          {getUserDisplayName(comment.user)}
                        </span>
                        <span style={{
                          fontSize: '0.9rem',
                          color: '#666'
                        }}>
                          {formatCommentTime(comment.createdAt)}
                        </span>
                      </div>
                      <p style={{
                        color: '#444',
                        fontSize: '1rem',
                        lineHeight: '1.5',
                        margin: 0
                      }}>
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {currentPage < totalPages && (
                <div style={{ textAlign: 'center', paddingTop: '20px' }}>
                  <button
                    onClick={handleLoadMoreComments}
                    disabled={isLoadingMoreComments}
                    style={{
                      background: isLoadingMoreComments
                        ? '#ccc'
                        : 'linear-gradient(135deg, #e91e63, #9c27b0)',
                      color: 'white',
                      padding: '12px 25px',
                      borderRadius: '20px',
                      border: 'none',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: isLoadingMoreComments ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      opacity: isLoadingMoreComments ? 0.6 : 1
                    }}
                  >
                    {isLoadingMoreComments ? '⏳ Loading...' : `📝 Load More Comments (${currentPage}/${totalPages})`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* All Comments for the question Button */}
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button
              onClick={() => router.push(`/questions/${questionId}?viewAll=true`)}
              style={{
                background: 'linear-gradient(135deg, #6c757d, #495057)',
                color: 'white',
                padding: '12px 25px',
                borderRadius: '20px',
                border: 'none',
                fontSize: '1rem',
                fontWeight: 'bold',
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
              💬 All Comments for the question
            </button>
          </div>
        </div>
      </div>

      {/* Add keyframes for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
