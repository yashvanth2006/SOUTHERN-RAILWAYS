import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import dns from 'dns';
import dotenv from 'dotenv';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config({ path: '../.env' });

async function runLatencyTest() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB to fetch test user.");

  const User = mongoose.connection.collection('users');
  const superAdmin = await User.findOne({ role: { $in: ['MASTER_ADMIN', 'SUPER_ADMIN'] }, status: 'ACTIVE' });
  
  if (!superAdmin) {
    console.error("Need admin for testing.");
    process.exit(1);
  }

  const token = jwt.sign({ id: superAdmin._id.toString(), role: superAdmin.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const gateway = axios.create({ baseURL: 'http://localhost:3000', validateStatus: () => true });
  const monolith = axios.create({ baseURL: 'http://localhost:3001', validateStatus: () => true });

  const NUM_REQUESTS = 50;
  const endpoint = '/abnormalities';
  const headers = { Authorization: `Bearer ${token}` };

  console.log(`\n--- Measuring Latency on ${endpoint} (${NUM_REQUESTS} requests) ---`);

  // Warmup
  await gateway.get(endpoint, { headers });
  await monolith.get(endpoint, { headers });

  // Monolith
  let monolithTotal = 0;
  for (let i = 0; i < NUM_REQUESTS; i++) {
    const start = process.hrtime();
    await monolith.get(endpoint, { headers });
    const diff = process.hrtime(start);
    monolithTotal += (diff[0] * 1000 + diff[1] / 1e6);
  }
  const monolithAvg = monolithTotal / NUM_REQUESTS;
  console.log(`[Monolith] Avg: ${monolithAvg.toFixed(2)} ms`);

  // Gateway (Includes Proxy Hop + Identity Service Auth Hop)
  let gatewayTotal = 0;
  for (let i = 0; i < NUM_REQUESTS; i++) {
    const start = process.hrtime();
    await gateway.get(endpoint, { headers });
    const diff = process.hrtime(start);
    gatewayTotal += (diff[0] * 1000 + diff[1] / 1e6);
  }
  const gatewayAvg = gatewayTotal / NUM_REQUESTS;
  console.log(`[Gateway -> Microservice -> Identity Auth Hop] Avg: ${gatewayAvg.toFixed(2)} ms`);

  console.log(`\n-> Additional Latency introduced by Microservice Architecture: ${(gatewayAvg - monolithAvg).toFixed(2)} ms per request`);

  process.exit(0);
}

runLatencyTest();
