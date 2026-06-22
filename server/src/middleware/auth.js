import { supabase } from '../config/supabase.js';

export const verifyAdmin = async (req, res, next) => {
  const adminEmail = req.body.adminEmail || req.query.adminEmail;

  if (!adminEmail) {
    return res.status(400).json({ error: 'Admin email is required.' });
  }

  try {
    const { data: adminUser, error: adminErr } = await supabase
      .from('users')
      .select('user_role')
      .eq('user_email', adminEmail.toLowerCase().trim())
      .single();

    if (adminErr || !adminUser || adminUser.user_role !== 'Admin') {
      return res.status(403).json({ error: 'Unauthorized. Administrative access required.' });
    }

    next();
  } catch (err) {
    console.error('[verifyAdmin Middleware] Error:', err);
    res.status(500).json({ error: 'Internal authorization error.' });
  }
};
