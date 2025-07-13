import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import tripRoutes from './routes/tripRoutes.js';

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  'https://travelmateplanner.vercel.app',
  'http://localhost:5173',
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for this origin'));
    }
  },
  credentials: true,
}));

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running' });
});

app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));