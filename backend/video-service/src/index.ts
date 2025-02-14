import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './config/firebase';
import authRoutes from './routes/auth';
import videoRoutes from './routes/videos';
import plantRoutes from './routes/plant.routes';
import mediaRoutes from './routes/media.routes';
import { errorHandler } from './middleware/error';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/videos', videoRoutes);
app.use('/plants', plantRoutes);
app.use('/media', mediaRoutes);

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