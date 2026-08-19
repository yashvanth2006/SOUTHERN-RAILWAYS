import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import abnormalityRoutes from './routes/abnormalityRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import adminCircularRoutes from './routes/adminCircularRoutes.js';

dotenv.config({ path: '../../.env', override: true });

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use('/abnormalities', abnormalityRoutes);
app.use('/issues', issueRoutes);
app.use('/admin', adminCircularRoutes);

const PORT = process.env.COMPLIANCE_PORT || 3004;
app.listen(PORT, () => {
  console.log(`Compliance Service running on port ${PORT}`);
});
