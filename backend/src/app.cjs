const express = require('express');
const cors = require('cors');

const feedbackRoutes = require('./routes/feedbackRoutes.js');
const authRoutes = require('./routes/authRoutes.cjs'); 
const userRoutes = require('./routes/userRoutes.js');
const alertsRoutes = require('./routes/alerts.js');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from FeedbackFusion Backend!');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/alerts', alertsRoutes);


module.exports = app;