import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import dns from 'dns';
import dotenv from 'dotenv';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config({ path: '../.env' });

async function runMatrixTest() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB to fetch test users.");

  const User = mongoose.connection.collection('users');
  
  const driver = await User.findOne({ role: 'DRIVER', status: 'ACTIVE' });
  const superAdmin = await User.findOne({ role: { $in: ['MASTER_ADMIN', 'SUPER_ADMIN'] }, status: 'ACTIVE' });

  if (!driver || !superAdmin) {
    const allUsers = await User.find({}).limit(5).toArray();
    console.error("Could not find required users. Sample users:", allUsers.map(u => ({role: u.role, status: u.status})));
    process.exit(1);
  }

  const driverToken = jwt.sign({ id: driver._id.toString(), role: driver.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const adminToken = jwt.sign({ id: superAdmin._id.toString(), role: superAdmin.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const api = axios.create({
    baseURL: 'http://localhost:3000',
    validateStatus: () => true // Resolve all statuses
  });

  console.log("\n--- Executing Negative Authorization Matrix across Network Boundary ---");

  // 1. DRIVER calls /abnormalities/my (Compliance Service) -> Should be 200
  const res1 = await api.get('/abnormalities/my', { headers: { Authorization: `Bearer ${driverToken}` } });
  console.log(`[DRIVER -> GET /abnormalities/my] Status: ${res1.status} (Expected: 200) - ${res1.status === 200 ? '✅ PASSED' : '❌ FAILED'} - Body: ${JSON.stringify(res1.data)}`);

  // 2. DRIVER calls POST /abnormalities (Compliance Service) -> Should be 201 or 400 (allowed)
  const res2 = await api.post('/abnormalities', {}, { headers: { Authorization: `Bearer ${driverToken}` } });
  const success2 = [201, 400].includes(res2.status);
  console.log(`[DRIVER -> POST /abnormalities] Status: ${res2.status} (Expected: NOT 403) - ${success2 ? '✅ PASSED' : '❌ FAILED'} - Body: ${JSON.stringify(res2.data)}`);

  // 3. ADMIN calls GET /abnormalities (Compliance Service) -> Should be 200 (allowed)
  const res3 = await api.get('/abnormalities', { headers: { Authorization: `Bearer ${adminToken}` } });
  console.log(`[ADMIN -> GET /abnormalities] Status: ${res3.status} (Expected: 200) - ${res3.status === 200 ? '✅ PASSED' : '❌ FAILED'} - Body: ${JSON.stringify(res3.data)}`);

  // 4. ADMIN calls POST /abnormalities (Compliance Service) -> Should be 403 (allowRoles blocks ADMIN from submitting)
  const res4 = await api.post('/abnormalities', {}, { headers: { Authorization: `Bearer ${adminToken}` } });
  console.log(`[ADMIN -> POST /abnormalities] Status: ${res4.status} (Expected: 403) - ${res4.status === 403 ? '✅ PASSED' : '❌ FAILED'} - Body: ${JSON.stringify(res4.data)}`);

  // 5. ADMIN calls DELETE /engine/123 (Operations Service) -> Should be 404 or 400 (allowed, but engine not found/invalid)
  const res5 = await api.delete('/engine/123', { headers: { Authorization: `Bearer ${adminToken}` } });
  const success5 = [404, 400, 500].includes(res5.status); // allowed to reach controller
  console.log(`[ADMIN -> DELETE /engine] Status: ${res5.status} (Expected: NOT 403) - ${success5 ? '✅ PASSED' : '❌ FAILED'} - Body: ${JSON.stringify(res5.data)}`);

  console.log("\nMatrix test complete.");
  process.exit(0);
}

runMatrixTest();
