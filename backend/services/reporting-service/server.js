import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config({ path: '../../.env', override: true });

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use('/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'Reporting Service is running' });
});

const PORT = process.env.REPORTING_PORT || 3005;
app.listen(PORT, () => {
  console.log(`Reporting Service running on port ${PORT}`);
});
