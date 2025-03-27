const express = require('express');
const router = express.Router();
const User = require('../models/User.cjs'); 
const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const newUser = new User({
      username,
      password: hashedPassword,  
      role
    });

    await newUser.save();
    return res.status(201).json({ 
      message: 'User created', 
      username: newUser.username 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const result = await User.findOneAndDelete({ username });
    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: `User ${username} removed` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:username/role', async (req, res) => {
  try {
    const { username } = req.params;
    const { role } = req.body; 

    if (!['admin', 'manager', 'supervisor'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findOneAndUpdate(
      { username },
      { $set: { role } },
      { new: true } 
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `Role updated to ${role}`, user: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const allUsers = await User.find({});
    res.json(allUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:username/password', async (req, res) => {
  try {
    const { username } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: 'New password required' });
    }

    const bcrypt = require('bcrypt');
    const hashed = await bcrypt.hash(newPassword, 10);

    const user = await User.findOneAndUpdate(
      { username },
      { $set: { password: hashed } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
