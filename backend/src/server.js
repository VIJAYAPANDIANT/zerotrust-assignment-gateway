import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ZeroTrust Assignment Gateway API is running'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`ZeroTrust Assignment Gateway API is running on port ${PORT}`);
});

export default app;
