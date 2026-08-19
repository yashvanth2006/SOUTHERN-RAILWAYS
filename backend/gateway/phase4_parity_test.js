import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import dns from 'dns';
import dotenv from 'dotenv';
import assert from 'assert';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config({ path: '../.env' });

async function runPhase4ParityTest() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB to fetch test users.");

  const User = mongoose.connection.collection('users');
  
  const superAdmin = await User.findOne({ role: { $in: ['MASTER_ADMIN', 'SUPER_ADMIN'] }, status: 'ACTIVE' });
  const manager = await User.findOne({ role: 'DEPOT_MANAGER', status: 'ACTIVE' });
  const adee = await User.findOne({ role: 'ADEE', status: 'ACTIVE' });

  if (!superAdmin || !manager || !adee) {
    console.error("Need admin, manager, and adee for testing reporting service.");
    process.exit(1);
  }

  const generateToken = (user) => jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const tokens = {
    admin: generateToken(superAdmin),
    manager: generateToken(manager),
    adee: generateToken(adee)
  };

  const gateway = axios.create({ baseURL: 'http://localhost:3000', validateStatus: () => true });
  const monolith = axios.create({ baseURL: 'http://localhost:3001', validateStatus: () => true });

  const compareEndpoints = async (name, method, url, actor, responseType = 'json') => {
    const headers = { Authorization: `Bearer ${tokens[actor]}` };
    const config = { method, url, headers, responseType };
    
    const [resG, resM] = await Promise.all([gateway(config), monolith(config)]);
    
    let isIdentical = false;
    let errorMsg = '';
    
    if (resG.status !== resM.status) {
      errorMsg = `Status mismatch: Gateway=${resG.status}, Monolith=${resM.status}`;
    } else {
      if (responseType === 'json') {
        try {
          assert.deepStrictEqual(resG.data, resM.data);
          isIdentical = true;
        } catch (e) {
          errorMsg = 'Body mismatch';
        }
      } else {
        // Blob/ArrayBuffer comparison
        if (Buffer.from(resG.data).equals(Buffer.from(resM.data))) {
          isIdentical = true;
        } else {
          errorMsg = 'File data mismatch';
        }
      }
    }
    
    if (isIdentical) {
      console.log(`✅ [${actor}] ${method} ${url} - Status: ${resG.status} (Identical) ${resG.status === 500 ? JSON.stringify(resG.data) : ''}`);
    } else {
      console.log(`❌ [${actor}] ${method} ${url} - FAILED: ${errorMsg}`);
    }
    
    return isIdentical;
  };

  console.log("\n--- Phase 4 Response Parity & Authorization Tests ---\n");
  let allPassed = true;

  // 1. ADMIN REPORTS
  allPassed &= await compareEndpoints('Admin Get Reports', 'GET', '/admin/reports', 'admin');
  
  // 2. OVERDUE RECORDS
  allPassed &= await compareEndpoints('Admin Get Overdue Records', 'GET', '/admin/overdue-records', 'admin');
  allPassed &= await compareEndpoints('Manager Get Overdue Records', 'GET', '/admin/overdue-records', 'manager'); // Manager has access to this

  // 3. EXPORT EXCEL
  allPassed &= await compareEndpoints('Admin Download Excel', 'GET', '/admin/reports/download', 'admin', 'arraybuffer');

  // 4. NEGATIVE AUTH TEST
  allPassed &= await compareEndpoints('Manager Attempt Admin Reports', 'GET', '/admin/reports', 'manager'); // Should be 403

  console.log("\n");
  if (allPassed) {
    console.log("🎉 ALL PARITY TESTS PASSED! Reporting Service matches Monolith exactly.");
  } else {
    console.log("❌ SOME TESTS FAILED.");
  }
  
  process.exit(0);
}

runPhase4ParityTest();
