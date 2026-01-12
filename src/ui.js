/**
 * UI module for CLI output and user input
 * Handles all terminal interactions, colored output, and user prompts
 */

import chalk from 'chalk';
import readline from 'readline/promises';

/**
 * Prints the application header with branding
 */
export function printHeader() {
  console.log('\n' + chalk.cyan.bold('=========================================='));
  console.log(chalk.cyan.bold('   GitHub Unfollow Manager'));
  console.log(chalk.cyan.bold('==========================================') + '\n');
}

/**
 * Prints the interactive menu with available options
 */
export function printMenu() {
  console.log(chalk.cyan('\nWhat would you like to do?\n'));
  console.log('  1. List users who don\'t follow me back');
  console.log('  2. Unfollow all users who don\'t follow me back');
  console.log('  0. Exit\n');
}

/**
 * Prints a list of users with colored formatting
 * @param {Array} users - Array of user objects to display
 * @param {string} title - Title to display above the list
 */
export function printUserList(users, title = 'Users not following back') {
  console.log('\n' + chalk.cyan.bold(`${title}:`));
  console.log(chalk.yellow(`Found ${users.length} user(s)\n`));

  if (users.length === 0) {
    console.log(chalk.green('Great news! Everyone you follow follows you back.'));
  } else {
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.login} - ${chalk.gray(user.html_url)}`);
    });
  }
  console.log();
}

/**
 * Prints progress during unfollow operations
 * @param {string} username - Username being unfollowed
 * @param {boolean} success - Whether the unfollow was successful
 */
export function printProgress(username, success) {
  if (success) {
    console.log(chalk.green(`✓ Unfollowed ${username}`));
  } else {
    console.log(chalk.red(`✗ Failed to unfollow ${username}`));
  }
}

/**
 * Prints a summary after bulk unfollow operations
 * @param {number} total - Total number of users processed
 * @param {number} success - Number of successful unfollows
 * @param {number} failed - Number of failed unfollows
 */
export function printSummary(total, success, failed) {
  console.log('\n' + chalk.cyan.bold('Summary:'));
  console.log(`  Total processed: ${total}`);
  console.log(chalk.green(`  Successful: ${success}`));
  if (failed > 0) {
    console.log(chalk.red(`  Failed: ${failed}`));
  }
  console.log();
}

/**
 * Prints a warning about API rate limits
 * @param {Object} rateLimit - Rate limit object with remaining, limit, and reset
 */
export function printRateLimitWarning(rateLimit) {
  const { remaining, limit, reset } = rateLimit;
  const percentage = (remaining / limit) * 100;

  console.log();
  if (percentage < 20) {
    console.log(chalk.red.bold('⚠ WARNING: Low API rate limit!'));
    console.log(chalk.red(`  Remaining requests: ${remaining}/${limit}`));
    console.log(chalk.yellow(`  Resets at: ${reset.toLocaleString()}`));
  } else {
    console.log(chalk.yellow(`API Rate Limit: ${remaining}/${limit} requests remaining`));
  }
  console.log();
}

/**
 * Gets user input from the command line
 * @param {string} prompt - The prompt to display to the user
 * @returns {Promise<string>} The user's input (trimmed)
 */
export async function getUserInput(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await rl.question(chalk.white(prompt));
  rl.close();
  return answer.trim();
}

/**
 * Asks for yes/no confirmation from the user
 * @param {string} message - The confirmation message
 * @returns {Promise<boolean>} True if user confirms (y/yes), false otherwise
 */
export async function confirmAction(message) {
  const answer = await getUserInput(`${message} (y/N): `);
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

/**
 * Prints an error message in red
 * @param {string} message - The error message to display
 */
export function printError(message) {
  console.log('\n' + chalk.red.bold('Error: ') + chalk.red(message) + '\n');
}

/**
 * Prints a success message in green
 * @param {string} message - The success message to display
 */
export function printSuccess(message) {
  console.log('\n' + chalk.green(message) + '\n');
}

/**
 * Prints an info message in cyan
 * @param {string} message - The info message to display
 */
export function printInfo(message) {
  console.log(chalk.cyan(message));
}
