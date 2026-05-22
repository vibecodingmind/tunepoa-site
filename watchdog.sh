#!/bin/bash
cd /home/z/my-project
while true; do
  # Start the server
  npx next dev -p 3000 &
  SERVER_PID=$!
  
  # Wait for it to be ready
  for i in $(seq 1 15); do
    sleep 2
    if curl -s -o /dev/null http://localhost:3000/ 2>/dev/null; then
      break
    fi
  done
  
  echo "[$(date)] Server started with PID $SERVER_PID"
  
  # Keep it alive with periodic requests
  while kill -0 $SERVER_PID 2>/dev/null; do
    sleep 10
    curl -s -o /dev/null http://localhost:3000/ 2>/dev/null
  done
  
  echo "[$(date)] Server died, restarting in 3s..."
  sleep 3
done
