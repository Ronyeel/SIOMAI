import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Route modules
import authRoutes from './src/routes/auth.js';
import adminRoutes from './src/routes/admin.js';

// Import Auth verification middleware for securing admin routes
import { verifyAdmin } from './src/middleware/auth.js';

dotenv.config();

const app = express();

// Standard middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Register Route Handlers
app.use('/api/auth', authRoutes);
app.use('/api/admin', verifyAdmin, adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`SIOMAI Secure Backend running on port ${PORT}`);
});
