/**
 * Enterprise Advanced Pagination & Filtering System
 * Provides comprehensive data management capabilities including:
 * - Advanced pagination with cursor-based and offset-based pagination
 * - Multi-field filtering with various operators
 * - Sorting with multiple fields and directions
 * - Search functionality with full-text search
 * - Real-time filtering and caching
 */

import { enterpriseLogger, OperationType } from '../logging/enterprise-logger';

// Define supported filter operators for different data types
export enum FilterOperator {
  // Equality operators
  EQUALS = 'equals',                    // Exact match: field = value
  NOT_EQUALS = 'not_equals',           // Not equal: field != value

  // Comparison operators (for numbers and dates)
  GREATER_THAN = 'gt',                 // field > value
  GREATER_THAN_OR_EQUAL = 'gte',       // field >= value
  LESS_THAN = 'lt',                    // field < value
  LESS_THAN_OR_EQUAL = 'lte',          // field <= value

  // String operators
  CONTAINS = 'contains',               // field contains substring (case-insensitive)
  STARTS_WITH = 'starts_with',         // field starts with string
  ENDS_WITH = 'ends_with',             // field ends with string

  // Array operators
  IN = 'in',                           // field value is in array
  NOT_IN = 'not_in',                   // field value is not in array

  // Null/undefined operators
  IS_NULL = 'is_null',                 // field is null or undefined
  IS_NOT_NULL = 'is_not_null',         // field is not null or undefined

  // Date operators
  DATE_BETWEEN = 'date_between',       // date is between two dates
  DATE_WITHIN_DAYS = 'date_within_days', // date is within N days from now

  // Advanced operators
  REGEX = 'regex',                     // field matches regular expression
  FULL_TEXT_SEARCH = 'full_text_search' // Full-text search across multiple fields
}

// Define sorting directions
export enum SortDirection {
  ASC = 'asc',   // Ascending order (A-Z, 0-9, oldest-newest)
  DESC = 'desc'  // Descending order (Z-A, 9-0, newest-oldest)
}

// Define pagination strategies
export enum PaginationType {
  OFFSET = 'offset',   // Traditional offset-based pagination (page numbers)
  CURSOR = 'cursor'    // Cursor-based pagination (better for real-time data)
}

// Individual filter condition
export interface FilterCondition {
  field: string;                       // Which field to filter on
  operator: FilterOperator;            // How to compare the field
  value: any;                         // Value to compare against
  values?: any[];                     // Array of values (for IN, NOT_IN operators)
  caseSensitive?: boolean;            // Whether string comparison is case-sensitive
  negate?: boolean;                   // Whether to negate the condition
}

// Sorting configuration
export interface SortCondition {
  field: string;                      // Which field to sort by
  direction: SortDirection;           // Sort direction
  priority?: number;                  // Priority for multi-field sorting (lower = higher priority)
}

// Pagination configuration
export interface PaginationConfig {
  type: PaginationType;               // Which pagination strategy to use
  page?: number;                      // Current page number (offset-based)
  limit: number;                      // Number of items per page
  cursor?: string;                    // Cursor value (cursor-based)
  total?: number;                     // Total number of items (for offset-based)
}

// Search configuration for full-text search
export interface SearchConfig {
  query: string;                      // Search query string
  fields: string[];                   // Fields to search in
  exact?: boolean;                    // Whether to search for exact phrase
  fuzzy?: boolean;                    // Whether to enable fuzzy matching
  highlight?: boolean;                // Whether to highlight matched terms
}

// Complete query configuration combining all features
export interface DataQuery {
  filters?: FilterCondition[];        // Array of filter conditions
  sorting?: SortCondition[];          // Array of sort conditions
  pagination: PaginationConfig;       // Pagination configuration
  search?: SearchConfig;              // Search configuration
  includes?: string[];                // Related data to include
  metadata?: Record<string, any>;     // Additional query metadata
}

// Response structure for paginated data
export interface PaginatedResponse<T> {
  data: T[];                          // Array of items for current page
  pagination: {
    type: PaginationType;             // Pagination type used
    currentPage?: number;             // Current page (offset-based)
    totalPages?: number;              // Total pages (offset-based)
    totalItems?: number;              // Total number of items
    hasNextPage: boolean;             // Whether there are more items
    hasPreviousPage: boolean;         // Whether there are previous items
    nextCursor?: string;              // Next cursor (cursor-based)
    previousCursor?: string;          // Previous cursor (cursor-based)
    limit: number;                    // Items per page
  };
  filters?: FilterCondition[];        // Applied filters
  sorting?: SortCondition[];          // Applied sorting
  search?: SearchConfig;              // Applied search
  metadata?: {
    queryTime: number;                // Time taken to execute query (ms)
    cacheHit?: boolean;               // Whether result came from cache
    totalFiltered?: number;           // Number of items after filtering
  };
}

// Cache configuration for query results
interface CacheConfig {
  enabled: boolean;                   // Whether caching is enabled
  ttl: number;                       // Time to live in milliseconds
  maxSize: number;                   // Maximum number of cached queries
  keyPrefix: string;                 // Prefix for cache keys
}

/**
 * Advanced Data Query Builder
 * Provides fluent API for building complex queries
 */
export class QueryBuilder {
  private query: DataQuery;

  constructor() {
    this.query = {
      filters: [],
      sorting: [],
      pagination: {
        type: PaginationType.OFFSET,
        page: 1,
        limit: 20
      }
    };
  }

  /**
   * Add a filter condition to the query
   */
  filter(field: string, operator: FilterOperator, value: any, options?: {
    caseSensitive?: boolean;
    negate?: boolean;
    values?: any[];
  }): QueryBuilder {
    this.query.filters = this.query.filters || [];
    const condition: FilterCondition = {
      field,
      operator,
      value,
      ...(options?.caseSensitive !== undefined && { caseSensitive: options.caseSensitive }),
      ...(options?.negate !== undefined && { negate: options.negate }),
      ...(options?.values && { values: options.values })
    };
    this.query.filters.push(condition);
    return this;
  }

  /**
   * Add multiple filter conditions with AND logic
   */
  filterAnd(conditions: Omit<FilterCondition, 'field' | 'operator' | 'value'>[] & { field: string; operator: FilterOperator; value: any }[]): QueryBuilder {
    this.query.filters = this.query.filters || [];
    this.query.filters.push(...conditions);
    return this;
  }

  /**
   * Add sorting to the query
   */
  sort(field: string, direction: SortDirection = SortDirection.ASC, priority?: number): QueryBuilder {
    this.query.sorting = this.query.sorting || [];
    const condition: SortCondition = {
      field,
      direction,
      ...(priority !== undefined && { priority })
    };
    this.query.sorting.push(condition);
    return this;
  }

  /**
   * Set pagination configuration
   */
  paginate(config: Partial<PaginationConfig>): QueryBuilder {
    this.query.pagination = { ...this.query.pagination, ...config };
    return this;
  }

  /**
   * Set search configuration
   */
  search(query: string, fields: string[], options?: {
    exact?: boolean;
    fuzzy?: boolean;
    highlight?: boolean;
  }): QueryBuilder {
    this.query.search = {
      query,
      fields,
      ...(options?.exact !== undefined && { exact: options.exact }),
      ...(options?.fuzzy !== undefined && { fuzzy: options.fuzzy }),
      ...(options?.highlight !== undefined && { highlight: options.highlight })
    };
    return this;
  }

  /**
   * Set related data to include
   */
  include(...fields: string[]): QueryBuilder {
    this.query.includes = fields;
    return this;
  }

  /**
   * Set query metadata
   */
  metadata(data: Record<string, any>): QueryBuilder {
    this.query.metadata = data;
    return this;
  }

  /**
   * Build and return the final query
   */
  build(): DataQuery {
    return { ...this.query };
  }

  /**
   * Reset the query builder to start fresh
   */
  reset(): QueryBuilder {
    this.query = {
      filters: [],
      sorting: [],
      pagination: {
        type: PaginationType.OFFSET,
        page: 1,
        limit: 20
      }
    };
    return this;
  }
}

/**
 * Enterprise Data Manager
 * Handles data querying, filtering, pagination, and caching
 */
export class EnterpriseDataManager<T = any> {
  private cache: Map<string, { data: PaginatedResponse<T>; timestamp: number }> = new Map();
  private cacheConfig: CacheConfig;

  constructor(cacheConfig?: Partial<CacheConfig>) {
    this.cacheConfig = {
      enabled: true,
      ttl: 5 * 60 * 1000, // 5 minutes
      maxSize: 100,
      keyPrefix: 'edm_',
      ...cacheConfig
    };
  }

  /**
   * Execute a data query with full enterprise features
   */
  async query(
    dataSource: T[] | (() => Promise<T[]>),
    query: DataQuery,
    options?: {
      useCache?: boolean;
      debug?: boolean;
    }
  ): Promise<PaginatedResponse<T>> {

    const startTime = Date.now();
    const operationId = enterpriseLogger.operationStart(
      OperationType.DATA_READ,
      'Executing enterprise data query',
      { query, options }
    );

    try {
      // Check cache first if enabled
      if (options?.useCache !== false && this.cacheConfig.enabled) {
        const cachedResult = this.getCachedResult(query);
        if (cachedResult) {
          enterpriseLogger.info('Query result served from cache', {
            operationId,
            cacheHit: true,
            queryTime: Date.now() - startTime
          });
          return cachedResult;
        }
      }

      // Get data from source
      const rawData = Array.isArray(dataSource) ? dataSource : await dataSource();

      // Apply filtering
      let filteredData = this.applyFilters(rawData, query.filters || []);

      // Apply search
      if (query.search) {
        filteredData = this.applySearch(filteredData, query.search);
      }

      // Apply sorting
      if (query.sorting && query.sorting.length > 0) {
        filteredData = this.applySorting(filteredData, query.sorting);
      }

      // Apply pagination
      const paginatedResult = this.applyPagination(filteredData, query.pagination);

      // Build response
      const response: PaginatedResponse<T> = {
        ...paginatedResult,
        ...(query.filters && { filters: query.filters }),
        ...(query.sorting && { sorting: query.sorting }),
        ...(query.search && { search: query.search }),
        metadata: {
          queryTime: Date.now() - startTime,
          cacheHit: false,
          totalFiltered: filteredData.length
        }
      };

      // Cache the result if enabled
      if (this.cacheConfig.enabled) {
        this.cacheResult(query, response);
      }

      enterpriseLogger.operationEnd(
        operationId,
        OperationType.DATA_READ,
        'Enterprise data query completed successfully',
        true,
        startTime,
        {
          totalItems: rawData.length,
          filteredItems: filteredData.length,
          returnedItems: response.data.length,
          queryTime: response.metadata?.queryTime || 0
        }
      );

      return response;

    } catch (error) {
      enterpriseLogger.operationEnd(
        operationId,
        OperationType.DATA_READ,
        'Enterprise data query failed',
        false,
        startTime,
        { error: error instanceof Error ? error.message : String(error) }
      );
      throw error;
    }
  }

  /**
   * Apply filter conditions to data array
   */
  private applyFilters(data: T[], filters: FilterCondition[]): T[] {
    if (!filters || filters.length === 0) return data;

    return data.filter(item => {
      return filters.every(filter => {
        const fieldValue = this.getNestedValue(item, filter.field);
        const result = this.evaluateFilter(fieldValue, filter);
        return filter.negate ? !result : result;
      });
    });
  }

  /**
   * Evaluate a single filter condition
   */
  private evaluateFilter(fieldValue: any, filter: FilterCondition): boolean {
    const { operator, value, values, caseSensitive = false } = filter;

    // Handle null/undefined values
    if (operator === FilterOperator.IS_NULL) {
      return fieldValue === null || fieldValue === undefined;
    }
    if (operator === FilterOperator.IS_NOT_NULL) {
      return fieldValue !== null && fieldValue !== undefined;
    }

    // If field value is null/undefined, most operators should return false
    if (fieldValue === null || fieldValue === undefined) {
      return false;
    }

    // Convert to strings for string operations if needed
    const fieldStr = caseSensitive ? String(fieldValue) : String(fieldValue).toLowerCase();
    const valueStr = caseSensitive ? String(value) : String(value).toLowerCase();

    switch (operator) {
      case FilterOperator.EQUALS:
        return fieldValue === value;

      case FilterOperator.NOT_EQUALS:
        return fieldValue !== value;

      case FilterOperator.GREATER_THAN:
        return fieldValue > value;

      case FilterOperator.GREATER_THAN_OR_EQUAL:
        return fieldValue >= value;

      case FilterOperator.LESS_THAN:
        return fieldValue < value;

      case FilterOperator.LESS_THAN_OR_EQUAL:
        return fieldValue <= value;

      case FilterOperator.CONTAINS:
        return fieldStr.includes(valueStr);

      case FilterOperator.STARTS_WITH:
        return fieldStr.startsWith(valueStr);

      case FilterOperator.ENDS_WITH:
        return fieldStr.endsWith(valueStr);

      case FilterOperator.IN:
        return values ? values.includes(fieldValue) : false;

      case FilterOperator.NOT_IN:
        return values ? !values.includes(fieldValue) : true;

      case FilterOperator.DATE_BETWEEN:
        if (values && values.length === 2) {
          const date = new Date(fieldValue);
          const startDate = new Date(values[0]);
          const endDate = new Date(values[1]);
          return date >= startDate && date <= endDate;
        }
        return false;

      case FilterOperator.DATE_WITHIN_DAYS:
        const now = new Date();
        const targetDate = new Date(fieldValue);
        const daysDiff = Math.abs((now.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= value;

      case FilterOperator.REGEX:
        try {
          const regex = new RegExp(value, caseSensitive ? 'g' : 'gi');
          return regex.test(fieldStr);
        } catch {
          return false;
        }

      default:
        return false;
    }
  }

  /**
   * Apply search across multiple fields
   */
  private applySearch(data: T[], search: SearchConfig): T[] {
    if (!search.query.trim()) return data;

    const queryTerms = search.exact
      ? [search.query.toLowerCase()]
      : search.query.toLowerCase().split(/\s+/).filter(term => term.length > 0);

    return data.filter(item => {
      return search.fields.some(field => {
        const fieldValue = String(this.getNestedValue(item, field)).toLowerCase();

        if (search.exact) {
          return fieldValue.includes(queryTerms[0] || '');
        }

        // All search terms must be found in at least one field
        return queryTerms.every(term => fieldValue.includes(term));
      });
    });
  }

  /**
   * Apply sorting to data array
   */
  private applySorting(data: T[], sorting: SortCondition[]): T[] {
    if (!sorting || sorting.length === 0) return data;

    // Sort by priority (lower number = higher priority)
    const sortedConditions = [...sorting].sort((a, b) => (a.priority || 0) - (b.priority || 0));

    return data.sort((a, b) => {
      for (const condition of sortedConditions) {
        const aValue = this.getNestedValue(a, condition.field);
        const bValue = this.getNestedValue(b, condition.field);

        // Handle null/undefined values (nulls go to end)
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        let comparison = 0;

        // Compare values based on type
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else if (aValue instanceof Date && bValue instanceof Date) {
          comparison = aValue.getTime() - bValue.getTime();
        } else {
          // Fallback to string comparison
          comparison = String(aValue).localeCompare(String(bValue));
        }

        if (comparison !== 0) {
          return condition.direction === SortDirection.ASC ? comparison : -comparison;
        }
      }

      return 0;
    });
  }

  /**
   * Apply pagination to data array
   */
  private applyPagination(data: T[], pagination: PaginationConfig): {
    data: T[];
    pagination: PaginatedResponse<T>['pagination'];
  } {

    const { type, limit } = pagination;

    if (type === PaginationType.OFFSET) {
      const page = pagination.page || 1;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = data.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        pagination: {
          type,
          currentPage: page,
          totalPages: Math.ceil(data.length / limit),
          totalItems: data.length,
          hasNextPage: endIndex < data.length,
          hasPreviousPage: page > 1,
          limit
        }
      };
    } else {
      // Cursor-based pagination (simplified implementation)
      // In a real application, this would use actual cursors based on sort keys
      const cursorIndex = pagination.cursor ? parseInt(pagination.cursor) || 0 : 0;
      const endIndex = cursorIndex + limit;
      const paginatedData = data.slice(cursorIndex, endIndex);

      return {
        data: paginatedData,
        pagination: {
          type,
          totalItems: data.length,
          hasNextPage: endIndex < data.length,
          hasPreviousPage: cursorIndex > 0,
          ...(endIndex < data.length && { nextCursor: String(endIndex) }),
          ...(cursorIndex > 0 && { previousCursor: String(Math.max(0, cursorIndex - limit)) }),
          limit
        }
      };
    }
  }

  /**
   * Get nested object value using dot notation (e.g., "user.profile.name")
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current?.[key];
    }, obj);
  }

  /**
   * Generate cache key for query
   */
  private generateCacheKey(query: DataQuery): string {
    const keyData = {
      filters: query.filters,
      sorting: query.sorting,
      pagination: query.pagination,
      search: query.search,
      includes: query.includes
    };
    return this.cacheConfig.keyPrefix + btoa(JSON.stringify(keyData));
  }

  /**
   * Get cached result if available and not expired
   */
  private getCachedResult(query: DataQuery): PaginatedResponse<T> | null {
    const key = this.generateCacheKey(query);
    const cached = this.cache.get(key);

    if (cached && (Date.now() - cached.timestamp) < this.cacheConfig.ttl) {
      return {
        ...cached.data,
        metadata: {
          ...cached.data.metadata,
          cacheHit: true,
          queryTime: cached.data.metadata?.queryTime || 0
        }
      };
    }

    // Remove expired entry
    if (cached) {
      this.cache.delete(key);
    }

    return null;
  }

  /**
   * Cache query result
   */
  private cacheResult(query: DataQuery, result: PaginatedResponse<T>): void {
    // Ensure cache doesn't exceed max size
    if (this.cache.size >= this.cacheConfig.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const key = this.generateCacheKey(query);
    this.cache.set(key, {
      data: result,
      timestamp: Date.now()
    });
  }

  /**
   * Clear all cached results
   */
  clearCache(): void {
    this.cache.clear();
    enterpriseLogger.info('Data manager cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate?: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.cacheConfig.maxSize
    };
  }
}

// Utility functions for common query patterns

/**
 * Create a new query builder instance
 */
export function createQuery(): QueryBuilder {
  return new QueryBuilder();
}

/**
 * Create common filter conditions
 */
export const CommonFilters = {
  // Text search in field
  textContains: (field: string, text: string): FilterCondition => ({
    field,
    operator: FilterOperator.CONTAINS,
    value: text,
    caseSensitive: false
  }),

  // Date range filter
  dateRange: (field: string, startDate: Date, endDate: Date): FilterCondition => ({
    field,
    operator: FilterOperator.DATE_BETWEEN,
    value: null,
    values: [startDate, endDate]
  }),

  // Status filter
  statusIn: (field: string, statuses: string[]): FilterCondition => ({
    field,
    operator: FilterOperator.IN,
    value: null,
    values: statuses
  }),

  // Recent items (within days)
  recentItems: (field: string, days: number): FilterCondition => ({
    field,
    operator: FilterOperator.DATE_WITHIN_DAYS,
    value: days
  })
};

/**
 * Create common sort conditions
 */
export const CommonSorts = {
  // Sort by creation date (newest first)
  newestFirst: (field: string = 'createdAt'): SortCondition => ({
    field,
    direction: SortDirection.DESC,
    priority: 1
  }),

  // Sort by name alphabetically
  alphabetical: (field: string = 'name'): SortCondition => ({
    field,
    direction: SortDirection.ASC,
    priority: 1
  }),

  // Sort by popularity/score
  mostPopular: (field: string = 'score'): SortCondition => ({
    field,
    direction: SortDirection.DESC,
    priority: 1
  })
};
