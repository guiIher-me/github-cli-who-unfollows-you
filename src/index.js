#!/usr/bin/env node

/**
 * GitHub Unfollow Manager - Main Entry Point
 * Interactive CLI tool to manage GitHub follow relationships
 */

import { validateConfig } from './config.js';
import { getFollowing, getFollowers, getRateLimit, unfollowUser } from './github.js';
import { findNotFollowingBack } from './followers.js';
import {
  printHeader,
  printMenu,
  printUserList,
  printProgress,
  printSummary,
  printRateLimitWarning,
  printError,
  printSuccess,
  printInfo,
  getUserInput,
  confirmAction
} from './ui.js';

/**
 * Lists all users who don't follow back
 * Fetches data, compares, and displays results
 */
async function listNotFollowingBack() {
  try {
    printInfo('Fetching your following list...');
    const following = await getFollowing();

    printInfo('Fetching your followers list...');
    const followers = await getFollowers();

    const notFollowingBack = findNotFollowingBack(following, followers);
    printUserList(notFollowingBack);

  } catch (error) {
    printError(error.message);
  }
}

/**
 * Unfollows all users who don't follow back
 * Checks rate limit, confirms action, and processes unfollows
 */
async function unfollowAllNotFollowingBack() {
  try {
    // Check rate limit first
    printInfo('Checking API rate limit...');
    const rateLimit = await getRateLimit();
    printRateLimitWarning(rateLimit);

    // Warn if rate limit is low
    if (rateLimit.remaining < 100) {
      const proceed = await confirmAction(
        'Your rate limit is low. Do you want to continue anyway?'
      );
      if (!proceed) {
        printInfo('Operation cancelled.');
        return;
      }
    }

    // Fetch data
    printInfo('Fetching your following list...');
    const following = await getFollowing();

    printInfo('Fetching your followers list...');
    const followers = await getFollowers();

    const notFollowingBack = findNotFollowingBack(following, followers);

    if (notFollowingBack.length === 0) {
      printSuccess('Great news! Everyone you follow follows you back.');
      return;
    }

    // Show list and confirm
    printUserList(notFollowingBack, 'Users to be unfollowed');

    const confirmed = await confirmAction(
      `Are you sure you want to unfollow ${notFollowingBack.length} user(s)?`
    );

    if (!confirmed) {
      printInfo('Operation cancelled.');
      return;
    }

    // Perform unfollows
    console.log();
    printInfo('Starting unfollow process...\n');

    let successCount = 0;
    let failedCount = 0;

    for (const user of notFollowingBack) {
      const success = await unfollowUser(user.login);
      printProgress(user.login, success);

      if (success) {
        successCount++;
      } else {
        failedCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    printSummary(notFollowingBack.length, successCount, failedCount);

    if (successCount > 0) {
      printSuccess(`Successfully unfollowed ${successCount} user(s)!`);
    }

  } catch (error) {
    printError(error.message);
  }
}

/**
 * Main CLI loop
 * Displays menu and handles user choices interactively
 */
async function runCLI() {
  printHeader();

  let running = true;

  while (running) {
    printMenu();

    const choice = await getUserInput('Enter your choice (0-2): ');

    switch (choice) {
      case '1':
        await listNotFollowingBack();
        break;

      case '2':
        await unfollowAllNotFollowingBack();
        break;

      case '0':
        running = false;
        printSuccess('Goodbye! Thanks for using GitHub Unfollow Manager.');
        break;

      default:
        printError('Invalid choice. Please enter 0, 1, or 2.');
    }
  }

  process.exit(0);
}

/**
 * Application entry point
 * Validates configuration and starts the CLI
 */
async function main() {
  try {
    // Validate environment variables
    validateConfig();

    // Handle Ctrl+C gracefully
    process.on('SIGINT', () => {
      printInfo('\n\nReceived interrupt signal. Exiting gracefully...');
      printSuccess('Goodbye!');
      process.exit(0);
    });

    // Start the interactive CLI
    await runCLI();

  } catch (error) {
    printError(error.message);
    process.exit(1);
  }
}

// Run the application
main();
