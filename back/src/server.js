import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async function (req, res, next) {
    console.log(`${req.method} ${req.url} ${new Date().toISOString()}`);
    next();
}, async function(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api', authRoutes);
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, function() {
    console.log(`MENTIX-Hub server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

export default app;