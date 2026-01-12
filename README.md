# GitHub Unfollow Manager

A clean, interactive CLI tool to help you manage your GitHub follow relationships. Identify users who don't follow you back and optionally unfollow them in bulk.

## Features

- **List Non-Followers**: See all users you follow who don't follow you back
- **Bulk Unfollow**: Automatically unfollow multiple users with confirmation
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
   git clone <repository-url>
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

## Project Structure

```
github-who-unfollows-you/
├── src/
│   ├── index.js       # Main entry point and CLI loop
│   ├── github.js      # GitHub API client
│   ├── followers.js   # Follow relationship comparison logic
│   ├── ui.js          # Terminal output and user input
│   └── config.js      # Environment variable validation
├── package.json
├── .env.example
├── .gitignore
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


