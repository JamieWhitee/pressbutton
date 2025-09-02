/**
 * Enterprise Configuration Management System
 * Provides centralized configuration management with environment-specific settings,
 * runtime configuration updates, and secure configuration storage.
 */

import { enterpriseLogger, OperationType } from '../logging/enterprise-logger';

// Environment types
export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TESTING = 'testing'
}

// Configuration categories
export enum ConfigCategory {
  API = 'api',
  UI = 'ui',
  SECURITY = 'security',
  LOGGING = 'logging',
  FEATURE_FLAGS = 'feature-flags',
  PERFORMANCE = 'performance',
  INTEGRATIONS = 'integrations',
  ACCESSIBILITY = 'accessibility'
}

// Configuration sensitivity levels
export enum ConfigSensitivity {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted'
}

// Configuration source types
export enum ConfigSource {
  ENVIRONMENT = 'environment',
  LOCAL_STORAGE = 'local-storage',
  SESSION_STORAGE = 'session-storage',
  API = 'api',
  DEFAULT = 'default',
  OVERRIDE = 'override'
}

// Configuration value types
export type ConfigValue = string | number | boolean | object | Array<any> | null;

// Configuration schema definition
interface ConfigSchema {
  key: string;
  category: ConfigCategory;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  defaultValue: ConfigValue;
  description: string;
  sensitivity: ConfigSensitivity;
  environmentSpecific: boolean;
  required: boolean;
  validation?: (value: ConfigValue) => boolean;
  transform?: (value: ConfigValue) => ConfigValue;
}

// Configuration entry
interface ConfigEntry {
  key: string;
  value: ConfigValue;
  source: ConfigSource;
  lastUpdated: Date;
  environment: Environment;
  category: ConfigCategory;
  sensitivity: ConfigSensitivity;
}

// Configuration update event
interface ConfigUpdateEvent {
  key: string;
  oldValue: ConfigValue;
  newValue: ConfigValue;
  source: ConfigSource;
  timestamp: Date;
}

// Configuration validation result
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Enterprise Configuration Manager Class
 */
export class EnterpriseConfigManager {
  private static instance: EnterpriseConfigManager;
  private config: Map<string, ConfigEntry> = new Map();
  private schemas: Map<string, ConfigSchema> = new Map();
  private environment!: Environment;
  private updateListeners: Array<(event: ConfigUpdateEvent) => void> = [];
  private watchedKeys: Set<string> = new Set();

  // Default configuration schemas
  private defaultSchemas: ConfigSchema[] = [
    // API Configuration
    {
      key: 'api.baseUrl',
      category: ConfigCategory.API,
      type: 'string',
      defaultValue: 'http://localhost:3001',
      description: 'Base URL for API endpoints',
      sensitivity: ConfigSensitivity.PUBLIC,
      environmentSpecific: true,
      required: true,
      validation: (value) => typeof value === 'string' && value.startsWith('http')
    },
    {
      key: 'api.timeout',
      category: ConfigCategory.API,
      type: 'number',
      defaultValue: 30000,
      description: 'API request timeout in milliseconds',
      sensitivity: ConfigSensitivity.PUBLIC,
      environmentSpecific: false,
      required: true,
      validation: (value) => typeof value === 'number' && value > 0
    },
    {
      key: 'api.retryAttempts',
      category: ConfigCategory.API,
      type: 'number',
      defaultValue: 3,
      description: 'Number of retry attempts for failed API requests',
      sensitivity: ConfigSensitivity.PUBLIC,
      environmentSpecific: false,
      required: true,
      validation: (value) => typeof value === 'number' && value >= 0 && value <= 10
    },
    {
      key: 'api.enableMocks',
      category: ConfigCategory.API,
      type: 'boolean',
      defaultValue: false,
      description: 'Enable API mocking for development',
      sensitivity: ConfigSensitivity.INTERNAL,
      environmentSpecific: true,
      required: false
    },

    // UI Configuration
    {
      key: 'ui.theme',
      category: ConfigCategory.UI,
      type: 'string',
      defaultValue: 'light',
      description: 'Default theme mode',
      sensitivity: ConfigSensitivity.PUBLIC,
      environmentSpecific: false,
      required: false,
      validation: (value) => ['light', 'dark', 'auto'].includes(value as string)
    },
    {
      key: 'ui.language',
      category: ConfigCategory.UI,
      type: 'string',
      defaultValue: 'en',
      description: 'Default language',
      sensitivity: ConfigSensitivity.PUBLIC,
      environmentSpecific: false,
      required: false
    },
    {
      key: 'ui.pageSize',
      category: ConfigCategory.UI,
      type: 'number',
      defaultValue: 20,
      description: 'Default items per page for pagination',
      sensitivity: ConfigSensitivity.PUBLIC,
      environmentSpecific: false,
      required: false,
      validation: (value) => typeof value === 'number' && value > 0 && value <= 100
    },
    {
      key: 'ui.enableAnimations',
      category: ConfigCategory.UI,
      type: 'boolean',
      defaultValue: true,
      description: 'Enable UI animations',
      sensitivity: ConfigSensitivity.PUBLIC,
      environmentSpecific: false,
      required: false
    },

    // Security Configuration
    {
      key: 'security.sessionTimeout',
      category: ConfigCategory.SECURITY,
      type: 'number',
      defaultValue: 30 * 60 * 1000, // 30 minutes
      description: 'Session timeout in milliseconds',
      sensitivity: ConfigSensitivity.CONFIDENTIAL,
      environmentSpecific: true,
      required: true,
      validation: (value) => typeof value === 'number' && value > 0
    },
    {
      key: 'security.enableCSRF',
      category: ConfigCategory.SECURITY,
      type: 'boolean',
      defaultValue: true,
      description: 'Enable CSRF protection',
      sensitivity: ConfigSensitivity.CONFIDENTIAL,
      environmentSpecific: true,
      required: true
    },
    {
      key: 'security.rateLimitWindow',
      category: ConfigCategory.SECURITY,
      type: 'number',
      defaultValue: 15 * 60 * 1000, // 15 minutes
      description: 'Rate limiting window in milliseconds',
      sensitivity: ConfigSensitivity.CONFIDENTIAL,
      environmentSpecific: true,
      required: true,
      validation: (value) => typeof value === 'number' && value > 0
    },
    {
      key: 'security.maxRequestsPerWindow',
      category: ConfigCategory.SECURITY,
      type: 'number',
      defaultValue: 100,
      description: 'Maximum requests per rate limit window',
      sensitivity: ConfigSensitivity.CONFIDENTIAL,
      environmentSpecific: true,
      required: true,
      validation: (value) => typeof value === 'number' && value > 0
    },

    // Logging Configuration
    {
      key: 'logging.level',
      category: ConfigCategory.LOGGING,
      type: 'string',
      defaultValue: 'info',
      description: 'Logging level',
      sensitivity: ConfigSensitivity.INTERNAL,
      environmentSpecific: true,
      required: true,
      validation: (value) => ['error', 'warn', 'info', 'debug', 'trace'].includes(value as string)
    },
    {
      key: 'logging.enableConsole',
      category: ConfigCategory.LOGGING,
      type: 'boolean',
      defaultValue: true,
      description: 'Enable console logging',
      sensitivity: ConfigSensitivity.INTERNAL,
      environmentSpecific: true,
      required: false
    },
    {
      key: 'logging.enableRemote',
      category: ConfigCategory.LOGGING,
      type: 'boolean',
      defaultValue: false,
      description: 'Enable remote logging',
      sensitivity: ConfigSensitivity.INTERNAL,
      environmentSpecific: true,
      required: false
    },
    {
      key: 'logging.batchSize',
      category: ConfigCategory.LOGGING,
      type: 'number',
      defaultValue: 10,
      description: 'Log batch size for remote logging',
      sensitivity: ConfigSensitivity.INTERNAL,
      environmentSpecific: false,
      required: false,
      validation: (value) => typeof value === 'number' && value > 0 && value <= 100
    },

    // Feature Flags
    {
      key: 'features.enableComments',
      category: ConfigCategory.FEATURE_FLAGS,
      type: 'boolean',
      defaultValue: true,
      description: 'Enable comments feature',
      sensitivity: ConfigSensitivity.PUBLIC,
      environmentSpecific: true,
      required: false
    },
    {
      key: 'features.enableNotifications',
      category: ConfigCategory.FEATURE_FLAGS,
      type: 'boolean',
      defaultValue: true,
      description: 'Enable notifications feature',
      sensitivity: ConfigSensitivity.PUBLIC,
      environmentSpecific: true,
      required: false
    },
    {
      key: 'features.enableAnalytics',
      category: ConfigCategory.FEATURE_FLAGS,
      type: 'boolean',
      defaultValue: false,
      description: 'Enable analytics tracking',
      sensitivity: ConfigSensitivity.INTERNAL,
      environmentSpecific: true,
      required: false
    },
    {
      key: 'features.betaFeatures',
      category: ConfigCategory.FEATURE_FLAGS,
      type: 'array',
      defaultValue: [],
      description: 'List of enabled beta features',
      sensitivity: ConfigSensitivity.INTERNAL,
      environmentSpecific: true,
      required: false
    },

    // Performance Configuration
    {
      key: 'performance.enableCaching',
      category: ConfigCategory.PERFORMANCE,
      type: 'boolean',
      defaultValue: true,
      description: 'Enable client-side caching',
      sensitivity: ConfigSensitivity.PUBLIC,
      environmentSpecific: false,
      required: false
    },
    {
      key: 'performance.cacheMaxAge',
      category: ConfigCategory.PERFORMANCE,
      type: 'number',
      defaultValue: 5 * 60 * 1000, // 5 minutes
      description: 'Cache maximum age in milliseconds',
      sensitivity: ConfigSensitivity.PUBLIC,
      environmentSpecific: false,
      required: false,
      validation: (value) => typeof value === 'number' && value > 0
    },
    {
      key: 'performance.enableLazyLoading',
      category: ConfigCategory.PERFORMANCE,
      type: 'boolean',
      defaultValue: true,
      description: 'Enable lazy loading for components',
      sensitivity: ConfigSensitivity.PUBLIC,
      environmentSpecific: false,
      required: false
    },
    {
      key: 'performance.debounceDelay',
      category: ConfigCategory.PERFORMANCE,
      type: 'number',
      defaultValue: 300,
      description: 'Default debounce delay in milliseconds',
      sensitivity: ConfigSensitivity.PUBLIC,
      environmentSpecific: false,
      required: false,
      validation: (value) => typeof value === 'number' && value >= 0
    }
  ];

  private constructor() {
    this.detectEnvironment();
    this.initializeSchemas();
    this.loadConfiguration();
    this.setupEnvironmentWatchers();
  }

  public static getInstance(): EnterpriseConfigManager {
    if (!EnterpriseConfigManager.instance) {
      EnterpriseConfigManager.instance = new EnterpriseConfigManager();
    }
    return EnterpriseConfigManager.instance;
  }

  /**
   * Detect current environment
   */
  private detectEnvironment(): void {
    if (typeof window !== 'undefined') {
      // Browser environment
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;

      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        this.environment = Environment.DEVELOPMENT;
      } else if (hostname.includes('staging') || hostname.includes('test')) {
        this.environment = Environment.STAGING;
      } else if (protocol === 'https:') {
        this.environment = Environment.PRODUCTION;
      } else {
        this.environment = Environment.DEVELOPMENT;
      }
    } else {
      // Node.js environment
      this.environment = (process.env.NODE_ENV as Environment) || Environment.DEVELOPMENT;
    }

    enterpriseLogger.info('Environment detected', {
      environment: this.environment,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'
    }, OperationType.SYSTEM_STARTUP);
  }

  /**
   * Initialize configuration schemas
   */
  private initializeSchemas(): void {
    this.defaultSchemas.forEach(schema => {
      this.schemas.set(schema.key, schema);
    });

    enterpriseLogger.info('Configuration schemas initialized', {
      schemaCount: this.schemas.size,
      categories: Array.from(new Set(this.defaultSchemas.map(s => s.category)))
    }, OperationType.SYSTEM_STARTUP);
  }

  /**
   * Load configuration from various sources
   */
  private loadConfiguration(): void {
    // Load default values first
    this.schemas.forEach((schema) => {
      this.setConfigEntry(
        schema.key,
        schema.defaultValue,
        ConfigSource.DEFAULT,
        schema.category,
        schema.sensitivity
      );
    });

    // Load from environment variables
    this.loadFromEnvironment();

    // Load from local storage
    this.loadFromLocalStorage();

    // Load environment-specific overrides
    this.loadEnvironmentOverrides();

    enterpriseLogger.info('Configuration loaded', {
      configCount: this.config.size,
      environment: this.environment,
      sources: this.getConfigSources()
    }, OperationType.SYSTEM_STARTUP);
  }

  /**
   * Load configuration from environment variables
   */
  private loadFromEnvironment(): void {
    if (typeof process === 'undefined') return;

    const envConfig: Record<string, string> = {};

    // Collect Next.js public environment variables
    Object.keys(process.env).forEach(key => {
      if (key.startsWith('NEXT_PUBLIC_')) {
        const configKey = key.replace('NEXT_PUBLIC_', '').toLowerCase().replace(/_/g, '.');
        envConfig[configKey] = process.env[key] || '';
      }
    });

    // Map environment variables to configuration keys
    const envMappings: Record<string, string> = {
      'api.base.url': 'api.baseUrl',
      'api.url': 'api.baseUrl',
      'app.theme': 'ui.theme',
      'app.language': 'ui.language',
      'log.level': 'logging.level',
      'enable.analytics': 'features.enableAnalytics'
    };

    Object.entries(envConfig).forEach(([key, value]) => {
      const configKey = envMappings[key] || key;
      const schema = this.schemas.get(configKey);

      if (schema) {
        const transformedValue = this.transformValue(value, schema.type);
        this.setConfigEntry(
          configKey,
          transformedValue,
          ConfigSource.ENVIRONMENT,
          schema.category,
          schema.sensitivity
        );
      }
    });
  }

  /**
   * Load configuration from local storage
   */
  private loadFromLocalStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('enterprise-config');
      if (stored) {
        const parsedConfig = JSON.parse(stored);

        Object.entries(parsedConfig).forEach(([key, value]) => {
          const schema = this.schemas.get(key);
          if (schema && schema.sensitivity !== ConfigSensitivity.RESTRICTED) {
            this.setConfigEntry(
              key,
              value as ConfigValue,
              ConfigSource.LOCAL_STORAGE,
              schema.category,
              schema.sensitivity
            );
          }
        });
      }
    } catch (error) {
      enterpriseLogger.warn('Failed to load configuration from localStorage', { error });
    }
  }

  /**
   * Load environment-specific configuration overrides
   */
  private loadEnvironmentOverrides(): void {
    const overrides: Record<Environment, Record<string, ConfigValue>> = {
      [Environment.DEVELOPMENT]: {
        'api.enableMocks': true,
        'logging.level': 'debug',
        'logging.enableConsole': true,
        'features.enableAnalytics': false,
        'security.rateLimitWindow': 60000, // 1 minute for dev
        'security.maxRequestsPerWindow': 1000
      },
      [Environment.STAGING]: {
        'api.enableMocks': false,
        'logging.level': 'info',
        'logging.enableConsole': true,
        'logging.enableRemote': true,
        'features.enableAnalytics': true,
        'features.betaFeatures': ['new-ui', 'enhanced-search']
      },
      [Environment.PRODUCTION]: {
        'api.enableMocks': false,
        'logging.level': 'warn',
        'logging.enableConsole': false,
        'logging.enableRemote': true,
        'features.enableAnalytics': true,
        'performance.enableCaching': true,
        'security.enableCSRF': true
      },
      [Environment.TESTING]: {
        'api.enableMocks': true,
        'logging.level': 'error',
        'logging.enableConsole': false,
        'features.enableAnalytics': false,
        'performance.enableCaching': false
      }
    };

    const envOverrides = overrides[this.environment] || {};

    Object.entries(envOverrides).forEach(([key, value]) => {
      const schema = this.schemas.get(key);
      if (schema) {
        this.setConfigEntry(
          key,
          value,
          ConfigSource.OVERRIDE,
          schema.category,
          schema.sensitivity
        );
      }
    });
  }

  /**
   * Set configuration entry
   */
  private setConfigEntry(
    key: string,
    value: ConfigValue,
    source: ConfigSource,
    category: ConfigCategory,
    sensitivity: ConfigSensitivity
  ): void {
    const entry: ConfigEntry = {
      key,
      value,
      source,
      lastUpdated: new Date(),
      environment: this.environment,
      category,
      sensitivity
    };

    this.config.set(key, entry);
  }

  /**
   * Transform string value to appropriate type
   */
  private transformValue(value: string, type: string): ConfigValue {
    switch (type) {
      case 'boolean':
        return value.toLowerCase() === 'true';
      case 'number':
        const num = Number(value);
        return isNaN(num) ? value : num;
      case 'object':
      case 'array':
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      default:
        return value;
    }
  }

  /**
   * Get configuration value
   */
  get<T extends ConfigValue = ConfigValue>(key: string, defaultValue?: T): T {
    const entry = this.config.get(key);
    if (entry) {
      return entry.value as T;
    }

    const schema = this.schemas.get(key);
    if (schema) {
      return schema.defaultValue as T;
    }

    if (defaultValue !== undefined) {
      return defaultValue;
    }

    enterpriseLogger.warn('Configuration key not found', { key });
    return null as T;
  }

  /**
   * Set configuration value
   */
  set(key: string, value: ConfigValue, persistent: boolean = false): boolean {
    const schema = this.schemas.get(key);
    if (!schema) {
      enterpriseLogger.warn('Attempted to set unknown configuration key', { key });
      return false;
    }

    // Validate value
    const validation = this.validateValue(key, value);
    if (!validation.isValid) {
      enterpriseLogger.error('Configuration validation failed', {
        key,
        value,
        errors: validation.errors
      });
      return false;
    }

    const oldEntry = this.config.get(key);
    const oldValue = oldEntry?.value || schema.defaultValue;

    // Set new value
    this.setConfigEntry(
      key,
      value,
      persistent ? ConfigSource.LOCAL_STORAGE : ConfigSource.OVERRIDE,
      schema.category,
      schema.sensitivity
    );

    // Persist to localStorage if requested and allowed
    if (persistent && schema.sensitivity !== ConfigSensitivity.RESTRICTED) {
      this.persistToLocalStorage(key, value);
    }

    // Notify listeners
    const updateEvent: ConfigUpdateEvent = {
      key,
      oldValue,
      newValue: value,
      source: persistent ? ConfigSource.LOCAL_STORAGE : ConfigSource.OVERRIDE,
      timestamp: new Date()
    };
    this.notifyUpdateListeners(updateEvent);

    enterpriseLogger.info('Configuration updated', {
      key,
      oldValue,
      newValue: value,
      persistent,
      category: schema.category
    }, OperationType.CONFIGURATION);

    return true;
  }

  /**
   * Validate configuration value
   */
  private validateValue(key: string, value: ConfigValue): ValidationResult {
    const schema = this.schemas.get(key);
    if (!schema) {
      return {
        isValid: false,
        errors: [`Unknown configuration key: ${key}`],
        warnings: []
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Type validation
    if (value !== null) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== schema.type) {
        errors.push(`Expected type ${schema.type}, got ${actualType}`);
      }
    }

    // Required validation
    if (schema.required && (value === null || value === undefined)) {
      errors.push('Value is required');
    }

    // Custom validation
    if (schema.validation && value !== null) {
      try {
        if (!schema.validation(value)) {
          errors.push('Custom validation failed');
        }
      } catch (error) {
        errors.push(`Validation error: ${error}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Persist configuration to localStorage
   */
  private persistToLocalStorage(key: string, value: ConfigValue): void {
    if (typeof window === 'undefined') return;

    try {
      const existing = JSON.parse(localStorage.getItem('enterprise-config') || '{}');
      existing[key] = value;
      localStorage.setItem('enterprise-config', JSON.stringify(existing));
    } catch (error) {
      enterpriseLogger.warn('Failed to persist configuration to localStorage', { key, error });
    }
  }

  /**
   * Add configuration update listener
   */
  onConfigUpdate(listener: (event: ConfigUpdateEvent) => void): () => void {
    this.updateListeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.updateListeners.indexOf(listener);
      if (index > -1) {
        this.updateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify update listeners
   */
  private notifyUpdateListeners(event: ConfigUpdateEvent): void {
    this.updateListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        enterpriseLogger.error('Configuration update listener error', { error });
      }
    });
  }

  /**
   * Watch specific configuration keys
   */
  watch(key: string, callback: (newValue: ConfigValue, oldValue: ConfigValue) => void): () => void {
    this.watchedKeys.add(key);

    const unsubscribe = this.onConfigUpdate((event) => {
      if (event.key === key) {
        callback(event.newValue, event.oldValue);
      }
    });

    return () => {
      this.watchedKeys.delete(key);
      unsubscribe();
    };
  }

  /**
   * Get configuration by category
   */
  getByCategory(category: ConfigCategory): Map<string, ConfigValue> {
    const result = new Map<string, ConfigValue>();

    this.config.forEach((entry, key) => {
      if (entry.category === category) {
        result.set(key, entry.value);
      }
    });

    return result;
  }

  /**
   * Get all configuration sources
   */
  private getConfigSources(): string[] {
    const sources = new Set<string>();
    this.config.forEach(entry => sources.add(entry.source));
    return Array.from(sources);
  }

  /**
   * Setup environment watchers
   */
  private setupEnvironmentWatchers(): void {
    if (typeof window === 'undefined') return;

    // Watch for storage changes from other tabs
    window.addEventListener('storage', (event) => {
      if (event.key === 'enterprise-config' && event.newValue) {
        try {
          const newConfig = JSON.parse(event.newValue);
          Object.entries(newConfig).forEach(([key, value]) => {
            const current = this.get(key);
            if (current !== value) {
              this.set(key, value as ConfigValue, false);
            }
          });
        } catch (error) {
          enterpriseLogger.warn('Failed to process storage change', { error });
        }
      }
    });
  }

  /**
   * Export configuration for debugging
   */
  exportConfig(includeSensitive: boolean = false): Record<string, any> {
    const exported: Record<string, any> = {};

    this.config.forEach((entry, key) => {
      if (includeSensitive || entry.sensitivity === ConfigSensitivity.PUBLIC) {
        exported[key] = {
          value: entry.value,
          source: entry.source,
          lastUpdated: entry.lastUpdated,
          category: entry.category,
          sensitivity: entry.sensitivity
        };
      }
    });

    return exported;
  }

  /**
   * Get configuration statistics
   */
  getStats(): {
    totalConfigs: number;
    configsByCategory: Record<ConfigCategory, number>;
    configsBySensitivity: Record<ConfigSensitivity, number>;
    configsBySource: Record<ConfigSource, number>;
    environment: Environment;
    lastUpdated: Date;
  } {
    const stats = {
      totalConfigs: this.config.size,
      configsByCategory: {} as Record<ConfigCategory, number>,
      configsBySensitivity: {} as Record<ConfigSensitivity, number>,
      configsBySource: {} as Record<ConfigSource, number>,
      environment: this.environment,
      lastUpdated: new Date()
    };

    // Initialize counters
    Object.values(ConfigCategory).forEach(cat => stats.configsByCategory[cat] = 0);
    Object.values(ConfigSensitivity).forEach(sens => stats.configsBySensitivity[sens] = 0);
    Object.values(ConfigSource).forEach(src => stats.configsBySource[src] = 0);

    // Count configurations
    this.config.forEach(entry => {
      stats.configsByCategory[entry.category]++;
      stats.configsBySensitivity[entry.sensitivity]++;
      stats.configsBySource[entry.source]++;
    });

    return stats;
  }

  /**
   * Reset configuration to defaults
   */
  resetToDefaults(): void {
    this.config.clear();
    this.loadConfiguration();

    enterpriseLogger.info('Configuration reset to defaults', {
      environment: this.environment,
      configCount: this.config.size
    }, OperationType.CONFIGURATION);
  }

  /**
   * Get current environment
   */
  getEnvironment(): Environment {
    return this.environment;
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(featureKey: string): boolean {
    const fullKey = `features.${featureKey}`;
    return this.get<boolean>(fullKey, false);
  }

  /**
   * Get API configuration
   */
  getApiConfig(): {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    enableMocks: boolean;
  } {
    return {
      baseUrl: this.get<string>('api.baseUrl', 'http://localhost:3001'),
      timeout: this.get<number>('api.timeout', 30000),
      retryAttempts: this.get<number>('api.retryAttempts', 3),
      enableMocks: this.get<boolean>('api.enableMocks', false)
    };
  }

  /**
   * Get UI configuration
   */
  getUIConfig(): {
    theme: string;
    language: string;
    pageSize: number;
    enableAnimations: boolean;
  } {
    return {
      theme: this.get<string>('ui.theme', 'light'),
      language: this.get<string>('ui.language', 'en'),
      pageSize: this.get<number>('ui.pageSize', 20),
      enableAnimations: this.get<boolean>('ui.enableAnimations', true)
    };
  }

  /**
   * Get security configuration
   */
  getSecurityConfig(): {
    sessionTimeout: number;
    enableCSRF: boolean;
    rateLimitWindow: number;
    maxRequestsPerWindow: number;
  } {
    return {
      sessionTimeout: this.get<number>('security.sessionTimeout', 30 * 60 * 1000),
      enableCSRF: this.get<boolean>('security.enableCSRF', true),
      rateLimitWindow: this.get<number>('security.rateLimitWindow', 15 * 60 * 1000),
      maxRequestsPerWindow: this.get<number>('security.maxRequestsPerWindow', 100)
    };
  }
}

// Export singleton instance
export const enterpriseConfigManager = EnterpriseConfigManager.getInstance();
