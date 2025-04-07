#!/bin/bash

# School Quiz Application Deployment Script
# This script is designed to be run on a Ubuntu/Debian server

# Exit on error
set -e

echo "==============================================="
echo "School Quiz Application Deployment Script"
echo "==============================================="

# Update package lists
echo "Updating package lists..."
sudo apt-get update

# Install dependencies
echo "Installing dependencies..."
sudo apt-get install -y curl git build-essential

# Install Node.js and npm
echo "Installing Node.js and npm..."
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
echo "Installing MongoDB..."
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Clone the repository (if not already cloned)
if [ ! -d "school-quiz" ]; then
  echo "Cloning repository..."
  git clone https://github.com/Dimiliof/school-quiz.git
  cd school-quiz
else
  echo "Repository already exists, pulling latest changes..."
  cd school-quiz
  git pull
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
  echo "Creating .env file..."
  cat > .env << EOF
# Server
NODE_ENV=production
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/school-quiz

# JWT
JWT_SECRET=$(openssl rand -hex 32)

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
EOF
fi

# Install dependencies
echo "Installing backend dependencies..."
npm install

echo "Installing frontend dependencies..."
cd frontend
npm install

# Build frontend
echo "Building frontend..."
npm run build

# Go back to main directory
cd ..

# Create a systemd service file
echo "Creating systemd service..."
sudo tee /etc/systemd/system/school-quiz.service > /dev/null << EOF
[Unit]
Description=School Quiz Application
After=network.target mongodb.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd, enable and start the service
echo "Starting the service..."
sudo systemctl daemon-reload
sudo systemctl enable school-quiz
sudo systemctl start school-quiz

echo "==============================================="
echo "Deployment complete!"
echo "The application is now running on http://localhost:5000"
echo "===============================================" 