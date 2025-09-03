/**
 * Profile Page Styles - Clean and Organized
 * 个人资料页面样式 - 清洁且有组织
 * 
 * This file contains all styling objects for the profile page components.
 * Using TypeScript object styles instead of CSS modules to avoid type conflicts.
 */

import type { CSSProperties } from 'react';

// Main layout styles
export const profileStyles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #e91e63, #9c27b0, #ff9800)',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  } as CSSProperties,
  
  loadingContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #e91e63, #9c27b0, #ff9800)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '1.5rem'
  } as CSSProperties,
  
  mainContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 60px)',
    padding: '20px'
  } as CSSProperties,
  
  profileCard: {
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
  } as CSSProperties,
  
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '30px',
    background: 'linear-gradient(135deg, #e91e63, #9c27b0, #ff9800)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    width: '100%'
  } as CSSProperties,
  
  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
    alignItems: 'center'
  } as CSSProperties
} as const;

// Profile info section styles
export const profileInfoStyles = {
  container: {
    backgroundColor: 'rgba(233, 30, 99, 0.1)',
    borderRadius: '15px',
    padding: '25px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '25px'
  } as CSSProperties,
  
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
  } as CSSProperties,
  
  content: {
    flex: 1
  } as CSSProperties,
  
  title: {
    margin: '0 0 12px 0',
    color: '#e91e63',
    fontSize: '1.2rem',
    fontWeight: 'bold'
  } as CSSProperties,
  
  fieldContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  } as CSSProperties,
  
  field: {
    margin: '0',
    fontSize: '1rem'
  } as CSSProperties,
  
  dateField: {
    margin: '0',
    fontSize: '0.9rem',
    color: '#666'
  } as CSSProperties
} as const;

// Statistics section styles
export const statsStyles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
    width: '100%',
    marginTop: '10px'
  } as CSSProperties,
  
  statCard: {
    textAlign: 'center',
    padding: '20px',
    borderRadius: '15px',
    border: '1px solid rgba(233, 30, 99, 0.1)'
  } as CSSProperties,
  
  questionsCard: {
    backgroundColor: 'rgba(233, 30, 99, 0.05)'
  } as CSSProperties,
  
  votesCard: {
    backgroundColor: 'rgba(156, 39, 176, 0.05)'
  } as CSSProperties,
  
  daysCard: {
    backgroundColor: 'rgba(255, 152, 0, 0.05)'
  } as CSSProperties,
  
  statNumber: {
    fontSize: '2rem',
    fontWeight: 'bold'
  } as CSSProperties,
  
  questionsNumber: {
    color: '#e91e63'
  } as CSSProperties,
  
  votesNumber: {
    color: '#9c27b0'
  } as CSSProperties,
  
  daysNumber: {
    color: '#ff9800'
  } as CSSProperties,
  
  statLabel: {
    fontSize: '0.9rem',
    color: '#666'
  } as CSSProperties
} as const;

// Create question CTA styles
export const ctaStyles = {
  container: {
    width: '100%',
    marginTop: '25px',
    padding: '25px',
    backgroundColor: 'rgba(233, 30, 99, 0.05)',
    borderRadius: '20px',
    border: '2px dashed rgba(233, 30, 99, 0.3)',
    textAlign: 'center'
  } as CSSProperties,
  
  title: {
    margin: '0 0 10px 0',
    fontSize: '1.3rem',
    color: '#333',
    fontWeight: 'bold'
  } as CSSProperties,
  
  description: {
    margin: '0 0 20px 0',
    color: '#666',
    fontSize: '1rem'
  } as CSSProperties,
  
  button: {
    padding: '15px 30px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    borderRadius: '25px'
  } as CSSProperties
} as const;

// Questions list styles
export const questionsListStyles = {
  container: {
    width: '100%',
    marginTop: '25px',
    padding: '25px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '20px'
  } as CSSProperties,
  
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  } as CSSProperties,
  
  title: {
    margin: '0',
    fontSize: '1.3rem',
    color: '#333',
    fontWeight: 'bold'
  } as CSSProperties,
  
  badge: {
    fontSize: '0.9rem',
    color: '#666',
    backgroundColor: 'rgba(233, 30, 99, 0.1)',
    padding: '5px 12px',
    borderRadius: '15px'
  } as CSSProperties,
  
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: '1rem',
    padding: '40px 20px'
  } as CSSProperties,
  
  emptyState: {
    textAlign: 'center',
    color: '#666',
    fontSize: '1rem',
    fontStyle: 'italic',
    padding: '40px 20px',
    backgroundColor: 'rgba(233, 30, 99, 0.05)',
    borderRadius: '15px',
    border: '2px dashed rgba(233, 30, 99, 0.2)'
  } as CSSProperties,
  
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '15px'
  } as CSSProperties,
  
  emptyTitle: {
    fontSize: '1.1rem',
    marginBottom: '10px',
    color: '#333'
  } as CSSProperties,
  
  emptyDescription: {
    fontSize: '0.9rem'
  } as CSSProperties,
  
  questionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  } as CSSProperties,
  
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px',
    marginTop: '25px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(233, 30, 99, 0.1)'
  } as CSSProperties,
  
  paginationButton: {
    padding: '8px 16px',
    fontSize: '0.9rem'
  } as CSSProperties,
  
  paginationInfo: {
    fontSize: '0.9rem',
    color: '#666',
    padding: '8px 16px'
  } as CSSProperties
} as const;

// Question card styles
export const questionCardStyles = {
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '15px',
    padding: '20px',
    border: '1px solid rgba(233, 30, 99, 0.1)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  } as CSSProperties,
  
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  } as CSSProperties,
  
  questionNumber: {
    fontSize: '0.8rem',
    color: '#666',
    backgroundColor: 'rgba(233, 30, 99, 0.1)',
    padding: '4px 10px',
    borderRadius: '10px'
  } as CSSProperties,
  
  date: {
    fontSize: '0.8rem',
    color: '#666'
  } as CSSProperties,
  
  outcomes: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '15px'
  } as CSSProperties,
  
  positiveOutcome: {
    padding: '15px',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: '10px',
    border: '1px solid rgba(76, 175, 80, 0.2)'
  } as CSSProperties,
  
  negativeOutcome: {
    padding: '15px',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: '10px',
    border: '1px solid rgba(244, 67, 54, 0.2)'
  } as CSSProperties,
  
  outcomeLabel: {
    fontSize: '0.8rem',
    fontWeight: 'bold',
    marginBottom: '8px'
  } as CSSProperties,
  
  positiveLabel: {
    color: '#4caf50'
  } as CSSProperties,
  
  negativeLabel: {
    color: '#f44336'
  } as CSSProperties,
  
  outcomeText: {
    fontSize: '0.9rem',
    color: '#333',
    lineHeight: '1.4'
  } as CSSProperties,
  
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '15px',
    borderTop: '1px solid rgba(233, 30, 99, 0.1)'
  } as CSSProperties,
  
  stats: {
    display: 'flex',
    gap: '15px',
    fontSize: '0.8rem',
    color: '#666'
  } as CSSProperties,
  
  viewDetails: {
    fontSize: '0.8rem',
    color: '#e91e63',
    fontWeight: 'bold'
  } as CSSProperties
} as const;
