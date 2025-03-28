#!/bin/bash

echo "======================================"
echo "FeedbackFusion - Team RHEA Setup Script"
echo "======================================"

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "MongoDB is not installed or not in PATH. Please install MongoDB first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed or not in PATH. Please install Node.js first."
    exit 1
fi

# Check if yarn is installed
if ! command -v yarn &> /dev/null; then
    echo "Yarn is not installed or not in PATH. Please install Yarn first."
    echo "You can install Yarn with: npm install -g yarn"
    exit 1
fi

echo "Installing backend dependencies..."
cd backend || { echo "Backend directory not found!"; exit 1; }
yarn install || { echo "Failed to install backend dependencies!"; exit 1; }

echo "Installing frontend dependencies..."
cd ../frontend || { echo "Frontend directory not found!"; exit 1; }
yarn install || { echo "Failed to install frontend dependencies!"; exit 1; }

# Check if MongoDB service is running
echo "Checking if MongoDB is running..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "MongoDB is not running. Attempting to start MongoDB..."
    mongod --fork --logpath /tmp/mongodb.log || { echo "Failed to start MongoDB. Please start it manually."; }
fi

echo "Creating admin user..."
cd ../backend || { echo "Backend directory not found!"; exit 1; }
node create-admin.js || { echo "Failed to create admin user!"; exit 1; }

echo "======================================"
echo "Setup completed successfully!"
echo "======================================"
echo "To start the application:"
echo "1. Terminal 1: cd backend && yarn start"
echo "2. Terminal 2: cd frontend && yarn dev"
echo "3. Open your browser and go to http://localhost:5173"
echo ""
echo "Admin credentials:"
echo "Username: admin"
echo "Password: admin123"
echo "======================================"

exit 0