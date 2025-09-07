"use client";
import React, { useState, useEffect } from "react";
import Navigation from "../../components/Navigation";
import { questionsApi, type Question } from "../../lib/api/questions";
import { enterpriseLogger, OperationType } from "../../lib/logging/enterprise-logger";

/**
 * Rank page - Shows most popular questions based on total votes
 * Displays top-rated questions from the database in descending order by vote count
 * 排名页面 - 显示基于总投票数的最受欢迎问题，按投票数降序显示数据库中的热门问题
 */
export default function RankPage() {
  // State for storing top questions from database
  // 存储来自数据库的热门问题的状态
  const [topQuestions, setTopQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(15); // Number of questions to display / 显示的问题数量

  /**
   * Fetch top questions from the API
   * Uses the new /api/questions/top endpoint with vote count sorting
   * 从API获取热门问题，使用新的/api/questions/top端点按投票数排序
   */
  const fetchTopQuestions = async (questionLimit: number = 15) => {
    try {
      setLoading(true);
      setError(null);

      enterpriseLogger.info('Fetching top questions for rank page', {
        limit: questionLimit,
        component: 'RankPage'
      }, OperationType.DATA_READ);

      const questions = await questionsApi.getTop(questionLimit);

      enterpriseLogger.info('Successfully loaded top questions', {
        count: questions.length,
        component: 'RankPage',
        hasVoteData: questions.every(q => q._count?.votes !== undefined)
      }, OperationType.DATA_READ);

      setTopQuestions(questions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load top questions';

      enterpriseLogger.error('Failed to fetch top questions for rank page', {
        error: errorMessage,
        limit: questionLimit,
        component: 'RankPage'
      }, OperationType.API_ERROR);

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculate vote percentages for each question
   * Processes vote data to determine press vs don't press percentages
   * 计算每个问题的投票百分比，处理投票数据以确定按下与不按下的百分比
   */
  const calculateVoteStats = (question: Question) => {
    if (!question.votes || question.votes.length === 0) {
      return {
        totalVotes: 0,
        pressVotes: 0,
        notPressVotes: 0,
        pressPercentage: 0,
        notPressPercentage: 0
      };
    }

    const pressVotes = question.votes.filter(vote => vote.choice === 'PRESS').length;
    const notPressVotes = question.votes.filter(vote => vote.choice === 'DONT_PRESS').length;
    const totalVotes = pressVotes + notPressVotes;

    return {
      totalVotes,
      pressVotes,
      notPressVotes,
      pressPercentage: totalVotes > 0 ? Math.round((pressVotes / totalVotes) * 100) : 0,
      notPressPercentage: totalVotes > 0 ? Math.round((notPressVotes / totalVotes) * 100) : 0
    };
  };

  // Load questions when component mounts
  // 组件挂载时加载问题
  useEffect(() => {
    fetchTopQuestions(limit);
  }, [limit]);

  /**
   * Handle loading more questions
   * Increases the limit and refetches data
   * 处理加载更多问题，增加限制并重新获取数据
   */
  const handleLoadMore = () => {
    const newLimit = limit + 15;
    setLimit(newLimit);
    fetchTopQuestions(newLimit);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e91e63, #9c27b0, #ff9800)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <Navigation />

      <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: 'white',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            marginBottom: '10px'
          }}>
            🏆 Top Questions
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255, 255, 255, 0.9)',
            textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
          }}>
            Most popular questions ranked by total votes
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'white'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '20px',
              animation: 'spin 2s linear infinite'
            }}>
              ⭐
            </div>
            <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
              Loading top questions...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{
            background: 'rgba(220, 53, 69, 0.9)',
            color: 'white',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            marginBottom: '20px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚠️</div>
            <p style={{ fontSize: '1.1rem', margin: 0 }}>
              {error}
            </p>
            <button
              onClick={() => fetchTopQuestions(limit)}
              style={{
                marginTop: '15px',
                background: 'white',
                color: '#dc3545',
                border: 'none',
                borderRadius: '5px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Questions List - Only show if not loading and no error */}
        {!loading && !error && (
          <>
            <div style={{
              display: 'grid',
              gap: '25px'
            }}>
              {topQuestions.map((question, index) => {
                const stats = calculateVoteStats(question);
                return (
                  <div key={question.id} style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '20px',
                    padding: '30px',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                  }}>
                    {/* Rank Number */}
                    <div style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '20px',
                      background: 'linear-gradient(135deg, #ff6b6b, #e91e63)',
                      color: 'white',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                    }}>
                      #{index + 1}
                    </div>

                    {/* Question Content */}
                    <div style={{ marginBottom: '25px', paddingTop: '10px' }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #4caf50, #8bc34a)',
                        color: 'white',
                        padding: '15px',
                        borderRadius: '10px',
                        marginBottom: '10px',
                        fontSize: '1.1rem',
                        fontWeight: '500'
                      }}>
                        <div style={{ marginBottom: '5px', fontSize: '1.2rem' }}>✅</div>
                        <strong>Benefit:</strong> {question.positiveOutcome}
                      </div>

                      <div style={{
                        background: 'linear-gradient(135deg, #ff9800, #f44336)',
                        color: 'white',
                        padding: '15px',
                        borderRadius: '10px',
                        fontSize: '1.1rem',
                        fontWeight: '500'
                      }}>
                        <div style={{ marginBottom: '5px', fontSize: '1.2rem' }}>⚠️</div>
                        <strong>Consequence:</strong> {question.negativeOutcome}
                      </div>
                    </div>

                    {/* Vote Statistics */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '20px',
                      marginBottom: '20px'
                    }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #28a745, #20c997)',
                        color: 'white',
                        padding: '15px',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        textAlign: 'center'
                      }}>
                        <div style={{ marginBottom: '5px', fontSize: '1.2rem' }}>👍</div>
                        <div style={{ fontSize: '0.8rem', marginBottom: '5px', opacity: 0.9 }}>
                          WOULD PRESS
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                          {stats.pressPercentage}%
                        </div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                          ({stats.pressVotes} votes)
                        </div>
                      </div>

                      <div style={{
                        background: 'linear-gradient(135deg, #dc3545, #e74c3c)',
                        color: 'white',
                        padding: '15px',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        textAlign: 'center'
                      }}>
                        <div style={{ marginBottom: '5px', fontSize: '1.2rem' }}>🚫</div>
                        <div style={{ fontSize: '0.8rem', marginBottom: '5px', opacity: 0.9 }}>
                          WOULD NOT PRESS
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                          {stats.notPressPercentage}%
                        </div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                          ({stats.notPressVotes} votes)
                        </div>
                      </div>
                    </div>

                    {/* Question Metadata */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.85rem',
                      color: '#666',
                      borderTop: '1px solid #eee',
                      paddingTop: '15px',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}>
                      <div>
                        <strong>Total Votes:</strong> {stats.totalVotes}
                      </div>
                      {question.author && (
                        <div>
                          <strong>By:</strong> {question.author.name}
                        </div>
                      )}
                      <div>
                        <strong>Created:</strong> {new Date(question.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Button - Only show if we have questions */}
            {topQuestions.length > 0 && (
              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <button
                  onClick={handleLoadMore}
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: '2px solid rgba(255, 255, 255, 0.5)',
                    borderRadius: '25px',
                    padding: '15px 40px',
                    color: '#e91e63',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : `Load More Questions (showing ${topQuestions.length})`}
                </button>
              </div>
            )}

            {/* No Questions Message */}
            {topQuestions.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: 'white'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🤔</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>
                  No Questions Found
                </h3>
                <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
                  No questions are available yet. Be the first to create one!
                </p>
              </div>
            )}
          </>
        )}

        {/* CSS Animation for Loading Spinner */}
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
