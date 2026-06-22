import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import ws from 'ws';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Initialize Supabase Client securely on server-side
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { realtime: { transport: ws } }
);

// Initialize Resend SDK
const resend = new Resend(process.env.RESEND_API_KEY);

// In-memory store for OTP records
const otpStore = new Map();

// Endpoint 1: Request Password Reset OTP
app.post('/api/auth/reset-password-request', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    // 1. Verify user exists in public.users
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('user_email')
      .eq('user_email', email.toLowerCase())
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'No account found with that email address.' });
    }

    // 2. Generate a random 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Store OTP in memory (expires in 10 minutes)
    otpStore.set(email.toLowerCase(), {
      otp: generatedOtp,
      verified: false,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    console.log(`[OTP] Generated OTP for ${email}: ${generatedOtp}`);

    // 4. Send email via Resend
    const { data, error: mailError } = await resend.emails.send({
      from: 'Siomai Street <onboarding@resend.dev>',
      to: email,
      subject: 'Reset your Siomai Street password',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #D00D14;">Siomai Street</h2>
          <p>We received a request to reset your account password. Enter the following code to continue:</p>
          <div style="background-color: #F8F9FA; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #D00D14; letter-spacing: 4px;">${generatedOtp}</span>
          </div>
          <p style="font-size: 13px; color: #666;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    if (mailError) {
      console.error('Resend Error:', mailError);
      return res.status(500).json({ error: 'Failed to send reset email. Please try again later.' });
    }

    res.json({ success: true, message: 'OTP sent successfully.' });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Endpoint 2: Verify OTP Code
app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, code } = req.body;
  console.log(`[verify-otp] email=${email} code=${code}`);

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required.' });
  }

  const record = otpStore.get(email.toLowerCase());
  console.log(`[verify-otp] record found:`, !!record);

  if (!record) {
    console.log(`[verify-otp] No record for ${email}`);
    return res.status(400).json({ error: 'No OTP code was requested for this email.' });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    console.log(`[verify-otp] OTP expired for ${email}`);
    return res.status(400).json({ error: 'OTP code has expired.' });
  }

  if (code === record.otp) {
    otpStore.set(email.toLowerCase(), { ...record, verified: true, expiresAt: Date.now() + 5 * 60 * 1000 });
    console.log(`[verify-otp] Verified for ${email}`);
    return res.json({ success: true, message: 'OTP verified successfully.' });
  }

  console.log(`[verify-otp] Wrong code for ${email} (expected ${record.otp}, got ${code})`);
  res.status(400).json({ error: 'Invalid verification code.' });
});

// Endpoint 3: Update Password (Only if OTP was verified)
app.post('/api/auth/update-password', async (req, res) => {
  const { email, newPassword } = req.body;
  console.log(`[update-password] email=${email} passwordLength=${newPassword ? newPassword.length : 'null'} startsWith=${newPassword ? newPassword[0] : ''} endsWith=${newPassword ? newPassword[newPassword.length - 1] : ''}`);

  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required.' });
  }

  const record = otpStore.get(email.toLowerCase());
  console.log(`[update-password] record:`, record ? `verified=${record.verified}` : 'NOT FOUND');

  if (!record || !record.verified) {
    console.log(`[update-password] Not verified for ${email}`);
    return res.status(403).json({ error: 'Unauthorized. Please verify your OTP code first.' });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return res.status(403).json({ error: 'Session expired. Please request a new OTP code.' });
  }

  try {
    console.log('[update-password] 1. Calling listUsers...');
    const { data, error: listError } = await supabase.auth.admin.listUsers();
    console.log('[update-password] 2. listUsers result:', { data: !!data, listError });

    if (listError) {
      console.error('Failed to list auth users:', listError);
      return res.status(500).json({ error: 'Failed to retrieve user account.' });
    }

    const users = data?.users || [];
    const authUser = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    console.log('[update-password] 3. Find user result:', authUser ? `id=${authUser.id}` : 'NOT FOUND');

    if (!authUser) {
      console.error(`No auth.users entry found for: ${email}`);
      return res.status(404).json({ error: 'No Supabase Auth account found for this email.' });
    }

    // 2. Update password in auth.users (so login works)
    console.log('[update-password] 4. Calling updateUserById...');
    const { error: authError } = await supabase.auth.admin.updateUserById(
      authUser.id,
      { password: newPassword }
    );
    console.log('[update-password] 5. updateUserById result:', { authError });

    if (authError) {
      console.error('Auth password update error:', authError);
      return res.status(500).json({ error: 'Failed to update login password. Please try again.' });
    }

    // 3. Update password in public.users
    console.log('[update-password] 6. Updating public.users...');
    const { error: dbError } = await supabase
      .from('users')
      .update({ user_password: newPassword })
      .eq('user_email', email.toLowerCase());
    console.log('[update-password] 7. public.users update result:', { dbError });

    if (dbError) {
      console.error('Database update error:', dbError);
      return res.status(500).json({ error: 'Failed to update password record. Please try again.' });
    }

    // 4. Clean up verification session
    otpStore.delete(email.toLowerCase());
    console.log('[update-password] 8. Cleaned up OTP store, returning success!');

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('[update-password] Server catch-all error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Endpoint 4: List all users (For Admin)
app.get('/api/admin/users', async (req, res) => {
  const { adminEmail } = req.query;
  if (!adminEmail) {
    return res.status(400).json({ error: 'Admin email is required.' });
  }

  try {
    // 1. Verify caller is Admin
    const { data: adminUser, error: adminErr } = await supabase
      .from('users')
      .select('user_role')
      .eq('user_email', adminEmail.toLowerCase().trim())
      .single();

    if (adminErr || !adminUser || adminUser.user_role !== 'Admin') {
      return res.status(403).json({ error: 'Unauthorized. Only Admins can access users list.' });
    }

    // 2. Fetch all users from public.users table
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
app.post('/api/admin/create-user', async (req, res) => {
  const { adminEmail, email, password, name, role, status } = req.body;

  if (!adminEmail || !email || !password || !name || !role) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // 1. Verify caller is Admin
    const { data: adminUser, error: adminErr } = await supabase
      .from('users')
      .select('user_role')
      .eq('user_email', adminEmail.toLowerCase().trim())
      .single();

    if (adminErr || !adminUser || adminUser.user_role !== 'Admin') {
      return res.status(403).json({ error: 'Unauthorized. Only Admins can create users.' });
    }

    // 2. Check if user already exists in public.users
    const { data: existingUser } = await supabase
      .from('users')
      .select('user_email')
      .eq('user_email', email.toLowerCase().trim())
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // 3. Create user in Supabase Auth using admin API
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

    // 4. Insert user record into public.users table
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
      // Clean up created auth user so they are in sync
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
app.post('/api/admin/update-user-status', async (req, res) => {
  const { adminEmail, targetEmail, status } = req.body;
  if (!adminEmail || !targetEmail || !status) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Verify admin
    const { data: adminUser, error: adminErr } = await supabase
      .from('users')
      .select('user_role')
      .eq('user_email', adminEmail.toLowerCase().trim())
      .single();

    if (adminErr || !adminUser || adminUser.user_role !== 'Admin') {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

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
app.post('/api/admin/delete-user', async (req, res) => {
  const { adminEmail, targetEmail } = req.body;
  if (!adminEmail || !targetEmail) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Verify admin
    const { data: adminUser, error: adminErr } = await supabase
      .from('users')
      .select('user_role')
      .eq('user_email', adminEmail.toLowerCase().trim())
      .single();

    if (adminErr || !adminUser || adminUser.user_role !== 'Admin') {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

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
app.post(['/api/admin/edit-user', '/api/admin/update-user'], async (req, res) => {
  let { adminEmail, targetEmail, name, email, role, status, password } = req.body;
  if (!email) {
    email = targetEmail;
  }
  if (!adminEmail || !targetEmail || !name || !email || !role || !status) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // 1. Verify admin
    const { data: adminUser, error: adminErr } = await supabase
      .from('users')
      .select('user_role')
      .eq('user_email', adminEmail.toLowerCase().trim())
      .single();

    if (adminErr || !adminUser || adminUser.user_role !== 'Admin') {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

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
app.get('/api/admin/branches', async (req, res) => {
  const { adminEmail } = req.query;
  if (!adminEmail) {
    return res.status(400).json({ error: 'Admin email is required.' });
  }

  try {
    // Verify admin
    const { data: adminUser, error: adminErr } = await supabase
      .from('users')
      .select('user_role')
      .eq('user_email', adminEmail.toLowerCase().trim())
      .single();

    if (adminErr || !adminUser || adminUser.user_role !== 'Admin') {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    // Fetch branches
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
app.post('/api/admin/create-branch', async (req, res) => {
  const { adminEmail, name, address, type, status, contactNumber, managerId } = req.body;

  if (!adminEmail || !name || !address || !type) {
    return res.status(400).json({ error: 'Name, Address and Type are required.' });
  }

  try {
    // Verify admin
    const { data: adminUser, error: adminErr } = await supabase
      .from('users')
      .select('user_role')
      .eq('user_email', adminEmail.toLowerCase().trim())
      .single();

    if (adminErr || !adminUser || adminUser.user_role !== 'Admin') {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    // Insert branch
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
app.post(['/api/admin/edit-branch', '/api/admin/update-branch'], async (req, res) => {
  const { adminEmail, targetId, name, address, type, status, contactNumber, managerId } = req.body;

  if (!adminEmail || !targetId || !name || !address || !type || !status) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Verify admin
    const { data: adminUser, error: adminErr } = await supabase
      .from('users')
      .select('user_role')
      .eq('user_email', adminEmail.toLowerCase().trim())
      .single();

    if (adminErr || !adminUser || adminUser.user_role !== 'Admin') {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    // Update branch
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
app.post('/api/admin/delete-branch', async (req, res) => {
  const { adminEmail, targetId } = req.body;

  if (!adminEmail || !targetId) {
    return res.status(400).json({ error: 'Branch ID is required.' });
  }

  try {
    // Verify admin
    const { data: adminUser, error: adminErr } = await supabase
      .from('users')
      .select('user_role')
      .eq('user_email', adminEmail.toLowerCase().trim())
      .single();

    if (adminErr || !adminUser || adminUser.user_role !== 'Admin') {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    // Delete branch
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
app.post('/api/admin/update-branch-status', async (req, res) => {
  const { adminEmail, targetId, status } = req.body;

  if (!adminEmail || !targetId || !status) {
    return res.status(400).json({ error: 'Status and ID are required.' });
  }

  try {
    // Verify admin
    const { data: adminUser, error: adminErr } = await supabase
      .from('users')
      .select('user_role')
      .eq('user_email', adminEmail.toLowerCase().trim())
      .single();

    if (adminErr || !adminUser || adminUser.user_role !== 'Admin') {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    // Update status
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

app.listen(PORT, () => {
  console.log(`SIOMAI Secure Backend running on port ${PORT}`);
});
