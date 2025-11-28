/**
 * Profile Page Sub-components
 * 个人资料页面子组件
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../../components/Button';
import type { User, Question, ProfileStats, PaginationState } from './types';

// Styles object - 样式对象
const styles = {
  profileInfo: {
    backgroundColor: 'rgba(233, 30, 99, 0.1)',
    borderRadius: '15px',
    padding: '25px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '25px'
  },
  avatar: {
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
  },
  userDetails: {
    flex: 1
  },
  userDetailsTitle: {
    margin: '0 0 12px 0',
    color: '#e91e63',
    fontSize: '1.2rem',
    fontWeight: 'bold'
  },
  userDetailsContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px'
  },
  userDetail: {
    margin: '0',
    fontSize: '1rem'
  },
  userDetailSecondary: {
    margin: '0',
    fontSize: '0.9rem',
    color: '#666'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
    width: '100%',
    marginTop: '10px'
  },
  statCard: {
    textAlign: 'center' as const,
    padding: '20px',
    borderRadius: '15px'
  },
  statCardPrimary: {
    backgroundColor: 'rgba(233, 30, 99, 0.05)',
    border: '1px solid rgba(233, 30, 99, 0.1)'
  },
  statCardSecondary: {
    backgroundColor: 'rgba(156, 39, 176, 0.05)',
    border: '1px solid rgba(156, 39, 176, 0.1)'
  },
  statCardTertiary: {
    backgroundColor: 'rgba(255, 152, 0, 0.05)',
    border: '1px solid rgba(255, 152, 0, 0.1)'
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 'bold'
  },
  statNumberPrimary: {
    color: '#e91e63'
  },
  statNumberSecondary: {
    color: '#9c27b0'
  },
  statNumberTertiary: {
    color: '#ff9800'
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#666'
  },
  ctaSection: {
    width: '100%',
    marginTop: '25px',
    padding: '25px',
    backgroundColor: 'rgba(233, 30, 99, 0.05)',
    borderRadius: '20px',
    border: '2px dashed rgba(233, 30, 99, 0.3)',
    textAlign: 'center' as const
  },
  ctaTitle: {
    margin: '0 0 10px 0',
    fontSize: '1.3rem',
    color: '#333',
    fontWeight: 'bold'
  },
  ctaDescription: {
    margin: '0 0 20px 0',
    color: '#666',
    fontSize: '1rem'
  },
  questionsSection: {
    width: '100%',
    marginTop: '25px',
    padding: '25px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '20px'
  },
  questionsSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  questionsSectionTitle: {
    margin: '0',
    fontSize: '1.3rem',
    color: '#333',
    fontWeight: 'bold'
  },
  questionsCount: {
    fontSize: '0.9rem',
    color: '#666',
    backgroundColor: 'rgba(233, 30, 99, 0.1)',
    padding: '5px 12px',
    borderRadius: '15px'
  },
  loadingState: {
    textAlign: 'center' as const,
    color: '#666',
    fontSize: '1rem',
    padding: '40px 20px'
  },
  emptyState: {
    textAlign: 'center' as const,
    color: '#666',
    fontSize: '1rem',
    fontStyle: 'italic' as const,
    padding: '40px 20px',
    backgroundColor: 'rgba(233, 30, 99, 0.05)',
    borderRadius: '15px',
    border: '2px dashed rgba(233, 30, 99, 0.2)'
  },
  emptyStateIcon: {
    fontSize: '3rem',
    marginBottom: '15px'
  },
  emptyStateTitle: {
    fontSize: '1.1rem',
    marginBottom: '10px',
    color: '#333'
  },
  emptyStateDescription: {
    fontSize: '0.9rem'
  },
  questionsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px'
  },
  questionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '15px',
    padding: '20px',
    border: '1px solid rgba(233, 30, 99, 0.1)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  questionNumber: {
    fontSize: '0.8rem',
    color: '#666',
    backgroundColor: 'rgba(233, 30, 99, 0.1)',
    padding: '4px 10px',
    borderRadius: '10px'
  },
  questionDate: {
    fontSize: '0.8rem',
    color: '#666'
  },
  questionContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '15px'
  },
  outcomeBox: {
    padding: '15px',
    borderRadius: '10px'
  },
  positiveOutcome: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    border: '1px solid rgba(76, 175, 80, 0.2)'
  },
  negativeOutcome: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    border: '1px solid rgba(244, 67, 54, 0.2)'
  },
  outcomeLabel: {
    fontSize: '0.8rem',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  positiveLabel: {
    color: '#4caf50'
  },
  negativeLabel: {
    color: '#f44336'
  },
  outcomeText: {
    fontSize: '0.9rem',
    color: '#333',
    lineHeight: '1.4'
  },
  questionStats: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '15px',
    borderTop: '1px solid rgba(233, 30, 99, 0.1)'
  },
  questionStatsLeft: {
    display: 'flex',
    gap: '15px',
    fontSize: '0.8rem',
    color: '#666'
  },
  questionStatsRight: {
    fontSize: '0.8rem',
    color: '#e91e63',
    fontWeight: 'bold'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px',
    marginTop: '25px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(233, 30, 99, 0.1)'
  },
  paginationInfo: {
    fontSize: '0.9rem',
    color: '#666',
    padding: '8px 16px'
  }
} as const;

// Constants - 常量定义
const QUESTIONS_PER_PAGE = 5;

/**
 * User Profile Information Component
 * 用户个人信息组件
 */
interface ProfileInfoProps {
  user: User;
}

export function ProfileInfo({ user }: ProfileInfoProps) {
  const avatarLetter = user.name 
    ? user.name.charAt(0).toUpperCase() 
    : user.email.charAt(0).toUpperCase();

  return (
    <div style={styles.profileInfo}>
      <div style={styles.avatar}>
        {avatarLetter}
      </div>
      <div style={styles.userDetails}>
        <h3 style={styles.userDetailsTitle}>
          Account Information
        </h3>
        <div style={styles.userDetailsContent}>
          <p style={styles.userDetail}>
            <strong>Email:</strong> {user.email}
          </p>
          {user.name && (
            <p style={styles.userDetail}>
              <strong>Name:</strong> {user.name}
            </p>
          )}
          <p style={styles.userDetailSecondary}>
            <strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Statistics Display Component
 * 统计信息显示组件
 */
interface StatsDisplayProps {
  stats: ProfileStats;
}

export function StatsDisplay({ stats }: StatsDisplayProps) {
  return (
    <div className={styles.statsGrid}>
      <div className={`${styles.statCard} ${styles.statCardPrimary}`}>
        <div className={`${styles.statNumber} ${styles.statNumberPrimary}`}>
          {stats.questionsCreated}
        </div>
        <div className={styles.statLabel}>Questions Created</div>
      </div>
      <div className={`${styles.statCard} ${styles.statCardSecondary}`}>
        <div className={`${styles.statNumber} ${styles.statNumberSecondary}`}>
          {stats.totalVotes}
        </div>
        <div className={styles.statLabel}>Total Votes</div>
      </div>
      <div className={`${styles.statCard} ${styles.statCardTertiary}`}>
        <div className={`${styles.statNumber} ${styles.statNumberTertiary}`}>
          {stats.daysActive}
        </div>
        <div className={styles.statLabel}>Days Active</div>
      </div>
    </div>
  );
}

/**
 * Create Question Call-to-Action Component
 * 创建问题行动号召组件
 */
export function CreateQuestionCTA() {
  const router = useRouter();

  return (
    <div className={styles.ctaSection}>
      <h3 className={styles.ctaTitle}>
        🔴 Ready to create a dilemma?
      </h3>
      <p className={styles.ctaDescription}>
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
  );
}

/**
 * Single Question Card Component
 * 单个问题卡片组件
 */
interface QuestionCardProps {
  question: Question;
  index: number;
  currentPage: number;
}

export function QuestionCard({ question, index, currentPage }: QuestionCardProps) {
  const router = useRouter();
  const questionNumber = (currentPage - 1) * QUESTIONS_PER_PAGE + index + 1;

  return (
    <div 
      className={styles.questionCard}
      onClick={() => router.push(`/questions/${question.id}`)}
    >
      <div className={styles.questionHeader}>
        <span className={styles.questionNumber}>
          Question #{questionNumber}
        </span>
        <span className={styles.questionDate}>
          {new Date(question.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className={styles.questionContent}>
        <div className={`${styles.outcomeBox} ${styles.positiveOutcome}`}>
          <div className={`${styles.outcomeLabel} ${styles.positiveLabel}`}>
            ✅ REWARD
          </div>
          <div className={styles.outcomeText}>
            {question.positiveOutcome}
          </div>
        </div>

        <div className={`${styles.outcomeBox} ${styles.negativeOutcome}`}>
          <div className={`${styles.outcomeLabel} ${styles.negativeLabel}`}>
            ❌ CONSEQUENCE
          </div>
          <div className={styles.outcomeText}>
            {question.negativeOutcome}
          </div>
        </div>
      </div>

      <div className={styles.questionStats}>
        <div className={styles.questionStatsLeft}>
          <span>👥 {question._count?.votes || 0} votes</span>
          <span>💬 {question._count?.comments || 0} comments</span>
        </div>
        <div className={styles.questionStatsRight}>
          View Details →
        </div>
      </div>
    </div>
  );
}

/**
 * Pagination Controls Component
 * 分页控件组件
 */
interface PaginationControlsProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  loading: boolean;
}

export function PaginationControls({ pagination, onPageChange, loading }: PaginationControlsProps) {
  const { currentPage, totalQuestions, questionsPerPage } = pagination;
  const totalPages = Math.ceil(totalQuestions / questionsPerPage);

  if (totalQuestions <= questionsPerPage) {
    return null;
  }

  return (
    <div className={styles.pagination}>
      <Button
        variant="secondary"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
        style={{
          padding: '8px 16px',
          fontSize: '0.9rem',
          opacity: (currentPage === 1 || loading) ? 0.5 : 1
        }}
      >
        ← Previous
      </Button>

      <span className={styles.paginationInfo}>
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="secondary"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || loading}
        style={{
          padding: '8px 16px',
          fontSize: '0.9rem',
          opacity: (currentPage >= totalPages || loading) ? 0.5 : 1
        }}
      >
        Next →
      </Button>
    </div>
  );
}

/**
 * Questions List Component with Loading and Empty States
 * 问题列表组件，包含加载和空状态
 */
interface QuestionsListProps {
  questions: Question[];
  loading: boolean;
  totalQuestions: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function QuestionsList({ 
  questions, 
  loading, 
  totalQuestions, 
  currentPage, 
  onPageChange 
}: QuestionsListProps) {
  const pagination: PaginationState = {
    currentPage,
    totalQuestions,
    questionsPerPage: QUESTIONS_PER_PAGE
  };

  return (
    <div className={styles.questionsSection}>
      <div className={styles.questionsSectionHeader}>
        <h3 className={styles.questionsSectionTitle}>
          📝 Your Questions
        </h3>
        {totalQuestions > 0 && (
          <span className={styles.questionsCount}>
            {totalQuestions} total question{totalQuestions !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading && (
        <div className={styles.loadingState}>
          Loading your questions...
        </div>
      )}

      {!loading && questions.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>🤔</div>
          <div className={styles.emptyStateTitle}>
            No questions created yet!
          </div>
          <div className={styles.emptyStateDescription}>
            Start creating thought-provoking dilemmas to share with the community.
          </div>
        </div>
      )}

      {!loading && questions.length > 0 && (
        <>
          <div className={styles.questionsList}>
            {questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                currentPage={currentPage}
              />
            ))}
          </div>

          <PaginationControls
            pagination={pagination}
            onPageChange={onPageChange}
            loading={loading}
          />
        </>
      )}
    </div>
  );
}
