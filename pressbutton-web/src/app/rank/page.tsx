"use client";
import React from "react";
import Navigation from "../../components/Navigation";

/**
 * Rank page - Shows best questions based on votes
 * This will display top-rated questions from the community
 */
export default function RankPage() {
  // TODO: Replace with API call to fetch top-rated questions from database
  // API endpoint: GET /api/questions/top?limit=10&sortBy=totalVotes
  // Should return questions sorted by vote count in descending order
  const topQuestions = [
    {
      id: 1,
      benefit: "You get $1 million instantly",
      consequence: "But you can never use social media again",
      pressVotes: 1245,
      notPressVotes: 894,
      totalVotes: 2139,
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      benefit: "You can teleport anywhere in the world",
      consequence: "But you age 1 year every time you teleport",
      pressVotes: 832,
      notPressVotes: 1044,
      totalVotes: 1876,
      createdAt: "2024-01-10"
    },
    {
      id: 3,
      benefit: "You become the most attractive person alive",
      consequence: "But you can never form genuine friendships",
      pressVotes: 567,
      notPressVotes: 1087,
      totalVotes: 1654,
      createdAt: "2024-01-08"
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e91e63, #9c27b0, #ff9800)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <Navigation />

      <div style={{
        padding: '40px 20px',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '10px'
          }}>
            🏆 Top Ranked Questions
          </h1>
          <p style={{
            color: '#666',
            fontSize: '1.1rem',
            fontWeight: '500'
          }}>
            The most popular "Will You Press The Button?" questions from our community
          </p>
        </div>

        {/* Questions List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {topQuestions.map((question, index) => (
            <div
              key={question.id}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '15px',
                padding: '25px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)',
                border: index === 0 ? '3px solid #FFD700' : 'none' // Gold border for #1
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <div style={{
                  background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'linear-gradient(135deg, #e91e63, #9c27b0)',
                  color: index < 3 ? '#000' : '#fff',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  marginRight: '15px'
                }}>
                  #{index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#888',
                    marginBottom: '5px'
                  }}>
                    {question.totalVotes.toLocaleString()} total votes • {question.createdAt}
                  </div>
                </div>
                {index === 0 && (
                  <div style={{
                    background: '#FFD700',
                    color: '#000',
                    padding: '5px 15px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    👑 MOST POPULAR
                  </div>
                )}
              </div>

              {/* Question Content */}
              <div style={{
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '10px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '1.1rem',
                  color: '#28a745',
                  fontWeight: '600',
                  marginBottom: '10px'
                }}>
                  ✅ {question.benefit}
                </div>
                <div style={{
                  fontSize: '1rem',
                  color: '#666',
                  fontWeight: '500',
                  marginBottom: '10px'
                }}>
                  but
                </div>
                <div style={{
                  fontSize: '1.1rem',
                  color: '#dc3545',
                  fontWeight: '600'
                }}>
                  ❌ {question.consequence}
                </div>
              </div>

              {/* Vote Results */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px'
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
                  <div style={{ marginBottom: '5px', fontSize: '1.2rem' }}>🔴</div>
                  <div style={{ fontSize: '0.8rem', marginBottom: '5px', opacity: 0.9 }}>
                    WOULD PRESS
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                    {Math.round((question.pressVotes / question.totalVotes) * 100)}%
                  </div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                    ({question.pressVotes} votes)
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
                    {Math.round((question.notPressVotes / question.totalVotes) * 100)}%
                  </div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                    ({question.notPressVotes} votes)
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button
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
            onClick={() => {
              // TODO: Load more top questions from database
              // API endpoint: GET /api/questions/top?page={page}&limit=10&sortBy=totalVotes
              // Should implement pagination for better performance
              console.log('Loading more top questions...');
            }}
          >
            Load More Questions
          </button>
        </div>
      </div>
    </div>
  );
}
