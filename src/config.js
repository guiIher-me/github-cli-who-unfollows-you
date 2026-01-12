/**
 * Configuration and environment validation module
 * Loads and validates required environment variables from .env file
 */

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Validates that all required environment variables are present
 * @returns {Object} Validated configuration object
 * @throws {Error} If required environment variables are missing
 */
export function validateConfig() {
  const required = ['GITHUB_TOKEN', 'GITHUB_USERNAME'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please create a .env file based on .env.example and fill in your GitHub credentials.'
    );
  }

  return {
    token: process.env.GITHUB_TOKEN,
    username: process.env.GITHUB_USERNAME
  };
}
