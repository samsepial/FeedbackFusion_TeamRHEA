import React, { useState, useEffect, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ThemeContext } from '../contexts/ThemeContext';
import ChangePasswordModal from './ChangePasswordModal';

const Sidebar = ({ onExpand }) => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (onExpand) {
      onExpand(isExpanded);
    }
  }, [isExpanded, onExpand]);

  const user = {
    username: 'Admin User',
    role: 'Admin',
  };

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: "chart-pie" },
    { to: "/results", label: "Results", icon: "chart-bar" },
    { to: "/historical-analysis", label: "Historical Analysis", icon: "chart-line" },
    { to: "/user-management", label: "User Management", icon: "users" },
  ];

  const handleLogout = () => {
     localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const getIcon = (iconName) => {
    switch(iconName) {
      case 'chart-pie':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        );
      case 'chart-bar':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'chart-line':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        );
      case 'users':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="10" />
          </svg>
        );
    }
  };

  return (
    <motion.div
      initial={{ width: 80 }}
      animate={{ width: isExpanded ? 240 : 80 }}
      transition={{ duration: 0.3 }}
      className={`fixed left-0 top-0 h-full z-30 ${
        darkMode 
          ? 'bg-gray-800 text-white border-r border-gray-700' 
          : 'bg-white text-gray-900 border-r border-gray-200'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="py-6 px-4 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
          {isExpanded ? (
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-800 dark:bg-green-900 flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="ml-3 text-xl font-bold"
              >
                <span>Feedback</span>
                <span className="text-green-500 dark:text-green-400">Fusion</span>
              </motion.span>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <div className="text-xl font-bold flex">
                {darkMode ? (
                  <>
                    <span className="text-white">F</span>
                    <span className="text-green-500">F</span>
                  </>
                ) : (
                  <>
                    <span className="text-black">F</span>
                    <span className="text-green-500">F</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto">
          <ul className="px-2 space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => `
                    flex items-center ${isExpanded ? 'px-3' : 'justify-center'} py-3 rounded-lg transition-colors duration-200
                    ${isActive 
                      ? `bg-green-800 text-white dark:bg-green-900 dark:text-white` 
                      : `hover:bg-gray-100 dark:hover:bg-gray-700`}
                  `}
                >
                  <div className="w-6 h-6 flex-shrink-0">
                    {getIcon(item.icon)}
                  </div>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="ml-3"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User profile and logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div 
            className={`flex ${isExpanded ? 'items-center' : 'justify-center'} cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="h-8 w-8 rounded-full bg-green-800 flex items-center justify-center text-white dark:bg-green-900">
              {user.username.charAt(0)}
            </div>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="ml-3 flex-1"
              >
                <div className="text-sm font-medium">{user.username}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{user.role}</div>
              </motion.div>
            )}

            {/* Dropdown menu */}
            {dropdownOpen && isExpanded && (
              <div className={`absolute right-0 bottom-full mb-2 w-48 rounded-md shadow-lg ${
                darkMode ? 'bg-gray-700' : 'bg-white'
              } ring-1 ring-black ring-opacity-5`}>
                <div className="py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDarkMode();
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      darkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPasswordModal(true);
                      setDropdownOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      darkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Change Password
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogout();
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      darkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
      />
    </motion.div>
  );
};

export default Sidebar;