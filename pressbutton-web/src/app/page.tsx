'use client'; // Enable client-side functionality for React hooks

/**
 * HomePage Component - Main landing page for the press button game
 *
 * This component handles:
 * - Displaying random questions from the database
 * - User authentication and guest account creation
 * - Vote submission and results display
 * - Comment viewing and submission
 * - Three-state UX: loading, welcome screen, and main content
 *
 * The page follows Instagram-style color scheme and modern UX patterns
 * to avoid showing loading screens immediately on page load
 */

import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation'; // Navigation component for site header
import { useAuth } from '../contexts/AuthContext'; // Authentication context for user state
import { apiClient } from '../lib/api'; // API client for backend communication
import { questionsApi, type Question } from '../lib/api/questions'; // Questions API
import { commentsApi, type Comment } from '../lib/api/comments'; // Comments API

// Type definitions for better TypeScript support
interface VoteStats {
  pressVotes: number;
  notPressVotes: number;
}

export default function HomePage() {
  // Authentication state from context
  const { user } = useAuth();

  // Core application state
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Start with false to avoid immediate loading screen
  const [error, setError] = useState('');

  // Voting state management
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'PRESS' | 'DONT_PRESS' | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  // Guest account creation state
  const [isCreatingGuestAccount, setIsCreatingGuestAccount] = useState(false);

  // Comments state management
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Pagination for comments
  const [currentCommentsPage, setCurrentCommentsPage] = useState(1);
  const [totalCommentsPages, setTotalCommentsPages] = useState(1);
  const [isLoadingMoreComments, setIsLoadingMoreComments] = useState(false);

  /**
   * Fetch a random question from the API
   * This function handles loading states and error management
   */
  const fetchRandomQuestion = async () => {
    try {
      setIsLoading(true);
      setError('');

      const questions = await questionsApi.getAll();

      if (questions && questions.length > 0) {
        // Get a random question from the list
        const randomIndex = Math.floor(Math.random() * questions.length);
        const randomQuestion = questions[randomIndex];

        if (randomQuestion) {
          setCurrentQuestion(randomQuestion);
          setHasVoted(false);
          setSelectedOption(null);

          // Reset comments when new question loads
          setComments([]);
          setCurrentCommentsPage(1);
          setTotalCommentsPages(1);
          setCommentsError('');

          // Auto-load comments for the new question
          fetchComments(randomQuestion.id);
        }
      } else {
        setError('No questions available at the moment.');
      }
    } catch (err: any) {
      console.error('Error fetching question:', err);
      setError(err.message || 'Failed to load question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle user vote submission
   * @param option - The voting choice: 'PRESS' or 'DONT_PRESS'
   */
  const handleVote = async (option: 'PRESS' | 'DONT_PRESS') => {
    if (!user || !currentQuestion || hasVoted) return;

    try {
      setIsVoting(true);
      setSelectedOption(option);

      console.log('Submitting vote:', { questionId: currentQuestion.id, choice: option, user });

      const voteResult = await questionsApi.vote(currentQuestion.id, { choice: option });
      console.log('Vote submitted successfully:', voteResult);

      setHasVoted(true);

      // Refresh question data to get updated vote counts and statistics
      console.log('Fetching updated question data...');
      const updatedQuestion = await questionsApi.getById(String(currentQuestion.id));
      console.log('Updated question:', updatedQuestion);

      if (updatedQuestion) {
        setCurrentQuestion(updatedQuestion);
      }
    } catch (err: any) {
      console.error('Error submitting vote:', err);
      console.error('Error details:', { message: err.message, stack: err.stack, response: err.response });
      setError(err.message || 'Failed to submit vote. Please try again.');
      setSelectedOption(null);
      setHasVoted(false);
    } finally {
      setIsVoting(false);
    }
  };

  /**
   * Create a guest account for anonymous users
   * This allows temporary participation without full registration
   */
  const handleGuestSignup = async () => {
    try {
      setIsCreatingGuestAccount(true);

      const response = await apiClient.createGuestAccount();

      if (response.access_token) {
        // Token is automatically stored by the apiClient
        // Reload the page to update authentication state
        window.location.reload();
      }
    } catch (err: any) {
      console.error('Error creating guest account:', err);
      setError(err.message || 'Failed to create guest account. Please try again.');
    } finally {
      setIsCreatingGuestAccount(false);
    }
  };

  /**
   * Load next random question
   * This is the main navigation function for question browsing
   */
  const getNextQuestion = () => {
    fetchRandomQuestion();
  };

  /**
   * Fetch comments for a specific question
   * @param questionId - The ID of the question to fetch comments for
   * @param page - The page number for pagination (default: 1)
   */
  const fetchComments = async (questionId: number, page: number = 1) => {
    try {
      if (page === 1) {
        setIsLoadingComments(true);
      } else {
        setIsLoadingMoreComments(true);
      }
      setCommentsError('');

      const commentsData = await commentsApi.getByQuestion(questionId.toString());

      console.log('Comments data received:', commentsData, 'Type:', typeof commentsData, 'Is Array:', Array.isArray(commentsData));

      if (commentsData) {
        // Ensure commentsData is always an array
        const commentsArray = Array.isArray(commentsData) ? commentsData : [];

        if (page === 1) {
          setComments(commentsArray);
        } else {
          setComments(prev => [...prev, ...commentsArray]);
        }

        // Note: The API doesn't return pagination info, so we'll show all comments
        setCurrentCommentsPage(1);
        setTotalCommentsPages(1);
      }
    } catch (err: any) {
      console.error('Error fetching comments:', err);
      setCommentsError(err.message || 'Failed to load comments.');
    } finally {
      setIsLoadingComments(false);
      setIsLoadingMoreComments(false);
    }
  };

  /**
   * Submit a new comment for the current question
   * Only available to authenticated users
   */
  const handleCommentSubmit = async () => {
    if (!user || !currentQuestion || !newComment.trim()) return;

    try {
      setIsSubmittingComment(true);

      await commentsApi.create({
        questionId: currentQuestion.id,
        content: newComment.trim()
      });

      setNewComment('');

      // Reload comments to show the new one
      fetchComments(currentQuestion.id);
    } catch (err: any) {
      console.error('Error submitting comment:', err);
      setError(err.message || 'Failed to submit comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  /**
   * Load more comments for pagination
   */
  const handleLoadMoreComments = () => {
    if (currentQuestion && currentCommentsPage < totalCommentsPages) {
      fetchComments(currentQuestion.id, currentCommentsPage + 1);
    }
  };

  /**
   * Calculate vote statistics for display
   * @returns Object with percentage breakdowns of votes
   */
  const getVoteStats = (): VoteStats => {
    if (!currentQuestion?.votes || currentQuestion.votes.length === 0) {
      return { pressVotes: 50, notPressVotes: 50 };
    }

    // Count PRESS and DONT_PRESS votes
    const pressCount = currentQuestion.votes.filter(v => v.choice === 'PRESS').length;
    const dontPressCount = currentQuestion.votes.filter(v => v.choice === 'DONT_PRESS').length;
    const total = pressCount + dontPressCount;

    if (total === 0) {
      return { pressVotes: 50, notPressVotes: 50 };
    }

    return {
      pressVotes: Math.round((pressCount / total) * 100),
      notPressVotes: Math.round((dontPressCount / total) * 100)
    };
  };

  /**
   * Get total vote count for display
   * @returns Total number of votes for the current question
   */
  const getTotalVotes = (): number => {
    return currentQuestion?._count?.votes || 0;
  };

  /**
   * Load initial question when component mounts
   */
  useEffect(() => {
    fetchRandomQuestion();
  }, []); // Empty dependency array = run once on mount

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e91e63, #9c27b0, #ff9800)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Navigation Header */}
      <Navigation />

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        paddingTop: '100px' // Account for fixed navigation
      }}>
        {/* Three-state conditional rendering: loading, welcome, or main content */}
        {isLoading ? (
          /* Loading State - Only shown during actual data fetching */
          /* 加载状态 - 仅在实际获取数据时显示 */
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '20px',
              animation: 'spin 2s linear infinite'
            }}>⏳</div>
            <h2 style={{
              color: '#495057',
              fontSize: '1.8rem',
              fontWeight: 'bold',
              marginBottom: '15px'
            }}>
              Loading Question...
            </h2>
            <p style={{
              color: '#6c757d',
              fontSize: '1.1rem'
            }}>
              Finding an interesting dilemma for you!
            </p>
          </div>
        ) : !currentQuestion ? (
          /* Welcome State - Shown when no question is loaded yet */
          /* 欢迎状态 - 在还没有加载问题时显示 */
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '30px' }}>🔴</div>
            <h1 style={{
              color: '#2c3e50',
              fontSize: '3rem',
              fontWeight: 'bold',
              marginBottom: '20px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}>
              Will You Press The Button?
            </h1>
            <p style={{
              color: '#34495e',
              fontSize: '1.3rem',
              marginBottom: '40px',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto 40px'
            }}>
              Welcome to the ultimate decision-making game! Each question presents you with a moral dilemma,
              benefit, and consequence. The choice is yours - but choose wisely!
            </p>
            <button
              onClick={fetchRandomQuestion}
              style={{
                background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                color: 'white',
                padding: '20px 40px',
                borderRadius: '50px',
                border: 'none',
                fontSize: '1.3rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(231, 76, 60, 0.3)',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(231, 76, 60, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(231, 76, 60, 0.3)';
              }}
            >
              🎮 Start Playing!
            </button>
          </div>
        ) : (
          /* Main Content State - Question display and interaction */
          /* 主要内容状态 - 问题显示和交互 */
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            {/* Question Content */}
            <div style={{ marginBottom: '40px' }}>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#2c3e50',
                marginBottom: '25px',
                textAlign: 'center',
                lineHeight: '1.3'
              }}>
                Will You Press The Button?
              </h1>

              <div style={{
                fontSize: '1.2rem',
                color: '#34495e',
                marginBottom: '30px',
                lineHeight: '1.6',
                textAlign: 'center'
              }}>
                Here's the deal: pressing this button will have both positive and negative consequences.
                What will you choose?
              </div>

              {/* Outcomes Display */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '25px',
                marginBottom: '30px'
              }}>
                {/* Positive Outcome */}
                <div style={{
                  padding: '25px',
                  background: 'linear-gradient(135deg, #d5f4e6, #c3f0d8)',
                  borderRadius: '15px',
                  border: '2px solid #27ae60'
                }}>
                  <h3 style={{
                    color: '#27ae60',
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    marginBottom: '15px',
                    textAlign: 'center'
                  }}>
                    ✅ You Will Get
                  </h3>
                  <p style={{
                    color: '#2d5a3d',
                    fontSize: '1.1rem',
                    lineHeight: '1.5',
                    textAlign: 'center'
                  }}>
                    {currentQuestion.positiveOutcome}
                  </p>
                </div>

                {/* Negative Outcome */}
                <div style={{
                  padding: '25px',
                  background: 'linear-gradient(135deg, #fadbd8, #f5b7b1)',
                  borderRadius: '15px',
                  border: '2px solid #e74c3c'
                }}>
                  <h3 style={{
                    color: '#e74c3c',
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    marginBottom: '15px',
                    textAlign: 'center'
                  }}>
                    ❌ But You Will Also
                  </h3>
                  <p style={{
                    color: '#5d2e2e',
                    fontSize: '1.1rem',
                    lineHeight: '1.5',
                    textAlign: 'center'
                  }}>
                    {currentQuestion.negativeOutcome}
                  </p>
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
                    >
                      Sign Up
                    </a>
                    <button
                      onClick={handleGuestSignup}
                      disabled={isCreatingGuestAccount}
                      style={{
                        background: isCreatingGuestAccount
                          ? '#6c757d'
                          : 'linear-gradient(135deg, #6f42c1, #e83e8c)',
                        color: 'white',
                        padding: '12px 30px',
                        borderRadius: '25px',
                        border: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: isCreatingGuestAccount ? 'default' : 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(111, 66, 193, 0.3)'
                      }}
                    >
                      {isCreatingGuestAccount ? '⏳ Creating...' : '👤 Continue as Guest'}
                    </button>
                  </div>
                </div>
              ) : !hasVoted ? (
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
                    disabled={isVoting}
                    style={{
                      background: 'linear-gradient(135deg, #28a745, #20c997)',
                      border: 'none',
                      borderRadius: '15px',
                      padding: '30px 20px',
                      color: 'white',
                      fontSize: '1.3rem',
                      fontWeight: 'bold',
                      cursor: isVoting ? 'default' : 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'center',
                      lineHeight: '1.4',
                      minHeight: '120px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
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
                    </div>
                  </button>

                  {/* Don't Press Button */}
                  <button
                    onClick={() => handleVote('DONT_PRESS')}
                    disabled={isVoting}
                    style={{
                      background: 'linear-gradient(135deg, #dc3545, #e74c3c)',
                      border: 'none',
                      borderRadius: '15px',
                      padding: '30px 20px',
                      color: 'white',
                      fontSize: '1.3rem',
                      fontWeight: 'bold',
                      cursor: isVoting ? 'default' : 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'center',
                      lineHeight: '1.4',
                      minHeight: '120px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <div>
                      <div style={{ marginBottom: '10px', fontSize: '2rem' }}>
                        {isVoting && selectedOption === 'DONT_PRESS' ? '⏳' : '🚫'}
                      </div>
                      <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>
                        {isVoting && selectedOption === 'DONT_PRESS' ? 'VOTING...' : 'I WILL NOT'}
                      </div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>PRESS THE BUTTON</div>
                    </div>
                  </button>
                </div>
              ) : (
                /* Vote Results for Users who have voted */
                /* 已投票用户的投票结果 */
                <div style={{
                  textAlign: 'center',
                  marginBottom: '30px',
                  padding: '30px',
                  background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                  borderRadius: '15px'
                }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    marginBottom: '20px',
                    color: '#495057'
                  }}>
                    Your Vote: {selectedOption === 'PRESS' ? '🔴 I WILL PRESS' : '🚫 I WILL NOT PRESS'} THE BUTTON
                  </h3>

                  {/* Only show detailed results to logged-in users who have voted */}
                  {user && hasVoted ? (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '20px',
                      marginTop: '20px'
                    }}>
                      <div style={{
                        background: selectedOption === 'PRESS' ? '#28a745' : '#f0f0f0',
                        color: selectedOption === 'PRESS' ? 'white' : '#666',
                        padding: '20px',
                        borderRadius: '10px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>PRESS</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '10px 0' }}>
                          {getVoteStats().pressVotes}%
                        </div>
                        <div style={{ fontSize: '0.9rem' }}>
                          ({Math.floor(getVoteStats().pressVotes / 100 * (currentQuestion._count?.votes || 0))} votes)
                        </div>
                      </div>

                      <div style={{
                        background: selectedOption === 'DONT_PRESS' ? '#dc3545' : '#f0f0f0',
                        color: selectedOption === 'DONT_PRESS' ? 'white' : '#666',
                        padding: '20px',
                        borderRadius: '10px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>DON'T PRESS</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '10px 0' }}>
                          {getVoteStats().notPressVotes}%
                        </div>
                        <div style={{ fontSize: '0.9rem' }}>
                          ({Math.floor(getVoteStats().notPressVotes / 100 * (currentQuestion._count?.votes || 0))} votes)
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Blurred/Mosaic effect for non-logged users or before voting */
                    /* 未登录用户或投票前的马赛克效果 */
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '20px',
                      marginTop: '20px',
                      filter: 'blur(8px)',
                      pointerEvents: 'none',
                      opacity: 0.6
                    }}>
                      <div style={{
                        background: '#f0f0f0',
                        color: '#666',
                        padding: '20px',
                        borderRadius: '10px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>PRESS</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '10px 0' }}>
                          ??%
                        </div>
                        <div style={{ fontSize: '0.9rem' }}>
                          (?? votes)
                        </div>
                      </div>

                      <div style={{
                        background: '#f0f0f0',
                        color: '#666',
                        padding: '20px',
                        borderRadius: '10px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>DON'T PRESS</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '10px 0' }}>
                          ??%
                        </div>
                        <div style={{ fontSize: '0.9rem' }}>
                          (?? votes)
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show login prompt and total votes only for non-logged users */}
                  {!user && (
                    <div style={{
                      marginTop: '20px',
                      padding: '15px',
                      background: 'rgba(255, 193, 7, 0.1)',
                      borderRadius: '10px',
                      border: '1px solid #ffc107'
                    }}>
                      <div style={{ color: '#856404', fontSize: '0.9rem', textAlign: 'center' }}>
                        🔒 <strong>Login required</strong> to see detailed voting results!
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Next Question Button */}
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <button
                  onClick={getNextQuestion}
                  style={{
                    background: 'linear-gradient(135deg, #ff9800, #ff5722)',
                    color: 'white',
                    padding: '15px 30px',
                    borderRadius: '25px',
                    border: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)'
                  }}
                >
                  Next Question →
                </button>
              </div>

              {/* Comments Section */}
              <div style={{
                marginTop: '40px',
                padding: '30px',
                background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                borderRadius: '15px',
                border: '1px solid #dee2e6',
                position: 'relative'
              }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '20px',
                  color: '#495057',
                  textAlign: 'center'
                }}>
                  💬 Comments ({user ? (currentQuestion?._count?.comments || 0) : '??'})
                </h3>

                {/* Show blurred content for non-logged users */}
                {!user ? (
                  <div style={{ position: 'relative' }}>
                    {/* Blurred comment content */}
                    <div style={{
                      filter: 'blur(8px)',
                      pointerEvents: 'none',
                      opacity: 0.6
                    }}>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        padding: '20px',
                        marginBottom: '15px',
                        borderRadius: '10px',
                        border: '1px solid #e9ecef'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          marginBottom: '10px'
                        }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)'
                          }}></div>
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>User Name</div>
                            <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>Sep 3, 2025, 08:52 PM</div>
                          </div>
                        </div>
                        <div style={{ color: '#495057', lineHeight: '1.5', fontSize: '1rem' }}>
                          This is a sample comment that shows what comments look like. Login to see real comments and participate in discussions!
                        </div>
                      </div>

                      <div style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        padding: '20px',
                        marginBottom: '15px',
                        borderRadius: '10px',
                        border: '1px solid #e9ecef'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          marginBottom: '10px'
                        }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)'
                          }}></div>
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Another User</div>
                            <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>Sep 3, 2025, 08:45 PM</div>
                          </div>
                        </div>
                        <div style={{ color: '#495057', lineHeight: '1.5', fontSize: '1rem' }}>
                          Another example comment to show how the comment section works. Join the conversation by creating an account!
                        </div>
                      </div>
                    </div>

                    {/* Login prompt overlay */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: 'rgba(255, 255, 255, 0.95)',
                      padding: '30px',
                      borderRadius: '15px',
                      textAlign: 'center',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                      border: '2px solid #007bff'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '15px' }}>🔒</div>
                      <h4 style={{
                        color: '#495057',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        marginBottom: '10px'
                      }}>
                        Login to View Comments
                      </h4>
                      <p style={{
                        color: '#6c757d',
                        fontSize: '0.9rem',
                        marginBottom: '20px'
                      }}>
                        Join the conversation and share your thoughts!
                      </p>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <a
                          href="/users/login"
                          style={{
                            background: 'linear-gradient(135deg, #007bff, #0056b3)',
                            color: 'white',
                            padding: '8px 20px',
                            borderRadius: '20px',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 'bold'
                          }}
                        >
                          Login
                        </a>
                        <a
                          href="/users/register"
                          style={{
                            background: 'linear-gradient(135deg, #28a745, #20c997)',
                            color: 'white',
                            padding: '8px 20px',
                            borderRadius: '20px',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 'bold'
                          }}
                        >
                          Sign Up
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Actual comments for logged-in users */
                  <div>
                    {/* Comment Form - Only for logged-in users */}
                    <div style={{
                      marginBottom: '25px',
                      padding: '20px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '10px'
                    }}>
                      <form onSubmit={(e) => { e.preventDefault(); handleCommentSubmit(); }}>
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Share your thoughts about this question..."
                          style={{
                            width: '100%',
                            minHeight: '100px',
                            padding: '15px',
                            border: '1px solid #ced4da',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            resize: 'vertical',
                            fontFamily: 'inherit'
                          }}
                          maxLength={1000}
                        />
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: '10px'
                        }}>
                          <div style={{
                            fontSize: '0.9rem',
                            color: newComment.length > 1000 ? '#dc3545' : '#6c757d'
                          }}>
                            {newComment.length}/1000 characters
                          </div>
                          <button
                            type="submit"
                            disabled={!newComment.trim() || isSubmittingComment || newComment.length > 1000}
                            style={{
                              background: !newComment.trim() || isSubmittingComment || newComment.length > 1000
                                ? '#6c757d'
                                : 'linear-gradient(135deg, #007bff, #0056b3)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '20px',
                              padding: '10px 20px',
                              fontSize: '0.9rem',
                              fontWeight: 'bold',
                              cursor: !newComment.trim() || isSubmittingComment || newComment.length > 1000 ? 'not-allowed' : 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {isSubmittingComment ? '🔄 Posting...' : '📝 Post Comment'}
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Comments List */}
                    <div>
                      {isLoadingComments ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
                          <div>Loading comments...</div>
                        </div>
                      ) : commentsError ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#dc3545' }}>
                          <div>{commentsError}</div>
                          <button
                            onClick={() => currentQuestion && fetchComments(currentQuestion.id)}
                            style={{
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '5px',
                              padding: '8px 16px',
                              marginTop: '10px',
                              cursor: 'pointer'
                            }}
                          >
                            Retry
                          </button>
                        </div>
                      ) : comments.length === 0 ? (
                        <div style={{
                          textAlign: 'center',
                          padding: '40px',
                          color: '#6c757d',
                          fontSize: '1.1rem'
                        }}>
                          No comments yet. Be the first to share your thoughts!
                        </div>
                      ) : (
                        comments.map((comment) => (
                          <div
                            key={comment.id}
                            style={{
                              background: 'rgba(255, 255, 255, 0.9)',
                              padding: '20px',
                              marginBottom: '15px',
                              borderRadius: '10px',
                              border: '1px solid #e9ecef'
                            }}
                          >
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '10px'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                              }}>
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '0.9rem'
                                }}>
                                  {comment.user.name?.charAt(0).toUpperCase() || comment.user.email?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                  <div style={{
                                    fontWeight: 'bold',
                                    color: '#495057',
                                    fontSize: '0.9rem'
                                  }}>
                                    {comment.user.name || 'User'}
                                  </div>
                                  <div style={{
                                    fontSize: '0.8rem',
                                    color: '#6c757d'
                                  }}>
                                    {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div style={{
                              color: '#495057',
                              lineHeight: '1.5',
                              fontSize: '1rem'
                            }}>
                              {comment.content}
                            </div>
                          </div>
                        ))
                      )}

                      {/* Load More Comments Button */}
                      {comments.length > 0 && currentCommentsPage < totalCommentsPages && (
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                          <button
                            disabled={isLoadingMoreComments}
                            style={{
                              background: isLoadingMoreComments
                                ? '#6c757d'
                                : 'linear-gradient(135deg, #28a745, #20c997)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '20px',
                              padding: '10px 20px',
                              fontSize: '0.9rem',
                              fontWeight: 'bold',
                              cursor: isLoadingMoreComments ? 'default' : 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                            onClick={handleLoadMoreComments}
                          >
                            {isLoadingMoreComments ? '⏳ Loading...' : `📄 Load More Comments (${currentCommentsPage}/${totalCommentsPages})`}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Question Details Button - available for all users */}
              <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>
                <button
                  onClick={() => window.location.href = `/questions/${currentQuestion.id}`}
                  style={{
                    background: 'linear-gradient(135deg, #6f42c1, #8b5cf6)',
                    border: 'none',
                    borderRadius: '25px',
                    padding: '12px 30px',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(111, 66, 193, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(111, 66, 193, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(111, 66, 193, 0.3)';
                  }}
                >
                  💬 View All Comments & Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          background: 'linear-gradient(135deg, #f8d7da, #f5c6cb)',
          borderRadius: '10px',
          marginTop: '20px',
          border: '1px solid #f1aeb5'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚠️</div>
          <div style={{ color: '#842029', fontSize: '1.1rem' }}>
            {error}
          </div>
          <button
            onClick={() => setError('')}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              padding: '8px 16px',
              marginTop: '10px',
              cursor: 'pointer'
            }}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
