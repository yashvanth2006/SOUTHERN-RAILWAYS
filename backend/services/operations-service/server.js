import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import driverRoutes from './routes/driverRoutes.js';
import engineRoutes from './routes/engineRoutes.js';
import depotRoutes from './routes/depotRoutes.js';

dotenv.config({ path: '../../.env', override: true });

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use('/driver', driverRoutes);
app.use('/engine', engineRoutes);
app.use('/depot', depotRoutes);

const PORT = process.env.OPERATIONS_PORT || 3003;
app.listen(PORT, () => {
  console.log(`Operations Service running on port ${PORT}`);
});
