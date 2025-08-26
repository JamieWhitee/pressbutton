"use client";
import { useRouter } from 'next/navigation';
import Button from '../../../components/Button';
import Navigation from '../../../components/Navigation';

export default function ProfilePage() {
  const router = useRouter();

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
            marginBottom: '20px',
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
            {/* User Info Section */}
            <div style={{
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
                margin: '0 auto 15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2rem',
                fontWeight: 'bold'
              }}>
                U
              </div>
              <h2 style={{ margin: '0 0 5px 0', fontSize: '1.5rem', color: '#333' }}>
                User Name
              </h2>
              <p style={{ margin: 0, color: '#666', fontSize: '1rem' }}>
                user@example.com
              </p>
            </div>

            {/* Create Question Button - Prominent Position */}
            <div style={{
              width: '100%',
              maxWidth: '400px',
              marginTop: '25px',
              marginBottom: '25px'
            }}>
              <Button
                variant="primary"
                onClick={() => router.push('/questions/create')}
                style={{
                  width: '100%',
                  padding: '18px 25px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  borderRadius: '25px',
                  background: 'linear-gradient(135deg, #e91e63, #9c27b0, #ff9800)',
                  border: 'none',
                  color: 'white',
                  boxShadow: '0 8px 20px rgba(233, 30, 99, 0.4)',
                  transform: 'scale(1)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(233, 30, 99, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(233, 30, 99, 0.4)';
                }}
              >
                🔴 Create New Question
              </Button>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              width: '100%',
              maxWidth: '300px'
            }}>
              <Button
                variant="primary"
                onClick={() => router.push('/questions/create')}
                style={{
                  padding: '15px 25px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                🔴 Create Your Question
              </Button>

              <Button
                variant="secondary"
                onClick={() => router.push('/questions')}
                style={{
                  padding: '15px 25px',
                  fontSize: '1.1rem'
                }}
              >
                📝 View All Questions
              </Button>

              <Button
                variant="secondary"
                onClick={() => router.push('/rank')}
                style={{
                  padding: '15px 25px',
                  fontSize: '1.1rem'
                }}
              >
                🏆 View Rankings
              </Button>
            </div>

            {/* Stats Section */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              width: '100%',
              marginTop: '30px'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '20px',
                backgroundColor: 'rgba(233, 30, 99, 0.1)',
                borderRadius: '15px'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e91e63' }}>42</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Questions Created</div>
              </div>

              <div style={{
                textAlign: 'center',
                padding: '20px',
                backgroundColor: 'rgba(156, 39, 176, 0.1)',
                borderRadius: '15px'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9c27b0' }}>1,247</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Total Votes</div>
              </div>

              <div style={{
                textAlign: 'center',
                padding: '20px',
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                borderRadius: '15px'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff9800' }}>156</div>
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
                  borderRadius: '25px',
                  transform: 'scale(1)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
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

              {/* Create Question Button - Inside Recent Activity */}
              <div style={{
                marginBottom: '25px',
                textAlign: 'center'
              }}>
                <Button
                  variant="primary"
                  onClick={() => router.push('/questions/create')}
                  style={{
                    padding: '15px 30px',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    borderRadius: '25px',
                    background: 'linear-gradient(135deg, #e91e63, #9c27b0, #ff9800)',
                    border: 'none',
                    color: 'white',
                    boxShadow: '0 8px 20px rgba(233, 30, 99, 0.4)',
                    cursor: 'pointer'
                  }}
                >
                  🔴 Create New Question
                </Button>
              </div>

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
