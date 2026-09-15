#!/usr/bin/env node

/**
 * GitHub Unfollow Manager - Main Entry Point
 * Interactive CLI tool to manage GitHub follow relationships
 */

import { validateConfig } from './config.js';
import { getFollowing, getFollowers, getRateLimit, unfollowUser, followUser } from './github.js';
import { findNotFollowingBack, findFollowersNotFollowedBack } from './followers.js';
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
 * Fetches the authenticated user's follow relationship lists
 * @returns {Promise<Object>} Object with following and followers arrays
 */
async function getFollowRelationships() {
  printInfo('Fetching your following list...');
  const following = await getFollowing();

  printInfo('Fetching your followers list...');
  const followers = await getFollowers();

  return { following, followers };
}

/**
 * Parses non-interactive command options
 * @param {Array<string>} args - CLI arguments after the command name
 * @returns {Object} Parsed options
 */
function parseCommandOptions(args) {
  return {
    yes: args.includes('--yes'),
    dryRun: args.includes('--dry-run') || process.env.DRY_RUN === 'true'
  };
}

/**
 * Lists all users who don't follow back
 * Fetches data, compares, and displays results
 */
async function listNotFollowingBack({ failOnError = false } = {}) {
  try {
    const { following, followers } = await getFollowRelationships();
    const notFollowingBack = findNotFollowingBack(following, followers);
    printUserList(notFollowingBack);

  } catch (error) {
    if (failOnError) {
      throw error;
    }

    printError(error.message);
  }
}

/**
 * Runs a bulk follow relationship action
 * Checks rate limit, confirms action, and processes users
 */
async function runBulkRelationshipAction({
  title,
  emptyMessage,
  confirmationMessage,
  findTargets,
  performAction,
  successLabel,
  failureLabel,
  actionSummary,
  yes = false,
  dryRun = false
}) {
  // Check rate limit first
  printInfo('Checking API rate limit...');
  const rateLimit = await getRateLimit();
  printRateLimitWarning(rateLimit);

  // Warn if rate limit is low
  if (rateLimit.remaining < 100 && !yes && !dryRun) {
    const proceed = await confirmAction(
      'Your rate limit is low. Do you want to continue anyway?'
    );
    if (!proceed) {
      printInfo('Operation cancelled.');
      return { total: 0, successCount: 0, failedCount: 0 };
    }
  }

  // Fetch data
  const { following, followers } = await getFollowRelationships();
  const targets = findTargets(following, followers);

  if (targets.length === 0) {
    printSuccess(emptyMessage);
    return { total: 0, successCount: 0, failedCount: 0 };
  }

  // Show list and confirm
  printUserList(targets, title);

  if (dryRun) {
    printInfo(`Dry run enabled. No users were ${actionSummary}.`);
    return { total: targets.length, successCount: 0, failedCount: 0, dryRun: true };
  }

  if (!yes) {
    const confirmed = await confirmAction(
      confirmationMessage(targets.length)
    );

    if (!confirmed) {
      printInfo('Operation cancelled.');
      return { total: targets.length, successCount: 0, failedCount: 0 };
    }
  }

  // Perform action
  console.log();
  printInfo('Starting process...\n');

  let successCount = 0;
  let failedCount = 0;

  for (const user of targets) {
    const success = await performAction(user.login);
    printProgress(user.login, success, successLabel, failureLabel);

    if (success) {
      successCount++;
    } else {
      failedCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  printSummary(targets.length, successCount, failedCount);

  if (successCount > 0) {
    printSuccess(`${successLabel} ${successCount} user(s)!`);
  }

  return { total: targets.length, successCount, failedCount };
}

/**
 * Unfollows all users who don't follow back
 * Checks rate limit, confirms action, and processes unfollows
 * @param {Object} options - Command options
 * @returns {Promise<Object>} Operation summary
 */
async function unfollowAllNotFollowingBack(options = {}) {
  return await runBulkRelationshipAction({
    title: 'Users to be unfollowed',
    emptyMessage: 'Great news! Everyone you follow follows you back.',
    confirmationMessage: total => `Are you sure you want to unfollow ${total} user(s)?`,
    findTargets: findNotFollowingBack,
    performAction: unfollowUser,
    successLabel: 'Unfollowed',
    failureLabel: 'Failed to unfollow',
    actionSummary: 'unfollowed',
    ...options
  });
}

/**
 * Follows all users who follow you but you don't follow back
 * Checks rate limit, confirms action, and processes follows
 * @param {Object} options - Command options
 * @returns {Promise<Object>} Operation summary
 */
async function followAllFollowersNotFollowedBack(options = {}) {
  return await runBulkRelationshipAction({
    title: 'Users to be followed back',
    emptyMessage: 'Great news! You already follow back everyone who follows you.',
    confirmationMessage: total => `Are you sure you want to follow ${total} user(s)?`,
    findTargets: findFollowersNotFollowedBack,
    performAction: followUser,
    successLabel: 'Followed',
    failureLabel: 'Failed to follow',
    actionSummary: 'followed',
    ...options
  });
}

/**
 * Handles non-interactive commands for automation and GitHub Actions
 * @param {string} command - Command name
 * @param {Array<string>} args - Command arguments
 */
async function runCommand(command, args) {
  const options = parseCommandOptions(args);
  let result;

  switch (command) {
    case 'list:not-following-back':
      await listNotFollowingBack({ failOnError: true });
      return;

    case 'unfollow:not-following-back':
      result = await unfollowAllNotFollowingBack(options);
      break;

    case 'follow:followers':
      result = await followAllFollowersNotFollowedBack(options);
      break;

    default:
      printError(`Unknown command: ${command}`);
      printInfo('Available commands: list:not-following-back, unfollow:not-following-back, follow:followers');
      process.exit(1);
  }

  if (result?.failedCount > 0) {
    process.exitCode = 1;
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
        try {
          await unfollowAllNotFollowingBack();
        } catch (error) {
          printError(error.message);
        }
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

    const [command, ...args] = process.argv.slice(2);

    if (command) {
      await runCommand(command, args);
      return;
    }

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
