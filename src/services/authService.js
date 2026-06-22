import { supabase } from './supabase';
import { API_URL, SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/env';

const SERVER_URL = API_URL;

export const AuthService = {
  /**
   * Logs in a user using Supabase Auth, then fetches their details.
   */
  login: async (email, password) => {
    const cleanEmail = email.toLowerCase().trim();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (authError) {
      throw new Error(authError.message);
    }

    const profile = await AuthService.getProfile(cleanEmail);

    if (profile.status !== 'Active') {
      await supabase.auth.signOut();
      throw new Error('Your account has been deactivated.');
    }

    return {
      user: {
        id: authData.user.id,
        name: profile.name,
        email: authData.user.email,
        role: profile.role,
        branchId: profile.branchId,
      },
    };
  },

  /**
   * Calls the Express server to generate and email a 6-digit OTP.
   * OTP state is managed server-side (no SecureStore needed).
   */
  resetPassword: async (email) => {
    const cleanEmail = email.toLowerCase().trim();
    const response = await fetch(`${SERVER_URL}/api/auth/reset-password-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send reset email. Please try again.');
    }

    return { success: true };
  },

  /**
   * Calls the Express server to verify the 6-digit OTP code.
   * The server marks the session as verified for 5 minutes.
   */
  verifyResetCode: async (email, token) => {
    const cleanEmail = email.toLowerCase().trim();
    const response = await fetch(`${SERVER_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, code: token }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Invalid verification code.');
    }

    return { success: true };
  },

  /**
   * Calls the Express server to update the password in auth.users
   * (so login works). Requires OTP to have been verified first.
   */
  updatePassword: async (email, newPassword) => {
    const cleanEmail = email.toLowerCase().trim();
    const response = await fetch(`${SERVER_URL}/api/auth/update-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update password. Please try again.');
    }

    return { success: true };
  },

  /**
   * Fetches the latest profile data from the public.users table.
   * Relies on RLS to scope this to the requesting user's own row.
   */
  getProfile: async (email) => {
    const cleanEmail = email.toLowerCase().trim();
    const url = `${SUPABASE_URL}/rest/v1/users?user_email=eq.${encodeURIComponent(cleanEmail)}&select=user_name,user_role,user_status,branch_id`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile.');
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      throw new Error('Failed to fetch profile.');
    }

    const profile = data[0];

    return {
      name: profile.user_name,
      email: cleanEmail,
      role: profile.user_role,
      status: profile.user_status,
      branchId: profile.branch_id,
    };
  },

  /**
   * Updates the user's name in the public.users table.
   * Relies on RLS to scope this to the requesting user's own row.
   */
  updateProfile: async (email, updates) => {
    const cleanEmail = email.toLowerCase().trim();
    const dbUpdates = {};

    if (updates.name !== undefined) {
      dbUpdates.user_name = updates.name;
      try {
        await supabase.auth.updateUser({
          data: { name: updates.name }
        });
      } catch (authErr) {
        console.error('[AuthService.updateProfile] Auth metadata update error:', authErr);
      }
    }

    const url = `${SUPABASE_URL}/rest/v1/users?user_email=eq.${encodeURIComponent(cleanEmail)}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(dbUpdates)
    });

    if (!response.ok) {
      throw new Error('Failed to update profile.');
    }

    // Return the refreshed profile
    return AuthService.getProfile(cleanEmail);
  },

  /**
   * Changes the password for the currently logged-in user.
   * Verifies the current password by re-authenticating, then updates
   * Supabase Auth. Auth is the single source of truth for credentials —
   * the password is never written to public.users.
   */
  changePassword: async (email, currentPassword, newPassword) => {
    const cleanEmail = email.toLowerCase().trim();

    // 1. Verify current password by re-authenticating
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: currentPassword,
    });

    if (authError) {
      throw new Error('Current password is incorrect.');
    }

    // 2. Update password in Supabase Auth (only place a password is stored)
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      throw new Error('Failed to update password. Please try again.');
    }

    return { success: true };
  },

  /**
   * Logs out the user.
   */
  logout: async () => {
    await supabase.auth.signOut();
  },
};