/**
 * Business logic module for follower comparison
 * Contains pure functions for analyzing follow relationships
 */

/**
 * Finds users that you follow but who don't follow you back
 * Uses Set for O(n) time complexity
 *
 * @param {Array} following - Array of user objects that you follow
 * @param {Array} followers - Array of user objects that follow you
 * @returns {Array} Array of user objects who don't follow back
 */
export function findNotFollowingBack(following, followers) {
  // Create a Set of follower usernames for O(1) lookup
  const followerUsernames = new Set(followers.map(user => user.login));

  // Filter following list to find users not in followers Set
  return following.filter(user => !followerUsernames.has(user.login));
}
