// create-admin.js
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Database connection parameters
const url = 'mongodb://127.0.0.1:27017';
const dbName = 'feedbackfusion';

async function createAdminUser() {
  let client;

  try {
    // Connect to MongoDB
    client = new MongoClient(url);
    await client.connect();
    console.log('Connected to MongoDB successfully');

    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    // Check if admin user already exists
    const existingAdmin = await usersCollection.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists. No action taken.');
      return;
    }

    // Hash the password (same hashing as in your backend)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user document
    const adminUser = {
      username: 'admin',
      password: hashedPassword,
      fullName: 'Administrator',
      role: 'admin',
      departments: ['All'],
      lastLogin: null,
      createdAt: new Date()
    };

    // Insert admin user
    const result = await usersCollection.insertOne(adminUser);
    
    if (result.acknowledged) {
      console.log('Admin user created successfully!');
      console.log('Username: admin');
      console.log('Password: admin123');
    } else {
      console.log('Failed to create admin user');
    }

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the function
createAdminUser();
