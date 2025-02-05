import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './config/firebase';
import authRoutes from './routes/auth';
import { errorHandler } from './middleware/error';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);

// Health check route
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 