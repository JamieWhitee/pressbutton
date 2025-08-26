"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Navigation from "../../components/Navigation";

/**
 * Profile page - Requires login/registration
 * Shows user profile, created questions, voting history, etc.
 */
export default function ProfilePage() {
  const router = useRouter();

  // TODO: Replace with real authentication check
  // Should check JWT token, session, or auth context
  // API endpoint: GET /api/auth/me (to verify current user)
  const isLoggedIn = true; // Temporarily set to true for development

  if (!isLoggedIn) {
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
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 60px)'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '50px',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            {/* Lock Icon */}
            <div style={{
              fontSize: '4rem',
              marginBottom: '20px'
            }}>
              🔒
            </div>

            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '15px'
            }}>
              Profile Access Required
            </h1>

            <p style={{
              color: '#666',
              fontSize: '1.1rem',
              marginBottom: '30px',
              lineHeight: '1.5'
            }}>
              You need to login or create an account to access your profile and view your voting history.
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              <button
                onClick={() => router.push('/users/login')}
                style={{
                  background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '15px 30px',
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
                Login to Existing Account
              </button>

              <button
                onClick={() => router.push('/users/register')}
                style={{
                  background: 'transparent',
                  border: '2px solid #e91e63',
                  borderRadius: '25px',
                  padding: '15px 30px',
                  color: '#e91e63',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e91e63';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#e91e63';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Create New Account
              </button>
            </div>

            <p style={{
              color: '#888',
              fontSize: '0.9rem',
              marginTop: '20px'
            }}>
              Join our community to create questions, vote, and track your activity!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If user is logged in, show the actual profile page
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
        {/* User Profile Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              color: 'white',
              marginRight: '20px'
            }}>
              👤
            </div>
            <div>
              {/* TODO: Replace with real user data from API */}
              {/* API endpoint: GET /api/users/profile */}
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '5px'
              }}>
                Username
              </h1>
              <p style={{
                color: '#666',
                fontSize: '1.1rem'
              }}>
                Member since January 2024
              </p>
            </div>
          </div>

          {/* Stats */}
          {/* TODO: Replace with real user statistics from API */}
          {/* API endpoint: GET /api/users/{userId}/stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '20px',
            marginTop: '20px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#e91e63'
              }}>
                42
              </div>
              <div style={{ color: '#666' }}>Questions Created</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#9c27b0'
              }}>
                1,247
              </div>
              <div style={{ color: '#666' }}>Total Votes</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#ff9800'
              }}>
                156
              </div>
              <div style={{ color: '#666' }}>Days Active</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '20px'
          }}>
            Recent Activity
          </h2>
          {/* TODO: Replace with real user activity data from API */}
          {/* API endpoints:
               - GET /api/users/{userId}/questions (user's created questions)
               - GET /api/users/{userId}/votes (user's voting history)
               - GET /api/users/{userId}/comments (user's comments)
          */}
          <p style={{
            color: '#666',
            fontSize: '1rem',
            textAlign: 'center',
            padding: '40px'
          }}>
            Your recent questions and voting activity will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
