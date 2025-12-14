/**
 * API request timeout in milliseconds (30 seconds)
 * Prevents requests from hanging indefinitely
 */
export const API_TIMEOUT_MS = 30000

/**
 * React Query default configuration
 */
export const QUERY_CONFIG = {
  /**
   * Number of times to retry failed queries
   */
  RETRY_COUNT: 3,

  /**
   * Time in milliseconds before data is considered stale (30 seconds)
   */
  STALE_TIME_MS: 30000,

  /**
   * Number of times to retry failed mutations
   */
  MUTATION_RETRY_COUNT: 2
} as const
