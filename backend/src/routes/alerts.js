const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');

// Get all alerts
router.get('/', async (req, res) => {
  try {
    const alerts = await Alert.find();
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});
// Create alert
router.post('/', async (req, res) => {
  try {
    const { priority, threshold, department } = req.body;
    if (!priority || !threshold || !department) {
      return res.status(400).json({ error: 'Priority, threshold and department are required' });
    }
    // Include the department in the new Alert document
    const alert = new Alert({ department, priority, threshold });
    const savedAlert = await alert.save();
    res.status(201).json(savedAlert);
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete alert
router.delete('/:id', async (req, res) => {
  try {
    console.log('Attempting to delete alert with ID:', req.params.id);
    
    const result = await Alert.findByIdAndDelete(req.params.id);
    
    if (!result) {
      console.log('Alert not found for deletion');
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    console.log('Alert successfully deleted');
    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ error: 'Failed to delete alert: ' + error.message });
  }
});

router.patch('/:id/reset', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          triggered: false,
          triggeredAt: null
        } 
      },
      { new: true }
    );
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    res.json(alert);
  } catch (error) {
    console.error('Error resetting alert:', error);
    res.status(500).json({ error: 'Failed to reset alert' });
  }
});

module.exports = router; 