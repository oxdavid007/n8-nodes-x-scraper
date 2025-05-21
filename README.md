# n8n-nodes-x-scraper

This is an n8n community node for X (formerly Twitter) scraping functionality. It provides integration with X's API to help you automate data collection and processing tasks.

## Features

- Integration with X (Twitter) API
- Automated data collection capabilities
- Built on top of twitter-api-v2 and agent-twitter-client

## Prerequisites

You need the following installed on your development machine:

- [git](https://git-scm.com/downloads)
- Node.js and pnpm. Minimum version Node 20. You can find instructions on how to install both using nvm (Node Version Manager) for Linux, Mac, and WSL [here](https://github.com/nvm-sh/nvm). For Windows users, refer to Microsoft's guide to [Install NodeJS on Windows](https://docs.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-windows).
- Install n8n with:
  ```
  npm install n8n -g
  ```

## Installation

Follow these steps to get the node up and running:

1. Install the node in your n8n instance:
   ```
   npm install n8n-nodes-x-scraper
   ```
2. Restart your n8n instance
3. The node will now be available in your n8n editor

## Development

If you want to contribute to this node:

1. Clone the repository:
   ```
   git clone https://github.com/scap-ai/n8n-nodes-x-scraper.git
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Make your changes
4. Run `npm lint` to check for errors or `npm lintfix` to automatically fix errors
5. Build the node:
   ```
   npm run build
   ```

## Usage

After installation, you can find the X Scraper node in your n8n editor. The node provides various operations for interacting with X's API.

## Support

For support, please contact hello@scraper.ai

## License

[MIT](LICENSE.md)
