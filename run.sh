#!/bin/bash
cd /home/z/my-project

# Start server in background
npx next dev -p 3000 &
SERVER_PID=$!

# Keepalive loop - runs as part of same process group
while kill -0 $SERVER_PID 2>/dev/null; do
  sleep 15
  curl -s -o /dev/null http://localhost:3000/ 2>/dev/null
done
