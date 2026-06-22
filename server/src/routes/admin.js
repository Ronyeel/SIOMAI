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

// Endpoint 14: List inventory items
router.get('/inventory', async (req, res) => {
  try {
    const { data: inventory, error: dbErr } = await supabase
      .from('inventory')
      .select(`
        inventory_id,
        inventory_stock_level,
        inventory_minimum_stock,
        inventory_maximum_stock,
        inventory_unit_of_measure,
        inventory_last_updated,
        product:product_id (
          product_id,
          product_name,
          product_category,
          product_price
        ),
        branch:branch_id (
          branch_id,
          branch_name
        )
      `)
      .order('inventory_id', { ascending: true });

    if (dbErr) {
      console.error('Failed to fetch inventory:', dbErr);
      return res.status(500).json({ error: 'Failed to retrieve inventory items.' });
    }

    const mapped = (inventory || []).map(item => {
      const prod = item.product || {};
      const br = item.branch || {};
      
      const isProduct = prod.product_category !== 'Ingredients' && parseFloat(prod.product_price || 0) > 0;
      const type = isProduct ? 'product' : 'ingredient';

      const stock = parseFloat(item.inventory_stock_level || 0);
      const minStock = parseFloat(item.inventory_minimum_stock || 0);
      const status = stock <= minStock ? 'Low Stock' : 'Normal';

      return {
        id: item.inventory_id.toString(),
        name: prod.product_name || 'Unnamed Product',
        type,
        category: prod.product_category || 'General',
        stock,
        unit: item.inventory_unit_of_measure || 'pcs',
        price: parseFloat(prod.product_price || 0),
        branch: br.branch_name || 'Unknown Branch',
        status,
        icon: type === 'product' ? 'fast-food-outline' : 'leaf-outline',
        iconColor: status === 'Low Stock' ? '#FF9500' : '#34C759',
        bgColor: status === 'Low Stock' ? '#FFF9F0' : '#E8F5E9',
      };
    });

    res.json({ success: true, inventory: mapped });
  } catch (err) {
    console.error('[list-inventory] Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Endpoint 15: Create inventory item
router.post('/create-inventory-item', async (req, res) => {
  const { name, type, category, stock, unit, price, branch } = req.body;
  if (!name || !type || !category || stock === undefined || !unit || !branch) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // 1. Check if product already exists
    let { data: prod, error: prodFindErr } = await supabase
      .from('product')
      .select('*')
      .eq('product_name', name.trim())
      .maybeSingle();

    if (prodFindErr) {
      console.error('Find product error:', prodFindErr);
    }

    if (!prod) {
      // Create new product in product table
      const { data: newProd, error: prodErr } = await supabase
        .from('product')
        .insert({
          product_name: name.trim(),
          product_category: category.trim(),
          product_price: type === 'product' ? parseFloat(price || 0) : 0,
          product_status: 'Available'
        })
        .select()
        .single();

      if (prodErr) {
        console.error('Failed to create product record:', prodErr);
        return res.status(500).json({ error: 'Failed to create product record.' });
      }
      prod = newProd;
    }

    // 2. Find branch ID from branch name
    const { data: br } = await supabase
      .from('branches')
      .select('branch_id')
      .eq('branch_name', branch.trim())
      .maybeSingle();
    
    const branchId = br ? br.branch_id : 3; // Moreno Branch fallback

    // 3. Insert inventory record
    const stockNum = parseFloat(stock);
    const status = stockNum < 20 ? 'Low Stock' : 'Normal';

    const { data: createdItem, error: dbErr } = await supabase
      .from('inventory')
      .insert({
        product_id: prod.product_id,
        branch_id: branchId,
        inventory_stock_level: stockNum,
        inventory_minimum_stock: 20,
        inventory_maximum_stock: 200,
        inventory_unit_of_measure: unit.trim(),
        inventory_last_updated: new Date().toISOString()
      })
      .select(`
        inventory_id,
        inventory_stock_level,
        inventory_minimum_stock,
        inventory_maximum_stock,
        inventory_unit_of_measure,
        inventory_last_updated,
        product:product_id (
          product_id,
          product_name,
          product_category,
          product_price
        ),
        branch:branch_id (
          branch_id,
          branch_name
        )
      `)
      .single();

    if (dbErr) {
      console.error('Failed to create inventory item:', dbErr);
      return res.status(500).json({ error: 'Failed to create inventory item.' });
    }

    const mapped = {
      id: createdItem.inventory_id.toString(),
      name: prod.product_name,
      type,
      category: prod.product_category,
      stock: parseFloat(createdItem.inventory_stock_level),
      unit: createdItem.inventory_unit_of_measure,
      price: parseFloat(prod.product_price || 0),
      branch: branch.trim(),
      status,
      icon: type === 'product' ? 'fast-food-outline' : 'leaf-outline',
      iconColor: status === 'Low Stock' ? '#FF9500' : '#34C759',
      bgColor: status === 'Low Stock' ? '#FFF9F0' : '#E8F5E9',
    };

    res.json({ success: true, item: mapped });
  } catch (err) {
    console.error('[create-inventory-item] Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Endpoint 16: Update inventory item
router.post('/update-inventory-item', async (req, res) => {
  const { id, name, type, category, stock, unit, price, branch } = req.body;
  if (!id || !name || !type || !category || stock === undefined || !unit || !branch) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // 1. Get existing inventory item to find the linked product_id
    const { data: existingInv, error: findInvErr } = await supabase
      .from('inventory')
      .select('product_id')
      .eq('inventory_id', parseInt(id))
      .single();

    if (findInvErr || !existingInv) {
      console.error('Find existing inventory item error:', findInvErr);
      return res.status(404).json({ error: 'Inventory item not found.' });
    }

    // 2. Update product details
    const { error: prodErr } = await supabase
      .from('product')
      .update({
        product_name: name.trim(),
        product_category: category.trim(),
        product_price: type === 'product' ? parseFloat(price || 0) : 0,
      })
      .eq('product_id', existingInv.product_id);

    if (prodErr) {
      console.error('Failed to update product details:', prodErr);
      return res.status(500).json({ error: 'Failed to update product details.' });
    }

    // 3. Find branch ID from branch name
    const { data: br } = await supabase
      .from('branches')
      .select('branch_id')
      .eq('branch_name', branch.trim())
      .maybeSingle();
    
    const branchId = br ? br.branch_id : 3;

    // 4. Update inventory record
    const stockNum = parseFloat(stock);
    const status = stockNum < 20 ? 'Low Stock' : 'Normal';

    const { data: updatedItem, error: dbErr } = await supabase
      .from('inventory')
      .update({
        branch_id: branchId,
        inventory_stock_level: stockNum,
        inventory_unit_of_measure: unit.trim(),
        inventory_last_updated: new Date().toISOString()
      })
      .eq('inventory_id', parseInt(id))
      .select(`
        inventory_id,
        inventory_stock_level,
        inventory_minimum_stock,
        inventory_maximum_stock,
        inventory_unit_of_measure,
        inventory_last_updated,
        product:product_id (
          product_id,
          product_name,
          product_category,
          product_price
        ),
        branch:branch_id (
          branch_id,
          branch_name
        )
      `)
      .single();

    if (dbErr) {
      console.error('Failed to update inventory record:', dbErr);
      return res.status(500).json({ error: 'Failed to update inventory record.' });
    }

    const mapped = {
      id: updatedItem.inventory_id.toString(),
      name: name.trim(),
      type,
      category: category.trim(),
      stock: stockNum,
      unit: unit.trim(),
      price: type === 'product' ? parseFloat(price || 0) : 0,
      branch: branch.trim(),
      status,
      icon: type === 'product' ? 'fast-food-outline' : 'leaf-outline',
      iconColor: status === 'Low Stock' ? '#FF9500' : '#34C759',
      bgColor: status === 'Low Stock' ? '#FFF9F0' : '#E8F5E9',
    };

    res.json({ success: true, item: mapped });
  } catch (err) {
    console.error('[update-inventory-item] Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Endpoint 17: Delete inventory item
router.post('/delete-inventory-item', async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'ID is required.' });
  }

  try {
    const { error: dbErr } = await supabase
      .from('inventory')
      .delete()
      .eq('inventory_id', parseInt(id));

    if (dbErr) {
      console.error('Failed to delete inventory item:', dbErr);
      return res.status(500).json({ error: 'Failed to delete inventory item.' });
    }

    res.json({ success: true, message: 'Inventory item deleted successfully.' });
  } catch (err) {
    console.error('[delete-inventory-item] Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Endpoint 18: Get distinct product categories from DB
router.get('/inventory-categories', async (req, res) => {
  try {
    const { data, error: dbErr } = await supabase
      .from('product')
      .select('product_category');

    if (dbErr) {
      console.error('Failed to fetch categories:', dbErr);
      return res.status(500).json({ error: 'Failed to fetch categories.' });
    }

    const categories = [...new Set((data || []).map(r => r.product_category).filter(Boolean))];
    res.json({ success: true, categories });
  } catch (err) {
    console.error('[inventory-categories] Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Endpoint 19: Get branch names from DB
router.get('/branch-names', async (req, res) => {
  try {
    const { data, error: dbErr } = await supabase
      .from('branches')
      .select('branch_name')
      .order('branch_name', { ascending: true });

    if (dbErr) {
      console.error('Failed to fetch branch names:', dbErr);
      return res.status(500).json({ error: 'Failed to fetch branch names.' });
    }

    const branches = (data || []).map(r => r.branch_name).filter(Boolean);
    res.json({ success: true, branches });
  } catch (err) {
    console.error('[branch-names] Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;

