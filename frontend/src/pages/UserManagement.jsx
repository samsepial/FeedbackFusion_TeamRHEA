import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../contexts/ThemeContext';
import api from '../services/api';

const UserManagement = () => {
  const { darkMode } = useContext(ThemeContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'supervisor',
    departments: []
  });

  const roles = ['admin', 'manager', 'supervisor'];
  const departments = ['Front Desk', 'Housekeeping', 'Food & Beverage', 'Maintenance', 'Management', 'All'];

  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/users');

      const formattedUsers = response.data.map(user => ({
        id: user._id,
        username: user.username,
        email: user.email || '',
        fullName: user.fullName || user.username,
        role: user.role || 'supervisor',
        departments: user.departments || ['All'],
        lastLogin: user.lastLogin || null
      }));
      
      setUsers(formattedUsers);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDepartmentChange = (department) => {
    setNewUser(prev => {
      if (department === 'All') {
        return { ...prev, departments: ['All'] };
      }
      
      let updatedDepartments;
      
      if (prev.departments.includes(department)) {
        updatedDepartments = prev.departments.filter(d => d !== department);
      } else {
        updatedDepartments = prev.departments.filter(d => d !== 'All');
        updatedDepartments.push(department);
      }
      
      return { ...prev, departments: updatedDepartments };
    });
  };
  
const handleAddUser = async () => {
  try {
    setLoading(true);

    if (!newUser.username || !newUser.password || !newUser.fullName) {
      alert('Please fill in all required fields');
      setLoading(false);
      return;
    }
    
    if (newUser.departments.length === 0) {
      alert('Please select at least one department');
      setLoading(false);
      return;
    }

    const response = await api.post('/users', {
      username: newUser.username,
      password: newUser.password,
      fullName: newUser.fullName,
      role: newUser.role,
      departments: newUser.departments
    });

    const createdUser = {
      id: response.data._id || Date.now(),
      username: newUser.username,
      fullName: newUser.fullName,
      role: newUser.role,
      departments: newUser.departments,
    };
    
    setUsers([...users, createdUser]);

    setNewUser({
      username: '',
      password: '',
      fullName: '',
      role: 'supervisor',
      departments: []
    });
    
    setShowAddUserModal(false);
    setLoading(false);
  } catch (err) {
    console.error('Error adding user:', err);
    alert('Failed to add user: ' + (err.response?.data?.message || err.message));
    setLoading(false);
  }
};
  
  const handleDeleteUser = async (userId) => {
    try {
      setLoading(true);

      const user = users.find(u => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }

      await api.delete(`/users/${user.username}`);

      setUsers(users.filter(user => user.id !== userId));
      setConfirmDeleteUser(null);
      setLoading(false);
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };
  
  const handleEditUser = async () => {
    if (!editingUser) return;
    
    try {
      setLoading(true);

      await api.patch(`/users/${editingUser.username}/role`, { role: editingUser.role });

      setUsers(users.map(user => 
        user.id === editingUser.id ? editingUser : user
      ));
      
      setEditingUser(null);
      setLoading(false);
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Failed to update user: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const handleEditDepartment = (department) => {
    if (!editingUser) return;
    
    setEditingUser(prev => {
      if (department === 'All') {
        return { ...prev, departments: ['All'] };
      }
      
      let updatedDepartments;
      
      if (prev.departments.includes(department)) {
        updatedDepartments = prev.departments.filter(d => d !== department);
      } else {
        updatedDepartments = prev.departments.filter(d => d !== 'All');
        updatedDepartments.push(department);
      }
      
      return { ...prev, departments: updatedDepartments };
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', '');
  };
  
  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen`}>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Manage users, roles, and department access
        </p>
      </div>
      
      {/* Add User Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowAddUserModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add User
        </button>
      </div>
      
      {/* Users table */}
      <div className={`rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800/50' : 'bg-white shadow-md'}`}>
        {loading && !users.length ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className={`p-6 text-center ${darkMode ? 'text-red-400' : 'text-red-500'}`}>
            <p>{error}</p>
            <button 
              onClick={fetchUsers}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <table className="min-w-full">
           
        <thead>
        <tr className={`text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <th className="px-6 py-3">User</th>
        <th className="px-6 py-3">Role</th>
       <th className="px-6 py-3">Departments</th>
       <th className="px-6 py-3 text-right">Actions</th>
      </tr>
      </thead>

<tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
  {users.map(user => (
    <tr key={user.id} className={darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'}>
      {/* User column */}
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="ml-4">
            <div className="font-medium">{user.fullName}</div>
            {/* Remove the email display line since we're removing email */}
          </div>
        </div>
      </td>
      
      {/* Role column */}
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.role === 'admin' 
            ? 'bg-purple-900 text-purple-200' 
            : user.role === 'manager' 
              ? 'bg-blue-900 text-blue-200'
              : 'bg-green-900 text-green-200'
        }`}>
          {user.role}
        </span>
      </td>
      
      {/* Departments column - Make sure this is displayed correctly */}
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {user.departments && user.departments.map(dept => (
            <span key={dept} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-200">
              {dept}
            </span>
          ))}
        </div>
      </td>
      
      {/* Actions column */}
      <td className="px-6 py-4 text-right">
        <button
          onClick={() => setEditingUser(user)}
          className="text-green-500 hover:text-green-400 mr-4"
        >
          Edit
        </button>
        <button 
          onClick={() => setConfirmDeleteUser(user)}
          className="text-red-500 hover:text-red-400"
        >
          Delete
        </button>
      </td>
    </tr>
  ))}
</tbody>
          </table>
        )}
        
        {!loading && users.length === 0 && !error && (
          <div className="text-center py-12">
            <svg 
              className={`mx-auto h-12 w-12 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium">No users</h3>
            <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Get started by creating a new user.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddUserModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add User
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              aria-hidden="true"
              onClick={() => setShowAddUserModal(false)}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className={`inline-block align-bottom ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}>
                <div>
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium" id="modal-title">
                      Add New User
                    </h3>
                    <div className="mt-6 space-y-4">
                      {/* Full Name */}
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          id="fullName"
                          value={newUser.fullName}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      
                      {/* Username */}
                      <div>
                        <label htmlFor="username" className="block text-sm font-medium">
                          Username
                        </label>
                        <input
                          type="text"
                          name="username"
                          id="username"
                          value={newUser.username}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          placeholder="johndoe"
                          required
                        />
                      </div>
                                                              
                     {/* Password */}
                     <div>
                       <label htmlFor="password" className="block text-sm font-medium">
                         Initial Password
                       </label>
                       <input
                         type="password"
                         name="password"
                         id="password"
                         value={newUser.password}
                         onChange={handleInputChange}
                         className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                           darkMode 
                             ? 'bg-gray-700 border-gray-600 text-white' 
                             : 'bg-white border-gray-300 text-gray-900'
                         }`}
                         placeholder="••••••••"
                         required
                       />
                     </div>
                     
                     {/* Role */}
                     <div>
                       <label htmlFor="role" className="block text-sm font-medium">
                         Role
                       </label>
                       <select
                         id="role"
                         name="role"
                         value={newUser.role}
                         onChange={handleInputChange}
                         className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                           darkMode 
                             ? 'bg-gray-700 border-gray-600 text-white' 
                             : 'bg-white border-gray-300 text-gray-900'
                         }`}
                       >
                         {roles.map(role => (
                           <option key={role} value={role}>
                             {role.charAt(0).toUpperCase() + role.slice(1)}
                           </option>
                         ))}
                       </select>
                     </div>
                     
                     {/* Departments */}
                     <div>
                       <label className="block text-sm font-medium mb-2">
                         Departments
                       </label>
                       <div className="grid grid-cols-2 gap-2">
                         {departments.map(dept => (
                           <div key={dept} className="flex items-center">
                             <input
                               id={`dept-${dept}`}
                               name={`dept-${dept}`}
                               type="checkbox"
                               checked={newUser.departments.includes(dept)}
                               onChange={() => handleDepartmentChange(dept)}
                               className={`h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded ${
                                 darkMode ? 'bg-gray-800 border-gray-700' : ''
                               }`}
                             />
                             <label htmlFor={`dept-${dept}`} className="ml-2 text-sm">
                               {dept}
                             </label>
                           </div>
                         ))}
                       </div>
                       <p className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                         Note: Selecting "All" will override any other selection
                       </p>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
             <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}>
               <button
                 type="button"
                 onClick={handleAddUser}
                 disabled={loading}
                 className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm ${
                   loading ? 'opacity-50 cursor-not-allowed' : ''
                 }`}
               >
                 {loading ? 'Adding...' : 'Add User'}
               </button>
               <button
                 type="button"
                 onClick={() => setShowAddUserModal(false)}
                 className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                   darkMode 
                     ? 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 focus:ring-gray-500' 
                     : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-200'
                 }`}
               >
                 Cancel
               </button>
             </div>
           </div>
         </div>
       </div>
     )}
      
      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              aria-hidden="true"
              onClick={() => setEditingUser(null)}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className={`inline-block align-bottom ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}>
                <div>
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium" id="modal-title">
                      Edit User: {editingUser.fullName}
                    </h3>
                    <div className="mt-6 space-y-4">
                      {/* Role */}
                      <div>
                        <label htmlFor="edit-role" className="block text-sm font-medium">
                          Role
                        </label>
                        <select
                          id="edit-role"
                          value={editingUser.role}
                          onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                          className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          {roles.map(role => (
                            <option key={role} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Departments */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Departments
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {departments.map(dept => (
                            <div key={dept} className="flex items-center">
                              <input
                                id={`edit-dept-${dept}`}
                                type="checkbox"
                                checked={editingUser.departments && editingUser.departments.includes(dept)}
                                onChange={() => handleEditDepartment(dept)}
                                className={`h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded ${
                                  darkMode ? 'bg-gray-800 border-gray-700' : ''
                                }`}
                              />
                              <label htmlFor={`edit-dept-${dept}`} className="ml-2 text-sm">
                                {dept}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}>
                <button
                  type="button"
                  onClick={handleEditUser}
                  disabled={loading}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                    darkMode 
                      ? 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 focus:ring-gray-500' 
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-200'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete User Confirmation */}
      {confirmDeleteUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              aria-hidden="true"
              onClick={() => setConfirmDeleteUser(null)}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className={`inline-block align-bottom ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}>
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium" id="modal-title">
                      Delete User
                    </h3>
                    <div className="mt-2">
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Are you sure you want to delete user <span className="font-medium">{confirmDeleteUser.fullName}</span>? 
                        This action cannot be undone and all associated data will be permanently removed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}>
                <button
                  type="button"
                  onClick={() => handleDeleteUser(confirmDeleteUser.id)}
                  disabled={loading}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteUser(null)}
                  className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                    darkMode 
                      ? 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 focus:ring-gray-500' 
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-200'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;