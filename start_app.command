#!/bin/bash

# Navigate to the directory where this script is located
cd "$(dirname "$0")"

# macOS Finder scripts sometimes lose the PATH to node/npm. 
# We explicitly load the user's shell profiles to fix "command not found".
source ~/.bash_profile 2>/dev/null
source ~/.zshrc 2>/dev/null
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

PORT=7492
echo "Starting OmniGit Backend Server on port $PORT..."

# Start the Next.js server using the PORT environment variable
export PORT=$PORT
pnpm dev &
SERVER_PID=$!

echo "Waiting for Next.js server to finish compiling (this can take 10-15 seconds)..."
# Loop until we get a successful HTTP 200/404 response
while ! curl -s http://localhost:$PORT > /dev/null; do
    sleep 1
done
echo "Server is ready!"

echo "Opening OmniGit in Chrome App Mode..."
# Launch Google Chrome in 'App' mode
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --app=http://localhost:$PORT

# When the user closes the Chrome window, kill the Next.js server
echo "Chrome window closed. Shutting down server..."
kill $SERVER_PID
