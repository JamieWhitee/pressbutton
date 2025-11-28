"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../../components/Button';
import Navigation from '../../../components/Navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { questionsApi, type Question } from '../../../lib/api/questions';
import { 
  profileStyles, 
  profileInfoStyles, 
  statsStyles, 
  ctaStyles, 
  questionsListStyles, 
  questionCardStyles 
} from './profile.styles';

// Constants
const QUESTIONS_PER_PAGE = 5;

/**
 * Profile Page Component - Clean and Organized
 * 个人资料页面组件 - 清洁且有组织
 */
export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // State management
  const [userQuestions, setUserQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  /**
   * Fetch user's questions with pagination
   */
  const fetchUserQuestions = async (page = 1) => {
    if (!user?.id) return;
    
    setQuestionsLoading(true);
    try {
      const allQuestions = await questionsApi.getAll(user.id);
      
      if (allQuestions && Array.isArray(allQuestions)) {
        const sortedQuestions = allQuestions.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        const startIndex = (page - 1) * QUESTIONS_PER_PAGE;
        const endIndex = startIndex + QUESTIONS_PER_PAGE;
        const paginatedQuestions = sortedQuestions.slice(startIndex, endIndex);
        
        setUserQuestions(paginatedQuestions);
        setTotalQuestions(sortedQuestions.length);
        setCurrentPage(page);
      } else {
        setUserQuestions([]);
        setTotalQuestions(0);
      }
    } catch (error) {
      console.error('Error fetching user questions:', error);
      setUserQuestions([]);
      setTotalQuestions(0);
    } finally {
      setQuestionsLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (user?.id) {
      fetchUserQuestions(1);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/users/login');
    }
  }, [user, isLoading, router]);

  // Loading state
  if (isLoading) {
    return <div style={profileStyles.loadingContainer}>Loading...</div>;
  }

  // Redirect state
  if (!user) {
    return null;
  }

  return (
    <div style={profileStyles.container}>
      <Navigation />

      <div style={profileStyles.mainContent}>
        <div style={profileStyles.profileCard}>
          <h1 style={profileStyles.title}>Your Profile</h1>

          <div style={profileStyles.contentWrapper}>
            {/* Profile Information */}
            <ProfileInfoSection user={user} />
            
            {/* Statistics */}
            <StatsSection totalQuestions={totalQuestions} />
            
            {/* Create Question CTA */}
            <CreateQuestionSection router={router} />
            
            {/* Questions List */}
            <QuestionsSection
              questions={userQuestions}
              loading={questionsLoading}
              totalQuestions={totalQuestions}
              currentPage={currentPage}
              onPageChange={fetchUserQuestions}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components using external styles
function ProfileInfoSection({ user }: { user: any }) {
  const avatarLetter = user.name 
    ? user.name.charAt(0).toUpperCase() 
    : user.email.charAt(0).toUpperCase();

  return (
    <div style={profileInfoStyles.container}>
      <div style={profileInfoStyles.avatar}>
        {avatarLetter}
      </div>
      <div style={profileInfoStyles.content}>
        <h3 style={profileInfoStyles.title}>
          Account Information
        </h3>
        <div style={profileInfoStyles.fieldContainer}>
          <p style={profileInfoStyles.field}>
            <strong>Email:</strong> {user.email}
          </p>
          {user.name && (
            <p style={profileInfoStyles.field}>
              <strong>Name:</strong> {user.name}
            </p>
          )}
          <p style={profileInfoStyles.dateField}>
            <strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatsSection({ totalQuestions }: { totalQuestions: number }) {
  return (
    <div style={statsStyles.container}>
      <div style={{...statsStyles.statCard, ...statsStyles.questionsCard}}>
        <div style={{...statsStyles.statNumber, ...statsStyles.questionsNumber}}>
          {totalQuestions}
        </div>
        <div style={statsStyles.statLabel}>Questions Created</div>
      </div>
      <div style={{...statsStyles.statCard, ...statsStyles.votesCard}}>
        <div style={{...statsStyles.statNumber, ...statsStyles.votesNumber}}>0</div>
        <div style={statsStyles.statLabel}>Total Votes</div>
      </div>
      <div style={{...statsStyles.statCard, ...statsStyles.daysCard}}>
        <div style={{...statsStyles.statNumber, ...statsStyles.daysNumber}}>0</div>
        <div style={statsStyles.statLabel}>Days Active</div>
      </div>
    </div>
  );
}

function CreateQuestionSection({ router }: { router: any }) {
  return (
    <div style={ctaStyles.container}>
      <h3 style={ctaStyles.title}>
        🔴 Ready to create a dilemma?
      </h3>
      <p style={ctaStyles.description}>
        Challenge others with your toughest "would you press the button" scenarios
      </p>
      <Button
        variant="primary"
        onClick={() => router.push('/questions/create')}
        style={ctaStyles.button}
      >
        Create New Question
      </Button>
    </div>
  );
}

function QuestionsSection({ 
  questions, 
  loading, 
  totalQuestions, 
  currentPage, 
  onPageChange 
}: {
  questions: Question[];
  loading: boolean;
  totalQuestions: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}) {
  const router = useRouter();

  return (
    <div style={questionsListStyles.container}>
      <div style={questionsListStyles.header}>
        <h3 style={questionsListStyles.title}>
          📝 Your Questions
        </h3>
        {totalQuestions > 0 && (
          <span style={questionsListStyles.badge}>
            {totalQuestions} total question{totalQuestions !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading && (
        <div style={questionsListStyles.loadingText}>
          Loading your questions...
        </div>
      )}

      {!loading && questions.length === 0 && (
        <div style={questionsListStyles.emptyState}>
          <div style={questionsListStyles.emptyIcon}>🤔</div>
          <div style={questionsListStyles.emptyTitle}>
            No questions created yet!
          </div>
          <div style={questionsListStyles.emptyDescription}>
            Start creating thought-provoking dilemmas to share with the community.
          </div>
        </div>
      )}

      {!loading && questions.length > 0 && (
        <>
          <div style={questionsListStyles.questionsList}>
            {questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                currentPage={currentPage}
                onClick={() => router.push(`/questions/${question.id}`)}
              />
            ))}
          </div>

          {totalQuestions > QUESTIONS_PER_PAGE && (
            <div style={questionsListStyles.pagination}>
              <Button
                variant="secondary"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                style={{
                  ...questionsListStyles.paginationButton,
                  opacity: (currentPage === 1 || loading) ? 0.5 : 1
                }}
              >
                ← Previous
              </Button>

              <span style={questionsListStyles.paginationInfo}>
                Page {currentPage} of {Math.ceil(totalQuestions / QUESTIONS_PER_PAGE)}
              </span>

              <Button
                variant="secondary"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= Math.ceil(totalQuestions / QUESTIONS_PER_PAGE) || loading}
                style={{
                  ...questionsListStyles.paginationButton,
                  opacity: (currentPage >= Math.ceil(totalQuestions / QUESTIONS_PER_PAGE) || loading) ? 0.5 : 1
                }}
              >
                Next →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function QuestionCard({ 
  question, 
  index, 
  currentPage, 
  onClick 
}: {
  question: Question;
  index: number;
  currentPage: number;
  onClick: () => void;
}) {
  const questionNumber = (currentPage - 1) * QUESTIONS_PER_PAGE + index + 1;

  return (
    <div
      style={questionCardStyles.container}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(233, 30, 99, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
      }}
      onClick={onClick}
    >
      <div style={questionCardStyles.header}>
        <span style={questionCardStyles.questionNumber}>
          Question #{questionNumber}
        </span>
        <span style={questionCardStyles.date}>
          {new Date(question.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div style={questionCardStyles.outcomes}>
        <div style={questionCardStyles.positiveOutcome}>
          <div style={{...questionCardStyles.outcomeLabel, ...questionCardStyles.positiveLabel}}>
            ✅ REWARD
          </div>
          <div style={questionCardStyles.outcomeText}>
            {question.positiveOutcome}
          </div>
        </div>

        <div style={questionCardStyles.negativeOutcome}>
          <div style={{...questionCardStyles.outcomeLabel, ...questionCardStyles.negativeLabel}}>
            ❌ CONSEQUENCE
          </div>
          <div style={questionCardStyles.outcomeText}>
            {question.negativeOutcome}
          </div>
        </div>
      </div>

      <div style={questionCardStyles.footer}>
        <div style={questionCardStyles.stats}>
          <span>👥 {question._count?.votes || 0} votes</span>
          <span>💬 {question._count?.comments || 0} comments</span>
        </div>
        <div style={questionCardStyles.viewDetails}>
          View Details →
        </div>
      </div>
    </div>
  );
}
