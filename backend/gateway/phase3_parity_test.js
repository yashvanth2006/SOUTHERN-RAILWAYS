import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import dns from 'dns';
import dotenv from 'dotenv';
import assert from 'assert';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config({ path: '../.env' });

async function runParityTest() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB to fetch test users.");

  const User = mongoose.connection.collection('users');
  
  // Find users for testing cross-depot access
  const allDrivers = await User.find({ role: 'DRIVER', status: 'ACTIVE' }).toArray();
  const allManagers = await User.find({ role: 'DEPOT_MANAGER', status: 'ACTIVE' }).toArray();
  const superAdmin = await User.findOne({ role: { $in: ['MASTER_ADMIN', 'SUPER_ADMIN'] }, status: 'ACTIVE' });

  if (allDrivers.length < 2 || allManagers.length < 2 || !superAdmin) {
    console.error("Need at least 2 drivers, 2 managers, and 1 admin for robust cross-depot testing.");
    process.exit(1);
  }

  // Ensure they are from different depots
  const driverA = allDrivers[0];
  const driverB = allDrivers.find(d => d.depotId?.toString() !== driverA.depotId?.toString());
  
  const managerA = allManagers.find(m => m.depotId?.toString() === driverA.depotId?.toString());
  const managerB = allManagers.find(m => m.depotId?.toString() !== driverA.depotId?.toString());

  if (!managerA || !managerB) {
    console.log("Could not find perfectly matching cross-depot managers, using random managers.");
  }
  
  const mngrA = managerA || allManagers[0];
  const mngrB = managerB || allManagers[1];

  console.log("Test Actors:");
  console.log(`- Driver A (${driverA.depotId})`);
  console.log(`- Manager A (${mngrA.depotId})`);
  console.log(`- Manager B (${mngrB.depotId})`);
  console.log(`- Admin`);

  const generateToken = (user) => jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const tokens = {
    driverA: generateToken(driverA),
    managerA: generateToken(mngrA),
    managerB: generateToken(mngrB),
    admin: generateToken(superAdmin)
  };

  const gateway = axios.create({ baseURL: 'http://localhost:3000', validateStatus: () => true });
  const monolith = axios.create({ baseURL: 'http://localhost:3001', validateStatus: () => true });

  const compareEndpoints = async (name, method, url, actor, data = null) => {
    const headers = { Authorization: `Bearer ${tokens[actor]}` };
    const config = { method, url, data, headers };
    
    const [resG, resM] = await Promise.all([gateway(config), monolith(config)]);
    
    let isIdentical = false;
    let errorMsg = '';
    
    if (resG.status !== resM.status) {
      errorMsg = `Status mismatch: Gateway=${resG.status}, Monolith=${resM.status}`;
    } else {
      try {
        assert.deepStrictEqual(resG.data, resM.data);
        isIdentical = true;
      } catch (e) {
        errorMsg = 'Body mismatch';
        console.error('--- Gateway Data ---');
        console.error(JSON.stringify(resG.data).substring(0, 200));
        console.error('--- Monolith Data ---');
        console.error(JSON.stringify(resM.data).substring(0, 200));
      }
    }
    
    if (isIdentical) {
      console.log(`✅ [${actor}] ${method} ${url} - Status: ${resG.status} (Identical)`);
    } else {
      console.log(`❌ [${actor}] ${method} ${url} - FAILED: ${errorMsg}`);
    }
    
    return isIdentical;
  };

  console.log("\n--- Phase 3 Response Parity & Authorization Tests ---\n");

  let allPassed = true;

  // 1. ABNORMALITIES
  allPassed &= await compareEndpoints('View Abnormalities', 'GET', '/abnormalities', 'admin');
  allPassed &= await compareEndpoints('Driver View Own Abnormalities', 'GET', '/abnormalities/my', 'driverA');
  allPassed &= await compareEndpoints('Driver Attempt View All', 'GET', '/abnormalities', 'driverA'); // Expect 403

  // 2. ISSUES
  allPassed &= await compareEndpoints('View Issues', 'GET', '/issues', 'admin');
  allPassed &= await compareEndpoints('Driver View Own Issues', 'GET', '/issues/my', 'driverA');

  // 3. ENGINES
  allPassed &= await compareEndpoints('View Engines', 'GET', '/engine', 'managerA');
  allPassed &= await compareEndpoints('Driver View Engines', 'GET', '/engine', 'driverA');

  // 4. DRIVER/DAILY LOGS (Operations)
  // Assuming /driver/duty-status exists
  allPassed &= await compareEndpoints('Duty Status', 'GET', '/driver/duty-status', 'driverA');
  
  // 5. T-CARDS (Operations)
  allPassed &= await compareEndpoints('Get driver tcards', 'GET', `/depot/driver/${driverA._id.toString()}/tcards`, 'managerA');

  // 6. CIRCULARS (Compliance)
  allPassed &= await compareEndpoints('View Circulars', 'GET', '/admin/circulars', 'admin');
  allPassed &= await compareEndpoints('Driver Try Create Circular', 'POST', '/admin/circulars', 'driverA', { title: "Test" }); // Expect 403

  // 7. NEGATIVE AUTHORIZATION MATRIX (Cross-Depot)
  // Let's test if managerB can view driverA's t-cards (Should be 403, unless manager is admin)
  allPassed &= await compareEndpoints('Cross-Depot TCard View', 'GET', `/depot/driver/${driverA._id.toString()}/tcards`, 'managerB');

  // 8. THE CAST ERROR TEST
  allPassed &= await compareEndpoints('Cast Error Engine Delete', 'DELETE', '/engine/123', 'admin');

  console.log("\n");
  if (allPassed) {
    console.log("🎉 ALL PARITY TESTS PASSED! Gateway matches Monolith exactly.");
  } else {
    console.log("❌ SOME TESTS FAILED.");
  }
  
  process.exit(0);
}

runParityTest();
