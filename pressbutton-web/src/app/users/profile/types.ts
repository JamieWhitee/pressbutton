/**
 * TypeScript interfaces for Profile Page
 * 个人资料页面的 TypeScript 接口
 */

// Re-export Question type from API to maintain consistency
export type { Question } from '../../../lib/api/questions';

// User interface for profile information
export interface User {
  id: number;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

// Profile statistics interface
export interface ProfileStats {
  questionsCreated: number;
  totalVotes: number;
  daysActive: number;
}

// Pagination state interface
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}
