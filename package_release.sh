#!/bin/bash

# Navigate to project root
cd "$(dirname "$0")"

echo "Building Next.js Standalone App..."
pnpm build

echo "Creating Release Folder..."
rm -rf OmniGit-Release
mkdir -p OmniGit-Release

echo "Copying Standalone Server..."
# Next.js standalone output contains everything needed to run the Node server
cp -r .next/standalone/* OmniGit-Release/

echo "Copying Public Assets..."
cp -r public OmniGit-Release/public

echo "Copying Static Build Assets..."
cp -r .next/static OmniGit-Release/.next/static

echo "Copying Prisma Database schema..."
mkdir -p OmniGit-Release/prisma
cp prisma/schema.prisma OmniGit-Release/prisma/

echo "Creating Launch Script..."
cat << 'EOF' > OmniGit-Release/start.command
#!/bin/bash
cd "$(dirname "$0")"
export PORT=7492
echo "Starting OmniGit Backend Server..."
node server.js &
SERVER_PID=$!
sleep 2
echo "Opening Browser..."
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --app=http://localhost:$PORT
echo "Close this terminal to shut down the server."
wait $SERVER_PID
EOF
chmod +x OmniGit-Release/start.command

echo "Zipping Release..."
zip -r OmniGit-Release.zip OmniGit-Release > /dev/null

echo "Done! You can now send OmniGit-Release.zip to your users."
echo "They just need to unzip it and double click start.command (Node.js required on their machine)."
