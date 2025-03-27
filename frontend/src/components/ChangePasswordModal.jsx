import React, { useState, useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { darkMode } = useContext(ThemeContext);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');
    
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }
    
    try {
      setLoading(true);
       
         await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err) {
      setError('Failed to change password. Please check your current password and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className={`inline-block align-bottom ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
          <form onSubmit={handleSubmit}>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}>
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium" id="modal-title">
                    Change Password
                  </h3>
                  <div className="mt-6 space-y-4">
                    {error && (
                      <div className={`p-3 rounded-md ${darkMode ? 'bg-red-900/20 text-red-200' : 'bg-red-50 text-red-800'}`}>
                        {error}
                      </div>
                    )}
                    
                    {success && (
                      <div className={`p-3 rounded-md ${darkMode ? 'bg-green-900/20 text-green-200' : 'bg-green-50 text-green-800'}`}>
                        {success}
                      </div>
                    )}
                    
                    {/* Current Password */}
                    <div>
                      <label htmlFor="current-password" className="block text-sm font-medium">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="current-password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        required
                      />
                    </div>
                    
                    {/* New Password */}
                    <div>
                      <label htmlFor="new-password" className="block text-sm font-medium">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        minLength={8}
                        required
                      />
                    </div>
                    
                    {/* Confirm New Password */}
                    <div>
                      <label htmlFor="confirm-password" className="block text-sm font-medium">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}>
              <button
                type="submit"
                disabled={loading}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                  darkMode 
                    ? 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 focus:ring-gray-500' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-200'
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;