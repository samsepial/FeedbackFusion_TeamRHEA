# FeedbackFusion Installation Guide

This guide will help you set up and run the FeedbackFusion application on your local machine.

## Prerequisites

Before starting, make sure you have the following installed:
- Node.js (v14+)
- Yarn package manager
- MongoDB (v4.4+)
- Python (v3.8+)
- Git

## Option 1: Automated Installation (Recommended)

We've provided a setup script that automates the installation process:

```bash
# Clone the repository
git clone https://github.com/YourUsername/FeedbackFusion.git
cd FeedbackFusion

# Make the setup script executable
chmod +x setup.sh

# Run the setup script
./setup.sh
```

The setup script will:
1. Check if all required software is installed
2. Install backend and frontend dependencies
3. Make sure MongoDB is running
4. Create an admin user automatically

After the setup completes, you'll see instructions for starting the application.

## Option 2: Manual Installation

If you prefer to install manually or if the automated script doesn't work for your environment:

### Step 1: Clone the Repository

```bash
git clone https://github.com/YourUsername/FeedbackFusion.git
cd FeedbackFusion
```

### Step 2: Install Backend Dependencies

```bash
cd backend
yarn install
```

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
yarn install
```

### Step 4: Set Up NLP Service (if applicable)

```bash
cd ../nlp_service
pip install -r requirements.txt
```

### Step 5: Create Admin User

This step is crucial for first-time setup. You need to create an admin user to access the system.

```bash
cd ../backend
# Make sure MongoDB is running
node create-admin.js
```

You should see output confirming that the admin user has been created:
```
Connected to MongoDB successfully
Admin user created successfully!
Username: admin
Password: admin123
MongoDB connection closed
```

## Starting the Application

Open three terminal windows to run each component:

### Terminal 1 - Start MongoDB (if not running as a service)
```bash
mongod
```

### Terminal 2 - Start Backend
```bash
cd backend
yarn start
```

### Terminal 3 - Start Frontend
```bash
cd frontend
yarn dev
```

### Terminal 4 (if using NLP service) - Start NLP Service
```bash
cd nlp_service
python app.py
```

## Accessing the Application

Open your browser and navigate to:
```
http://localhost:5173
```

Log in with the admin credentials:
- Username: admin
- Password: admin123

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running on the default port (27017)
- Check if the MongoDB service is started
- Verify that the connection string in `backend/src/config.js` matches your MongoDB setup

### Login Issues
- If you can't log in with the admin credentials, try running the `create-admin.js` script again
- Check the MongoDB database to ensure the user was created correctly:
  ```javascript
  use feedbackfusion
  db.users.find({username: 'admin'})
  ```

### Port Conflicts
- If you have services already running on ports 4000 (backend), 5173 (frontend), or 5001 (NLP service), you'll need to modify the port configurations in the respective files