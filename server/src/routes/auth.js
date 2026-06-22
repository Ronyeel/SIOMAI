import express from 'express';
import { supabase } from '../config/supabase.js';
import { resend } from '../config/resend.js';
import { otpService } from '../services/otpService.js';

const router = express.Router();

// Endpoint 1: Request Password Reset OTP
router.post('/reset-password-request', async (req, res) => {
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

    // 3. Store OTP using otpService
    otpService.setOtp(email, generatedOtp);

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
router.post('/verify-otp', async (req, res) => {
  const { email, code } = req.body;
  console.log(`[verify-otp] email=${email} code=${code}`);

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required.' });
  }

  const record = otpService.getOtp(email);
  console.log(`[verify-otp] record found:`, !!record);

  if (!record) {
    console.log(`[verify-otp] No record for ${email}`);
    return res.status(400).json({ error: 'No OTP code was requested for this email.' });
  }

  if (Date.now() > record.expiresAt) {
    otpService.deleteOtp(email);
    console.log(`[verify-otp] OTP expired for ${email}`);
    return res.status(400).json({ error: 'OTP code has expired.' });
  }

  if (code === record.otp) {
    otpService.setVerified(email, record);
    console.log(`[verify-otp] Verified for ${email}`);
    return res.json({ success: true, message: 'OTP verified successfully.' });
  }

  console.log(`[verify-otp] Wrong code for ${email} (expected ${record.otp}, got ${code})`);
  res.status(400).json({ error: 'Invalid verification code.' });
});

// Endpoint 3: Update Password (Only if OTP was verified)
router.post('/update-password', async (req, res) => {
  const { email, newPassword } = req.body;
  console.log(`[update-password] email=${email} passwordLength=${newPassword ? newPassword.length : 'null'}`);

  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required.' });
  }

  const record = otpService.getOtp(email);
  console.log(`[update-password] record:`, record ? `verified=${record.verified}` : 'NOT FOUND');

  if (!record || !record.verified) {
    console.log(`[update-password] Not verified for ${email}`);
    return res.status(403).json({ error: 'Unauthorized. Please verify your OTP code first.' });
  }

  if (Date.now() > record.expiresAt) {
    otpService.deleteOtp(email);
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
    otpService.deleteOtp(email);
    console.log('[update-password] 8. Cleaned up OTP store, returning success!');

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('[update-password] Server catch-all error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
