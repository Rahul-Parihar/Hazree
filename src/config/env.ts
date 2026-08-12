/**
 * Centralized Environment Configuration
 * Provides safe defaults and type-safe access to environment variables.
 */

export const ENV = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  API_TIMEOUT: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 15000,
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Hazree Admin',
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const;
