/**
 * GitHub API client module
 * Handles all interactions with the GitHub REST API
 */

import { validateConfig } from './config.js';

const config = validateConfig();
const BASE_URL = 'https://api.github.com';

/**
 * Creates headers for GitHub API requests
 * @returns {Object} Headers object with authorization and content type
 */
function getHeaders() {
  return {
    'Authorization': `token ${config.token}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitHub-Unfollow-Manager'
  };
}

/**
 * Fetches all pages of a paginated GitHub API endpoint
 * @param {string} url - The API endpoint URL
 * @returns {Promise<Array>} Array of all results from all pages
 * @throws {Error} If the API request fails
 */
async function fetchAllPages(url) {
  let results = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`${url}?per_page=100&page=${page}`, {
      headers: getHeaders()
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`GitHub API error: ${response.status} - ${error.message}`);
    }

    const data = await response.json();
    results.push(...data);
    hasMore = data.length === 100;
    page++;
  }

  return results;
}

/**
 * Gets all users that the authenticated user follows
 * @returns {Promise<Array>} Array of user objects
 */
export async function getFollowing() {
  return await fetchAllPages(`${BASE_URL}/user/following`);
}

/**
 * Gets all users that follow the authenticated user
 * @returns {Promise<Array>} Array of user objects
 */
export async function getFollowers() {
  return await fetchAllPages(`${BASE_URL}/user/followers`);
}

/**
 * Gets current rate limit information from GitHub API
 * @returns {Promise<Object>} Rate limit info with remaining, limit, and reset time
 */
export async function getRateLimit() {
  const response = await fetch(`${BASE_URL}/rate_limit`, {
    headers: getHeaders()
  });

  if (!response.ok) {
    throw new Error(`Failed to get rate limit: ${response.status}`);
  }

  const data = await response.json();
  return {
    remaining: data.resources.core.remaining,
    limit: data.resources.core.limit,
    reset: new Date(data.resources.core.reset * 1000)
  };
}

/**
 * Unfollows a specific user
 * @param {string} username - The username to unfollow
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export async function unfollowUser(username) {
  const response = await fetch(`${BASE_URL}/user/following/${username}`, {
    method: 'DELETE',
    headers: getHeaders()
  });

  // 204 No Content is the success response for DELETE
  return response.status === 204;
}
