const express = require('express');
const router = express.Router();
const User = require('../models/User.cjs'); 


router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
  
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
   
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    
    res.json({ message: 'Login successful', username: user.username, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;