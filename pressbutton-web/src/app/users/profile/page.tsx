"use client";
import { useRouter } from 'next/navigation';
import Button from '../../../components/Button';
import Navigation from '../../../components/Navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { useEffect } from 'react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/users/login');
    }
  }, [user, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e91e63, #9c27b0, #ff9800)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '1.5rem'
      }}>
        Loading...
      </div>
    );
  }

  // Don't render anything if no user (will redirect)
  if (!user) {
    return null;
  }

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
          maxWidth: '600px',
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
            marginBottom: '30px',
            background: 'linear-gradient(135deg, #e91e63, #9c27b0, #ff9800)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            width: '100%'
          }}>
            Your Profile
          </h1>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            width: '100%',
            alignItems: 'center'
          }}>
            {/* Main Profile Information Box with Avatar */}
            <div style={{
              backgroundColor: 'rgba(233, 30, 99, 0.1)',
              borderRadius: '15px',
              padding: '25px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '25px'
            }}>
              {/* Profile Avatar */}
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2rem',
                fontWeight: 'bold',
                boxShadow: '0 8px 20px rgba(233, 30, 99, 0.3)',
                flexShrink: 0
              }}>
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>

              {/* User Information */}
              <div style={{ flex: 1 }}>
                <h3 style={{
                  margin: '0 0 12px 0',
                  color: '#e91e63',
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}>
                  Account Information
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <p style={{ margin: '0', fontSize: '1rem' }}>
                    <strong>Email:</strong> {user.email}
                  </p>
                  {user.name && (
                    <p style={{ margin: '0', fontSize: '1rem' }}>
                      <strong>Name:</strong> {user.name}
                    </p>
                  )}
                  <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>
                    <strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Statistics Section */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '15px',
              width: '100%',
              marginTop: '10px'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '20px',
                backgroundColor: 'rgba(233, 30, 99, 0.05)',
                borderRadius: '15px',
                border: '1px solid rgba(233, 30, 99, 0.1)'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e91e63' }}>0</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Questions Created</div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '20px',
                backgroundColor: 'rgba(156, 39, 176, 0.05)',
                borderRadius: '15px',
                border: '1px solid rgba(156, 39, 176, 0.1)'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9c27b0' }}>0</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Total Votes</div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '20px',
                backgroundColor: 'rgba(255, 152, 0, 0.05)',
                borderRadius: '15px',
                border: '1px solid rgba(255, 152, 0, 0.1)'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff9800' }}>0</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Days Active</div>
              </div>
            </div>

            {/* Create Question Call-to-Action */}
            <div style={{
              width: '100%',
              marginTop: '25px',
              padding: '25px',
              backgroundColor: 'rgba(233, 30, 99, 0.05)',
              borderRadius: '20px',
              border: '2px dashed rgba(233, 30, 99, 0.3)',
              textAlign: 'center'
            }}>
              <h3 style={{
                margin: '0 0 10px 0',
                fontSize: '1.3rem',
                color: '#333',
                fontWeight: 'bold'
              }}>
                🔴 Ready to create a dilemma?
              </h3>
              <p style={{
                margin: '0 0 20px 0',
                color: '#666',
                fontSize: '1rem'
              }}>
                Challenge others with your toughest "would you press the button" scenarios
              </p>
              <Button
                variant="primary"
                onClick={() => router.push('/questions/create')}
                style={{
                  padding: '15px 30px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  borderRadius: '25px'
                }}
              >
                Create New Question
              </Button>
            </div>

            {/* Recent Activity Section */}
            <div style={{
              width: '100%',
              marginTop: '25px',
              padding: '25px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '20px'
            }}>
              <h3 style={{
                margin: '0 0 20px 0',
                fontSize: '1.3rem',
                color: '#333',
                fontWeight: 'bold'
              }}>
                Recent Activity
              </h3>
              <div style={{
                textAlign: 'center',
                color: '#666',
                fontSize: '1rem',
                fontStyle: 'italic',
                padding: '40px 20px'
              }}>
                Your recent questions and voting activity will appear here.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
