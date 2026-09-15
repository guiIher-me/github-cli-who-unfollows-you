# GitHub Unfollow Manager

A clean, interactive CLI tool to help you manage your GitHub follow relationships. Identify users who don't follow you back and optionally unfollow them in bulk.

## Features

- **List Non-Followers**: See all users you follow who don't follow you back
- **Bulk Unfollow**: Automatically unfollow multiple users with confirmation
- **Bulk Follow Back**: Automatically follow users who follow you but you don't follow back
- **GitHub Actions Workflows**: Run unfollow and follow-back actions manually from GitHub
- **Rate Limit Protection**: Checks API quota before destructive operations
- **Interactive Menu**: User-friendly interface with colored output
- **Pagination Support**: Handles accounts with 100+ followers/following
- **Progress Tracking**: Real-time feedback during bulk operations

## Prerequisites

- **Node.js 18.0.0 or higher** (uses native fetch API)
- **GitHub Personal Access Token** with `user:follow` scope

## Installation

1. Clone or download this repository:
   ```bash
   git clone git@github.com:guiIher-me/github-who-unfollows-you.git
   cd github-who-unfollows-you
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and add your credentials:
   ```
   GITHUB_TOKEN=your_github_personal_access_token
   GITHUB_USERNAME=your_github_username
   ```

## Getting a GitHub Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Give it a descriptive name (e.g., "Unfollow Manager")
4. Select the **`user:follow`** scope (allows reading and writing follow relationships)
5. Click **Generate token**
6. Copy the token and paste it into your `.env` file

**Important**: Never commit your `.env` file or share your token publicly!

## Usage

Start the CLI:
```bash
npm start
```

You'll see an interactive menu:
```
==========================================
   GitHub Unfollow Manager
==========================================

What would you like to do?

  1. List users who don't follow me back
  2. Unfollow all users who don't follow me back
  0. Exit
```

### Option 1: List Users

Displays all users you follow who don't follow you back, with their profile URLs.

### Option 2: Bulk Unfollow

- Checks your API rate limit
- Shows the list of users to be unfollowed
- Asks for confirmation
- Unfollows each user with progress feedback
- Displays a summary of successful/failed operations

### Exit

Press `0` or `Ctrl+C` to exit gracefully.

### Automation Commands

These commands are designed for scripts and GitHub Actions:

```bash
npm run list:not-following-back
npm run unfollow:not-following-back -- --yes
npm run follow:followers -- --yes
```

Add `--dry-run` or set `DRY_RUN=true` to preview the affected users without changing your follow relationships:

```bash
npm run unfollow:not-following-back -- --yes --dry-run
npm run follow:followers -- --yes --dry-run
```

## GitHub Actions

This repository includes two manual workflows:

- **Unfollow non-followers**: unfollows users you follow who do not follow you back
- **Follow back followers**: follows users who follow you but you do not follow back

The built-in `GITHUB_TOKEN` cannot manage your personal follow relationships, so the workflows require a personal access token saved as `GH_FOLLOW_TOKEN`.

### Add the GitHub Secret

1. Create a classic personal access token:
   - Open [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens).
   - Click **Generate new token (classic)**.
   - Give it a clear name, such as `GitHub Follow Manager`.
   - Select the **`user:follow`** scope.
   - Click **Generate token** and copy the token immediately.

2. Add the token to this repository:
   - Open this repository on GitHub.
   - Go to **Settings > Secrets and variables > Actions**.
   - Click **New repository secret**.
   - Set **Name** to `GH_FOLLOW_TOKEN`.
   - Paste the personal access token into **Secret**.
   - Click **Add secret**.

### Run the Workflows

1. Open this repository on GitHub.
2. Go to the **Actions** tab.
3. Select one of these workflows from the left sidebar:
   - **Unfollow non-followers**
   - **Follow back followers**
4. Click **Run workflow**.
5. Choose the branch to run from.
6. Leave `dry_run` as `true` for the first run so the workflow only lists affected users.
7. Review the workflow logs.
8. Run the same workflow again with `dry_run` set to `false` when you are ready to apply the changes.

The workflow actions are:

- **Unfollow non-followers** runs `npm run unfollow:not-following-back -- --yes`
- **Follow back followers** runs `npm run follow:followers -- --yes`

Both workflows use `DRY_RUN=true` by default, so no follow relationships change until you explicitly choose `dry_run=false`.

## Project Structure

```
github-who-unfollows-you/
├── src/
│   ├── index.js       # Main entry point and CLI loop
│   ├── github.js      # GitHub API client
│   ├── followers.js   # Follow relationship comparison logic
│   ├── ui.js          # Terminal output and user input
│   └── config.js      # Environment variable validation
├── .github/
│   └── workflows/     # Manual follow/unfollow GitHub Actions
├── package.json
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

## Architecture

The application follows clean architecture principles:

- **config.js**: Environment validation (fails fast if credentials missing)
- **github.js**: Pure GitHub API interactions with pagination support
- **followers.js**: Pure business logic (comparison functions)
- **ui.js**: All terminal I/O, colored output with chalk, readline for input
- **index.js**: Orchestration layer, interactive menu loop

## API Rate Limits

GitHub's API has rate limits (typically 5,000 requests/hour for authenticated users). The tool:
- Checks rate limit before bulk operations
- Warns if remaining requests are low (<100)
- Adds small delays between unfollow operations
- Shows when your rate limit resets

## Troubleshooting

### "Missing required environment variables"
- Ensure `.env` file exists in the project root
- Check that `GITHUB_TOKEN` and `GITHUB_USERNAME` are set correctly

### "GitHub API error: 401"
- Your token is invalid or expired
- Generate a new token with `user:follow` scope

### "GitHub API error: 403"
- Rate limit exceeded - wait until the reset time shown
- Or your token doesn't have the required permissions

### Colors not displaying correctly
- Ensure your terminal supports colors
- Try a different terminal emulator if issues persist

## Security Notes

- Never commit your `.env` file (already in `.gitignore`)
- Keep your GitHub token private
- Tokens can be revoked at any time from GitHub settings
- The tool only reads followers/following and can unfollow - it cannot access other data

## License

MIT
