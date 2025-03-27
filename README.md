# FeedbackFusion

![FeedbackFusion Logo](public/FF.png)

## Project Overview

FeedbackFusion is an intelligent hotel feedback management system designed to help hotels collect, analyze, and derive actionable insights from guest feedback. The system leverages natural language processing (NLP) to automatically analyze sentiment and emotion in customer reviews, identify trends, and generate recommendations for improvement.

The platform centralizes feedback from multiple sources, including manual uploads (CSV/JSON files) and automated scraping from review platforms (Google Reviews). It processes this data through an NLP pipeline to extract sentiment, emotion, and department classification, presenting the results through an intuitive dashboard with visualization tools and historical analysis capabilities.

Built with a modern tech stack including MongoDB, Express.js, React, and Node.js (MERN stack), with Python-based NLP services, FeedbackFusion transforms how hotels understand and respond to guest experiences, ultimately improving service quality and guest satisfaction.

## Team Information

**Team RHEA**

| Name             | ID       | Role               |
|------------------|----------|-------------------- |
| Abdul Rehman     | 7402521  | Leader             |
| Junaid Hussain    | 7644292  | Member             |
| Hanin Elmashtouly | 7866355  | Member             |
| Leen Ramadan      | 7759927  | Member             |
| Youssef Amro      | 7581737  | Scribe             |

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Future Enhancements](#future-enhancements)

## Features

- **Multi-channel Feedback Collection**: Integration of feedback from multiple sources, including manual uploads and web scraping of review platforms.
  
- **Advanced NLP Analysis**: Automated detection of sentiment (positive, negative, neutral), emotions (joy, anger, etc.), and department classification.
  
- **Visualization & Insights**: Interactive dashboards that present feedback data with filtering by department, sentiment, emotion, and date range.
  
- **Smart Alert System**: Rule-based alerts triggered when specific conditions are met, such as a threshold of negative reviews for a particular department.
  
- **Historical Analysis**: Tools for analyzing feedback data over time, enabling users to track performance trends.
  
- **Recommendation Engine**: Rule-based system that suggests actions based on patterns in negative feedback.
  
- **User Management**: Role-based access control, allowing for different permission levels (Admin, Manager, Supervisor).

## Technology Stack

### Frontend
- **React** (with React Router for navigation)
- **Tailwind CSS** (for styling)
- **Recharts** (for data visualization)
- **Framer Motion** (for animations)
- **Axios** (for API requests)

### Backend
- **Node.js** with **Express**
- **MongoDB** (with Mongoose ODM)
- **JWT** for authentication
- **Multer** for file uploads
- **Apify** for web scraping

### NLP Service
- **Python Flask** (API server)
- **Transformers** (Hugging Face) for sentiment analysis and emotion detection
- **DistilBERT** for sentiment analysis
- **DistilRoBERTa** for emotion analysis

## Project Structure

```
FeedbackFusion/
├── backend/               # Backend server code
│   ├── src/
│   │   ├── models/        # MongoDB schema definitions
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   └── app.cjs        # Express app configuration
│   ├── package.json       # Backend dependencies
│   └── index.js           # Server entry point
├── frontend/              # React frontend code
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React context providers
│   │   ├── pages/         # Page components
│   │   ├── services/      # API client services
│   │   └── App.jsx        # Main application component
│   └── package.json       # Frontend dependencies
├── nlp_service/           # Python NLP microservice
│   ├── app.py             # Flask application
│   └── requirements.txt   # Python dependencies
├── package.json           # Root package.json
└── README.md              # Project documentation
```

## Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (v4.4+)
- Python (v3.8+)
- Git

### Step 1: Clone the repository
```bash
git clone https://github.com/YourUsername/FeedbackFusion_TeamRHEA.git
cd FeedbackFusion_TeamRHEA
```

### Step 2: Set up backend
```bash
cd backend
npm install
```

### Step 3: Set up frontend
```bash
cd ../frontend
npm install
```

### Step 4: Set up NLP service
```bash
cd ../nlp_service
pip install -r requirements.txt
```

## NLP Models

The sentiment analysis model is hosted on Hugging Face and can be accessed at:
- Model: ar2107/rhea_sentiment_finetuned_lite

For local development, the model will be automatically downloaded when running the NLP service.

### Step 5: Set up MongoDB
Ensure MongoDB is running on your system. The application will try to connect to `mongodb://127.0.0.1:27017/feedbackfusion` by default.

## Usage

### Starting the Backend
```bash
cd backend
npm start
```
The server will run on http://localhost:4000

### Starting the Frontend
```bash
cd frontend
npm run dev
```
The frontend will run on http://localhost:5173

### Starting the NLP Service
```bash
cd nlp_service
python app.py
```
The NLP service will run on http://localhost:5001

### Default Admin User
Username: `admin`  
Password: `admin123`

## Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Sentiment Analysis
![Sentiment Analysis](screenshots/sentiment-analysis.png)

### Historical Analysis
![Historical Analysis](screenshots/historical-analysis.png)

### User Management
![User Management](screenshots/user-management.png)

## Future Enhancements

- **Enhanced Machine Learning Models**: Further refinement of the sentiment analysis model with additional hotel-specific training data.
- **Multilingual Support**: Expanding NLP capabilities to analyze feedback in languages other than English.
- **Advanced Visualization**: Interactive dashboards with drill-down capabilities for deeper insights.
- **Expanded Data Collection**: Additional integrations with popular booking platforms.
- **Mobile Application**: Developing a mobile app for on-the-go access.

## License

This project was developed as an academic project for [Your University/Institution Name].

## Acknowledgements

- Special thanks to our professor [Professor's Name] for guidance throughout the project.
- We'd like to acknowledge the open-source libraries and frameworks that made this project possible.