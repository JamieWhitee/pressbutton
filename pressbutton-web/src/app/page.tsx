"use client";
import React, { useState } from "react";
import Navigation from "../components/Navigation";

/**
 * Homepage component - "Will You Press The Button?" game
 * Features: Navigation bar + press/don't press button choices with benefits vs consequences
 * Uses Instagram-inspired gradient styling for consistency
 */
export default function Home() {
  // TODO: Replace with API call to fetch questions from database
  // API endpoint: GET /api/questions/random
  const [currentQuestion] = useState({
    id: 1,
    benefit: "You can be the richest person in the world",
    consequence: "But video games will no longer be made",
    pressVotes: 1247,
    notPressVotes: 892
  });

  // TODO: Replace with API call to fetch comments for current question
  // API endpoint: GET /api/questions/{id}/comments
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

  const [selectedOption, setSelectedOption] = useState<'PRESS' | 'NOT_PRESS' | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  /**
   * Handle voting on an option
   * @param option - The option the user selected ('PRESS' or 'NOT_PRESS')
   */
  const handleVote = (option: 'PRESS' | 'NOT_PRESS') => {
    if (hasVoted) return;

    setSelectedOption(option);
    setHasVoted(true);

    // TODO: Send vote to backend API
    // API endpoint: POST /api/questions/{id}/vote
    // Payload: { option: 'PRESS' | 'NOT_PRESS', userId?: number }
    console.log(`Voted for option ${option}`);
  };

  /**
   * Get next question (placeholder for now)
   */
  const getNextQuestion = () => {
    setHasVoted(false);
    setSelectedOption(null);
    // TODO: Fetch new random question from database
    // API endpoint: GET /api/questions/random
    // Should exclude recently shown questions for better UX
    console.log('Getting next question...');
  };

  /**
   * Handle comment submission
   * @param content - The comment text to submit
   */
  const handleCommentSubmit = async () => {
    if (!newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);

    // TODO: Submit comment to backend API
    // API endpoint: POST /api/questions/{id}/comments
    // Payload: { content: string, userId: number }
    // Should validate user authentication first
    console.log('Submitting comment:', newComment);

    // Simulate API call delay
    setTimeout(() => {
      setNewComment("");
      setIsSubmittingComment(false);
      // TODO: Refresh comments list from API after successful submission
    }, 1000);
  };

  /**
   * Handle comment like/unlike
   * @param commentId - The ID of the comment to like
   */
  const handleCommentLike = async (commentId: number) => {
    // TODO: Send like/unlike to backend API
    // API endpoint: POST /api/comments/{commentId}/like
    // Should toggle like status and update count
    console.log('Liking comment:', commentId);
  };

  /**
   * Calculate percentage for voting results
   */
  const getTotalVotes = () => currentQuestion.pressVotes + currentQuestion.notPressVotes;
  const getPercentage = (votes: number) =>
    getTotalVotes() > 0 ? Math.round((votes / getTotalVotes()) * 100) : 0;

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
              ✅ {currentQuestion.benefit}
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
              ❌ {currentQuestion.consequence}
            </div>
          </div>

          {/* Voting Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '30px'
          }}>
            {/* Press Button */}
            <button
              onClick={() => handleVote('PRESS')}
              disabled={hasVoted}
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
                cursor: hasVoted ? 'default' : 'pointer',
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
                if (!hasVoted) {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 15px 30px rgba(40, 167, 69, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!hasVoted) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <div>
                <div style={{ marginBottom: '10px', fontSize: '2rem' }}>🔴</div>
                <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>I WILL PRESS</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>THE BUTTON</div>
                {hasVoted && (
                  <div style={{
                    marginTop: '15px',
                    fontSize: '0.9rem',
                    opacity: 0.9
                  }}>
                    {getPercentage(currentQuestion.pressVotes)}% ({currentQuestion.pressVotes} votes)
                  </div>
                )}
              </div>
            </button>

            {/* Don't Press Button */}
            <button
              onClick={() => handleVote('NOT_PRESS')}
              disabled={hasVoted}
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
                cursor: hasVoted ? 'default' : 'pointer',
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
                if (!hasVoted) {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 15px 30px rgba(220, 53, 69, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!hasVoted) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <div>
                <div style={{ marginBottom: '10px', fontSize: '2rem' }}>🚫</div>
                <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>I WILL NOT</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>PRESS THE BUTTON</div>
                {hasVoted && (
                  <div style={{
                    marginTop: '15px',
                    fontSize: '0.9rem',
                    opacity: 0.9
                  }}>
                    {getPercentage(currentQuestion.notPressVotes)}% ({currentQuestion.notPressVotes} votes)
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* Next Question Button */}
          {hasVoted && (
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
            Total votes: {getTotalVotes().toLocaleString()}
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
