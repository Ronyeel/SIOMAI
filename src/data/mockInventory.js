/**
 * Mock inventory data and constants for Inventory Management screen.
 * In a real app these would come from an API/Supabase query.
 */

export const BRANCHES = [
  'Main Branch',
  'North Branch',
  'South Branch',
  'East Branch',
];

export const CATEGORIES = [
  'Best Sellers',
  'Drinks',
  'Add-ons',
  'Sauces',
];

export const UNITS = ['pcs', 'kg', 'g', 'L', 'mL', 'pack', 'box'];

export const STOCK_STATUSES = ['Normal', 'Low Stock'];

/** Status thresholds */
export const LOW_STOCK_THRESHOLD = 20;

/** Currency formatter helper */
export const formatCurrency = (amount) =>
  `₱${parseFloat(amount || 0).toFixed(2)}`;

/** Calculate summary stats from a list of items */
export const calculateStats = (items) => {
  const products = items.filter((i) => i.type === 'product');
  const ingredients = items.filter((i) => i.type === 'ingredient');
  const lowStock = items.filter((i) => i.status === 'Low Stock');
  const totalValue = products.reduce(
    (sum, i) => sum + (parseFloat(i.price) || 0) * (parseFloat(i.stock) || 0),
    0
  );

  return {
    totalProducts: products.length,
    totalIngredients: ingredients.length,
    lowStockCount: lowStock.length,
    totalValue,
  };
};

/** Initial mock inventory items */
export const INITIAL_ITEMS = [
  // Products
  {
    id: '1',
    name: 'Siomai (10 pcs)',
    type: 'product',
    category: 'Best Sellers',
    stock: 120,
    unit: 'pcs',
    price: 55,
    branch: 'Main Branch',
    status: 'Normal',
    icon: 'fast-food-outline',
    iconColor: '#34C759',
    bgColor: '#E8F5E9',
  },
  {
    id: '2',
    name: 'Rice',
    type: 'product',
    category: 'Add-ons',
    stock: 10,
    unit: 'pack',
    price: 20,
    branch: 'Main Branch',
    status: 'Low Stock',
    icon: 'fast-food-outline',
    iconColor: '#FF9500',
    bgColor: '#FFF9F0',
  },
  {
    id: '3',
    name: 'Iced Tea (Large)',
    type: 'product',
    category: 'Drinks',
    stock: 60,
    unit: 'pcs',
    price: 35,
    branch: 'North Branch',
    status: 'Normal',
    icon: 'fast-food-outline',
    iconColor: '#34C759',
    bgColor: '#E8F5E9',
  },
  {
    id: '4',
    name: 'Chili Garlic Sauce',
    type: 'product',
    category: 'Sauces',
    stock: 5,
    unit: 'pcs',
    price: 10,
    branch: 'South Branch',
    status: 'Low Stock',
    icon: 'fast-food-outline',
    iconColor: '#FF9500',
    bgColor: '#FFF9F0',
  },
  // Ingredients
  {
    id: '5',
    name: 'Pork Filling',
    type: 'ingredient',
    category: 'Ingredients',
    stock: 25,
    unit: 'kg',
    price: 0,
    branch: 'Main Branch',
    status: 'Normal',
    icon: 'leaf-outline',
    iconColor: '#34C759',
    bgColor: '#E8F5E9',
  },
  {
    id: '6',
    name: 'Siomai Wrapper',
    type: 'ingredient',
    category: 'Ingredients',
    stock: 8,
    unit: 'pack',
    price: 0,
    branch: 'Main Branch',
    status: 'Low Stock',
    icon: 'leaf-outline',
    iconColor: '#FF9500',
    bgColor: '#FFF9F0',
  },
  {
    id: '7',
    name: 'Sesame Oil',
    type: 'ingredient',
    category: 'Ingredients',
    stock: 4,
    unit: 'L',
    price: 0,
    branch: 'North Branch',
    status: 'Low Stock',
    icon: 'leaf-outline',
    iconColor: '#FF9500',
    bgColor: '#FFF9F0',
  },
  {
    id: '8',
    name: 'Soy Sauce',
    type: 'ingredient',
    category: 'Ingredients',
    stock: 15,
    unit: 'L',
    price: 0,
    branch: 'Main Branch',
    status: 'Normal',
    icon: 'leaf-outline',
    iconColor: '#34C759',
    bgColor: '#E8F5E9',
  },
];
