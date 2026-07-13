#!/bin/bash
set -e

# Navigate to project root
cd "$(dirname "$0")"

echo "Building Next.js Standalone App..."
pnpm build

echo "Creating Release Folder..."
rm -rf OmniGit-Release
mkdir -p OmniGit-Release

echo "Copying Standalone Server..."
# Next.js standalone output contains everything needed to run the Node server
cp -a .next/standalone/. OmniGit-Release/

echo "Copying Public Assets..."
cp -r public OmniGit-Release/public

echo "Copying Static Build Assets..."
cp -r .next/static OmniGit-Release/.next/static

echo "Copying Prisma Database schema..."
mkdir -p OmniGit-Release/prisma
cp prisma/schema.prisma OmniGit-Release/prisma/

echo "Initializing empty SQLite Database for release..."
mkdir -p OmniGit-Release/prisma/instance
DATABASE_URL="file:$(pwd)/OmniGit-Release/prisma/instance/next_dashboard.db" npx prisma db push

echo "Creating Launch Script..."
cat << 'EOF' > OmniGit-Release/start.command
#!/bin/bash
cd "$(dirname "$0")"
export PORT=7492

# Check if the server is already running on PORT
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "OmniGit Server is already running!"
else
    echo "Starting OmniGit Backend Server..."
    nohup node server.js > server.log 2>&1 &
    sleep 2
fi

echo "Opening Browser..."
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --app=http://localhost:$PORT

# Attempt to gracefully close the terminal window that opened this script
osascript -e 'tell application "Terminal" to close front window' >/dev/null 2>&1
exit 0
EOF
chmod +x OmniGit-Release/start.command

echo "Zipping Release..."
VERSION=$(node -p "require('./package.json').version")
ZIP_NAME="OmniGit-v${VERSION}.zip"

rm -f "$ZIP_NAME"
zip -r "$ZIP_NAME" OmniGit-Release > /dev/null

echo "Done! You can now send $ZIP_NAME to your users."
echo "They just need to unzip it and double click start.command (Node.js required on their machine)."
