import { API_URL } from '../config/env';

/**
 * Standardized HTTP request helper.
 */
async function request(endpoint, method = 'GET', body = null) {
  const url = `${API_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    
    let data;
    try {
      data = await response.json();
    } catch (parseErr) {
      // Handle responses that are not valid JSON or empty
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return { success: true };
    }

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`[API Service Error] ${method} ${endpoint}:`, error.message);
    throw error;
  }
}

export const ApiService = {
  // Admin Operations
  admin: {
    // User endpoints
    getUsers: (adminEmail) => 
      request(`/api/admin/users?adminEmail=${encodeURIComponent(adminEmail)}`),

    createUser: (adminEmail, userData) => 
      request('/api/admin/create-user', 'POST', { adminEmail, ...userData }),

    updateUserStatus: (adminEmail, targetEmail, status) => 
      request('/api/admin/update-user-status', 'POST', { adminEmail, targetEmail, status }),

    deleteUser: (adminEmail, targetEmail) => 
      request('/api/admin/delete-user', 'POST', { adminEmail, targetEmail }),

    updateUser: (adminEmail, targetEmail, userData) => 
      request('/api/admin/update-user', 'POST', { adminEmail, targetEmail, ...userData }),

    // Branch endpoints
    getBranches: (adminEmail) => 
      request(`/api/admin/branches?adminEmail=${encodeURIComponent(adminEmail)}`),

    createBranch: (adminEmail, branchData) => 
      request('/api/admin/create-branch', 'POST', { adminEmail, ...branchData }),

    updateBranch: (adminEmail, targetId, branchData) => 
      request('/api/admin/update-branch', 'POST', { adminEmail, targetId, ...branchData }),

    deleteBranch: (adminEmail, targetId) => 
      request('/api/admin/delete-branch', 'POST', { adminEmail, targetId }),

    updateBranchStatus: (adminEmail, targetId, status) => 
      request('/api/admin/update-branch-status', 'POST', { adminEmail, targetId, status }),
  },

  // Auth Operations (Express endpoints)
  auth: {
    requestResetPassword: (email) => 
      request('/api/auth/reset-password-request', 'POST', { email }),

    verifyOtp: (email, code) => 
      request('/api/auth/verify-otp', 'POST', { email, code }),

    updatePassword: (email, newPassword) => 
      request('/api/auth/update-password', 'POST', { email, newPassword }),
  }
};
