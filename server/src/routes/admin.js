import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Endpoint 4: List all users (For Admin)
router.get('/users', async (req, res) => {
  try {
    const { data: users, error: usersErr } = await supabase
      .from('users')
      .select('*')
      .order('user_created_at', { ascending: false });

    if (usersErr) {
      console.error('Failed to fetch users:', usersErr);
      return res.status(500).json({ error: 'Failed to retrieve users.' });
    }

    res.json({ success: true, users });
  } catch (err) {
    console.error('[list-users] Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Endpoint 5: Create User (For Admin)
router.post('/create-user', async (req, res) => {
  const { email, password, name, role, status } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Check if user already exists in public.users
    const { data: existingUser } = await supabase
      .from('users')
      .select('user_email')
      .eq('user_email', email.toLowerCase().trim())
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Create user in Supabase Auth using admin API
    const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: password,
      email_confirm: true,
      user_metadata: { name: name }
    });

    if (authErr) {
      console.error('Supabase Auth user creation failed:', authErr);
      return res.status(400).json({ error: authErr.message });
    }

    // Insert user record into public.users table
    const { error: dbErr } = await supabase
      .from('users')
      .insert({
        user_name: name,
        user_email: email.toLowerCase().trim(),
        user_password: password,
        user_role: role,
        user_status: status || 'Active',
      });

    if (dbErr) {
      console.error('Failed to save profile record:', dbErr);
      // Rollback Auth user creation
      try {
        await supabase.auth.admin.deleteUser(authUser.user.id);
      } catch (delErr) {
        console.error('Failed to rollback auth user creation:', delErr);
      }
      return res.status(500).json({ error: 'Failed to create database profile.' });
    }

    res.json({ success: true, message: 'Account created successfully.' });
  } catch (err) {
    console.error('[create-user] Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Endpoint 6: Update status of user (For Admin)
router.post('/update-user-status', async (req, res) => {
  const { targetEmail, status } = req.body;
  if (!targetEmail || !status) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const { error: dbErr } = await supabase
      .from('users')
      .update({ user_status: status })
      .eq('user_email', targetEmail.toLowerCase().trim());

    if (dbErr) {
      console.error('Failed to update status:', dbErr);
      return res.status(500).json({ error: 'Failed to update user status.' });
    }

    res.json({ success: true, message: `User status updated to ${status}.` });
  } catch (err) {
    console.error('[update-user-status] Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Endpoint 7: Delete user (For Admin)
router.post('/delete-user', async (req, res) => {
  const { targetEmail } = req.body;
  if (!targetEmail) {
    return res.status(400).json({ error: 'Target email is required.' });
  }

  try {
    // Find auth user ID first
    const { data: authData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error('Failed to list auth users:', listError);
      return res.status(500).json({ error: 'Failed to retrieve user account.' });
    }

    const users = authData?.users || [];
    const authUser = users.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase().trim());

    if (authUser) {
      await supabase.auth.admin.deleteUser(authUser.id);
    }

    const { error: dbErr } = await supabase
      .from('users')
      .delete()
      .eq('user_email', targetEmail.toLowerCase().trim());

    if (dbErr) {
      console.error('Failed to delete profile:', dbErr);
      return res.status(500).json({ error: 'Failed to delete user profile.' });
    }

    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    console.error('[delete-user] Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Endpoint 8: Edit user details (For Admin)
router.post(['/edit-user', '/update-user'], async (req, res) => {
  let { targetEmail, name, email, role, status, password } = req.body;
  if (!email) {
    email = targetEmail;
  }
  if (!targetEmail || !name || !email || !role || !status) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // 2. Fetch list of auth users to find the correct auth user ID
    const { data: authData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error('Failed to list auth users:', listError);
      return res.status(500).json({ error: 'Failed to retrieve user account.' });
    }

    const users = authData?.users || [];
    const authUser = users.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase().trim());

    if (!authUser) {
      return res.status(404).json({ error: 'Auth user not found.' });
    }

    // 3. Update Supabase Auth user (email, password if provided, name in metadata)
    const authUpdates = {
      email: email.toLowerCase().trim(),
      user_metadata: { name: name }
    };
    if (password) {
      authUpdates.password = password;
    }

    const { error: authErr } = await supabase.auth.admin.updateUserById(authUser.id, authUpdates);
    if (authErr) {
      console.error('Failed to update auth user:', authErr);
      return res.status(400).json({ error: authErr.message });
    }

    // 4. Update public.users record
    const dbUpdates = {
      user_name: name,
      user_email: email.toLowerCase().trim(),
      user_role: role,
      user_status: status
    };
    if (password) {
      dbUpdates.user_password = password;
    }

    const { error: dbErr } = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('user_email', targetEmail.toLowerCase().trim());

    if (dbErr) {
      console.error('Failed to update user profile in DB:', dbErr);
      return res.status(500).json({ error: 'Failed to update user profile database record.' });
    }

    res.json({ success: true, message: 'User updated successfully.' });
  } catch (err) {
    console.error('[edit-user] Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Endpoint 9: List all branches (For Admin)
router.get('/branches', async (req, res) => {
  try {
    const { data: branches, error: branchErr } = await supabase
      .from('branches')
      .select('*')
      .order('branch_name', { ascending: true });

    if (branchErr) {
      console.error('Failed to fetch branches:', branchErr);
      return res.status(500).json({ error: 'Failed to retrieve branches.' });
    }

    res.json({ success: true, branches });
  } catch (err) {
    console.error('[list-branches] Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Endpoint 10: Create Branch (For Admin)
router.post('/create-branch', async (req, res) => {
  const { name, address, type, status, contactNumber, managerId } = req.body;

  if (!name || !address || !type) {
    return res.status(400).json({ error: 'Name, Address and Type are required.' });
  }

  try {
    const { error: dbErr } = await supabase
      .from('branches')
      .insert({
        branch_name: name.trim(),
        branch_address: address.trim(),
        branch_type: type.trim(),
        branch_status: status || 'Active',
        branch_contact_number: contactNumber ? contactNumber.trim() : null,
        branch_manager_id: managerId ? parseInt(managerId) : null,
      });

    if (dbErr) {
      console.error('Failed to create branch:', dbErr);
      return res.status(500).json({ error: 'Failed to create branch record.' });
    }

    res.json({ success: true, message: 'Branch created successfully.' });
  } catch (err) {
    console.error('[create-branch] Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Endpoint 11: Edit/Update Branch (For Admin)
router.post(['/edit-branch', '/update-branch'], async (req, res) => {
  const { targetId, name, address, type, status, contactNumber, managerId } = req.body;

  if (!targetId || !name || !address || !type || !status) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const { error: dbErr } = await supabase
      .from('branches')
      .update({
        branch_name: name.trim(),
        branch_address: address.trim(),
        branch_type: type.trim(),
        branch_status: status,
        branch_contact_number: contactNumber ? contactNumber.trim() : null,
        branch_manager_id: managerId ? parseInt(managerId) : null,
      })
      .eq('branch_id', parseInt(targetId));

    if (dbErr) {
      console.error('Failed to update branch:', dbErr);
      return res.status(500).json({ error: 'Failed to update branch record.' });
    }

    res.json({ success: true, message: 'Branch updated successfully.' });
  } catch (err) {
    console.error('[edit-branch] Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Endpoint 12: Delete Branch (For Admin)
router.post('/delete-branch', async (req, res) => {
  const { targetId } = req.body;

  if (!targetId) {
    return res.status(400).json({ error: 'Branch ID is required.' });
  }

  try {
    const { error: dbErr } = await supabase
      .from('branches')
      .delete()
      .eq('branch_id', parseInt(targetId));

    if (dbErr) {
      console.error('Failed to delete branch:', dbErr);
      return res.status(500).json({ error: 'Failed to delete branch record.' });
    }

    res.json({ success: true, message: 'Branch deleted successfully.' });
  } catch (err) {
    console.error('[delete-branch] Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Endpoint 13: Update Branch Status (For Admin)
router.post('/update-branch-status', async (req, res) => {
  const { targetId, status } = req.body;

  if (!targetId || !status) {
    return res.status(400).json({ error: 'Status and ID are required.' });
  }

  try {
    const { error: dbErr } = await supabase
      .from('branches')
      .update({ branch_status: status })
      .eq('branch_id', parseInt(targetId));

    if (dbErr) {
      console.error('Failed to update branch status:', dbErr);
      return res.status(500).json({ error: 'Failed to update branch status.' });
    }

    res.json({ success: true, message: `Branch status updated to ${status}.` });
  } catch (err) {
    console.error('[update-branch-status] Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
