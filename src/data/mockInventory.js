/**
 * Inventory utility constants and helper functions.
 * All list data (branches, categories, items) is fetched from the API.
 */

/** Units of measure available when creating/editing inventory items */
export const UNITS = ['pcs', 'kg', 'g', 'L', 'mL', 'pack', 'box'];

/** Stock status labels */
export const STOCK_STATUSES = ['Normal', 'Low Stock'];

/** Stock threshold used for status determination */
export const LOW_STOCK_THRESHOLD = 20;

/** Format a number as Philippine Peso currency */
export const formatCurrency = (amount) =>
  `₱${parseFloat(amount || 0).toFixed(2)}`;

/** Calculate summary stats from a live list of items */
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
