import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  }, []);
 
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleGetStarted = () => {
    navigate('/login');
  };
  
  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen transition-colors duration-300`}>
      {/* Navigation */}
      <nav className={`${darkMode ? 'bg-gray-800' : 'bg-white'} fixed w-full z-10 shadow-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="flex items-center font-bold text-2xl">
                  <span className={darkMode ? 'text-white' : 'text-black'}>F</span>
                  <span className="text-green-500">F</span>
                </div>
                <span className="ml-3 text-xl font-bold">
                  <span className={darkMode ? 'text-white' : 'text-gray-900'}>Feedback</span>
                  <span className="text-green-500">Fusion</span>
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
              >
                {darkMode ? (
                  <svg className="h-5 w-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Hero section */}
      <div className="pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:text-left lg:col-span-6">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl"
              >
                <span className="block">Transform Hotel</span>
                <span className="block text-green-500">Feedback into Insights</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`mt-3 text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'} sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0`}
              >
                FeedbackFusion helps hotels analyze customer feedback using AI. Identify trends, improve services, and boost guest satisfaction with actionable insights.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-8 sm:flex sm:justify-center lg:justify-start"
              >
                <div className="rounded-md shadow">
                  <button
                    onClick={handleGetStarted}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
                  >
                    Get started
                  </button>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <a href="#features" className={`w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md ${darkMode ? 'text-green-200 bg-green-900/30 hover:bg-green-800/50' : 'text-green-700 bg-green-100 hover:bg-green-200'} md:py-4 md:text-lg md:px-10 transition-colors duration-200`}>
                    Learn more
                  </a>
                </div>
              </motion.div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md"
              >
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl overflow-hidden`}>
                  <img
                    className="w-full"
                    src={darkMode ? "Dashboarddark.jpeg" : "Dashboard.jpeg"}
                    alt="Dashboard preview"
                  />
                  <div className="px-4 py-4">
                    <div className="text-lg font-medium">Smart Dashboard</div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Real-time insights at your fingertips</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Features section - redesigned for interactivity */}
      <div id="features" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-green-600 tracking-wide uppercase">Features</h2>
            <p className="mt-1 text-4xl font-extrabold sm:text-5xl sm:tracking-tight lg:text-5xl">
              Everything you need to understand your guests
            </p>
            <p className={`max-w-xl mt-5 mx-auto text-xl ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Powerful tools to collect, analyze, and act on customer feedback
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1: Recommendations */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden group relative cursor-pointer border border-transparent hover:border-green-500 transition-colors duration-300`}
              >
                <div className="p-6 relative">
                  {/* Animated border effect */}
                  <div className="absolute inset-0 border-2 border-green-500 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300"></div>
                  
                  <div className="flex items-center relative z-10">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="ml-4 text-lg font-medium">Smart Recommendations</h3>
                  </div>
                  
                  {/* Description - hidden by default, shown on hover */}
                  <div className="mt-4 h-0 group-hover:h-auto overflow-hidden transition-all duration-300 group-hover:mt-4 relative z-10">
                    <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Get actionable insights automatically generated from your feedback data. Our AI identifies the most pressing issues and suggests concrete steps to improve guest satisfaction.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Feature 2: Sentiment & Emotion Analysis */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden group relative cursor-pointer border border-transparent hover:border-green-500 transition-colors duration-300`}
              >
                <div className="p-6 relative">
                  {/* Animated border effect */}
                  <div className="absolute inset-0 border-2 border-green-500 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300"></div>
                  
                  <div className="flex items-center relative z-10">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="ml-4 text-lg font-medium">Sentiment & Emotion Analysis</h3>
                  </div>
                  
                  {/* Description - hidden by default, shown on hover */}
                  <div className="mt-4 h-0 group-hover:h-auto overflow-hidden transition-all duration-300 group-hover:mt-4 relative z-10">
                    <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Our AI engine automatically identifies positive, negative, and neutral sentiments while detecting emotions like joy, frustration, and satisfaction across all guest touchpoints.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Feature 3: Real-time Alerts */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden group relative cursor-pointer border border-transparent hover:border-green-500 transition-colors duration-300`}
              >
                <div className="p-6 relative">
                  {/* Animated border effect */}
                  <div className="absolute inset-0 border-2 border-green-500 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300"></div>
                  
                  <div className="flex items-center relative z-10">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <h3 className="ml-4 text-lg font-medium">Real-time Alerts</h3>
                  </div>
                  
                  {/* Description - hidden by default, shown on hover */}
                  <div className="mt-4 h-0 group-hover:h-auto overflow-hidden transition-all duration-300 group-hover:mt-4 relative z-10">
                    <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Create custom alerts based on feedback thresholds to immediately address issues before they impact your reputation. Respond promptly to negative trends across any department.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Feature 4: Detailed Results */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden group relative cursor-pointer border border-transparent hover:border-green-500 transition-colors duration-300`}
              >
                <div className="p-6 relative">
                  {/* Animated border effect */}
                  <div className="absolute inset-0 border-2 border-green-500 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300"></div>
                  
                  <div className="flex items-center relative z-10">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="ml-4 text-lg font-medium">Detailed Results</h3>
                  </div>
                  
                  {/* Description - hidden by default, shown on hover */}
                  <div className="mt-4 h-0 group-hover:h-auto overflow-hidden transition-all duration-300 group-hover:mt-4 relative z-10">
                    <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Visualize feedback data through intuitive charts and graphs. Break down results by department, sentiment, emotion, and more to identify specific areas for improvement.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Feature 5: Historical Analysis */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden group relative cursor-pointer border border-transparent hover:border-green-500 transition-colors duration-300`}
              >
                <div className="p-6 relative">
                  {/* Animated border effect */}
                  <div className="absolute inset-0 border-2 border-green-500 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300"></div>
                  
                  <div className="flex items-center relative z-10">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <h3 className="ml-4 text-lg font-medium">Historical Analysis</h3>
                  </div>
                  
                  {/* Description - hidden by default, shown on hover */}
                  <div className="mt-4 h-0 group-hover:h-auto overflow-hidden transition-all duration-300 group-hover:mt-4 relative z-10">
                    <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Track performance over time with customizable date ranges. Compare current results with previous periods to identify trends, improvements, and areas needing attention.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Feature 6: Comprehensive Reports */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden group relative cursor-pointer border border-transparent hover:border-green-500 transition-colors duration-300`}
              >
                <div className="p-6 relative">
                  {/* Animated border effect */}
                  <div className="absolute inset-0 border-2 border-green-500 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300"></div>
                  
                  <div className="flex items-center relative z-10">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="ml-4 text-lg font-medium">Comprehensive Reports</h3>
                  </div>
                  
                  {/* Description - hidden by default, shown on hover */}
                  <div className="mt-4 h-0 group-hover:h-auto overflow-hidden transition-all duration-300 group-hover:mt-4 relative z-10">
                    <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Generate customizable reports with detailed insights on guest satisfaction across departments, emotions, and key metrics. Export and share data to drive organizational improvements.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Team section */}
<div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} py-16`}>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center">
      <h2 className="text-base font-semibold text-green-600 tracking-wide uppercase">Our Team</h2>
      <p className="mt-1 text-4xl font-extrabold sm:text-5xl sm:tracking-tight lg:text-5xl">
        Meet the minds behind FeedbackFusion
      </p>
      <p className={`max-w-xl mt-5 mx-auto text-xl ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        A passionate team dedicated to transforming the hotel feedback experience
      </p>
    </div>
    
    <div className="mt-16 flex flex-wrap justify-center">
      {/* Junaid Hussain - Furthest Left */}
      <div className="p-4 w-full sm:w-1/2 md:w-1/5">
        <div className={`text-center p-6 ${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-lg h-full`}>
          <img 
            src="junaid.jpeg" 
            alt="Junaid Hussain" 
            className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-green-500"
          />
          <h3 className="mt-4 text-lg font-medium">Junaid Hussain</h3>
          <p className="text-sm text-green-500 mb-2">Member</p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Frontend Developer</p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>ML Engineer</p>
        </div>
      </div>

      {/* Leen Ramadan - Left of Center */}
      <div className="p-4 w-full sm:w-1/2 md:w-1/5">
        <div className={`text-center p-6 ${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-lg h-full`}>
          <img 
            src="leen.jpeg" 
            alt="Leen Ramadan" 
            className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-green-500"
          />
          <h3 className="mt-4 text-lg font-medium">Leen Ramadan</h3>
          <p className="text-sm text-green-500 mb-2">Member</p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Frontend Developer</p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Marketing Specialist</p>
        </div>
      </div>

      {/* Abdul Rehman - Center */}
      <div className="p-4 w-full sm:w-1/2 md:w-1/5">
        <div className={`text-center p-6 ${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-lg h-full border-2 border-green-500`}>
          <img 
            src="abdul.jpeg" 
            alt="Abdul Rehman" 
            className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-green-500"
          />
          <h3 className="mt-4 text-lg font-medium">Abdul Rehman</h3>
          <p className="text-sm text-green-500 mb-2">Leader</p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fullstack Developer</p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>ML Engineer</p>
        </div>
      </div>

      {/* Haneen Elmashtouly - Right of Center */}
      <div className="p-4 w-full sm:w-1/2 md:w-1/5">
        <div className={`text-center p-6 ${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-lg h-full`}>
          <img 
            src="haneen.jpeg" 
            alt="Haneen Elmashtouly" 
            className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-green-500"
          />
          <h3 className="mt-4 text-lg font-medium">Haneen Elmashtouly</h3>
          <p className="text-sm text-green-500 mb-2">Member</p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fullstack Developer</p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Backend Engineer</p>
        </div>
      </div>

      {/* Youssef Amro - Furthest Right */}
      <div className="p-4 w-full sm:w-1/2 md:w-1/5">
        <div className={`text-center p-6 ${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-lg h-full`}>
          <img 
            src="youssef.jpeg" 
            alt="Youssef Amro" 
            className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-green-500"
          />
          <h3 className="mt-4 text-lg font-medium">Youssef Amro</h3>
          <p className="text-sm text-green-500 mb-2">Scribe</p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Backend Developer</p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Database Specialist</p>
        </div>
      </div>
    </div>
  </div>
</div>
      
      {/* CTA Section - modified */}
      <div className="bg-green-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to transform your feedback?</span>
            <span className="block text-green-200">Join Today</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-green-600 bg-white hover:bg-gray-50"
              >
                Get started
              </button>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <a href="#features"
               className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-800 hover:bg-green-700">
               Learn more
             </a>
           </div>
         </div>
       </div>
     </div>
      
      {/* Footer */}
      <footer className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <div className="mt-8 flex justify-center space-x-6">
            <div className="flex items-center text-xl font-bold">
              <span className={darkMode ? 'text-white' : 'text-black'}>F</span>
              <span className="text-green-500">F</span>
            </div>
          </div>
          <p className={`mt-8 text-center text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            &copy; 2025 FeedbackFusion. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;