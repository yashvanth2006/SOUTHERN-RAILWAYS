import axios from 'axios';

async function testGatewayProxy() {
  const tests = [
    { name: 'Auth Login', path: '/auth/login', method: 'POST', body: { pfNo: '0000', password: 'wrong' } },
    { name: 'Admin Get Users', path: '/admin/users', method: 'GET' },
    { name: 'Get Depots', path: '/depot', method: 'GET' },
    { name: 'Get Driver Duty Status', path: '/driver/duty-status', method: 'GET' },
    { name: 'Get Driver Active Duty', path: '/driver/active-duty', method: 'GET' },
    { name: 'Get Abnormalities', path: '/abnormalities', method: 'GET' },
    { name: 'Get Issues', path: '/issues', method: 'GET' },
  ];

  const gatewayUrl = 'http://localhost:3000';
  const monolithUrl = 'http://localhost:3001';

  let allPassed = true;

  for (const test of tests) {
    try {
      const configGateway = {
        method: test.method,
        url: `${gatewayUrl}${test.path}`,
        data: test.body,
        validateStatus: () => true
      };
      
      const configMonolith = {
        method: test.method,
        url: `${monolithUrl}${test.path}`,
        data: test.body,
        validateStatus: () => true
      };

      const [resGateway, resMonolith] = await Promise.all([
        axios(configGateway),
        axios(configMonolith)
      ]);

      const statusMatch = resGateway.status === resMonolith.status;
      const dataMatch = JSON.stringify(resGateway.data) === JSON.stringify(resMonolith.data);

      if (statusMatch && dataMatch) {
        console.log(`✅ ${test.name} (${test.path}) - PASSED (Status: ${resGateway.status})`);
      } else {
        console.log(`❌ ${test.name} (${test.path}) - FAILED`);
        console.log(`  Gateway: ${resGateway.status} ${JSON.stringify(resGateway.data).substring(0, 50)}`);
        console.log(`  Monolith: ${resMonolith.status} ${JSON.stringify(resMonolith.data).substring(0, 50)}`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`❌ ${test.name} (${test.path}) - ERROR: ${error.message}`);
      allPassed = false;
    }
  }

  if (allPassed) {
    console.log('\n🎉 All gateway proxy tests passed! Behavior is identical.');
  } else {
    console.log('\n⚠️ Some gateway proxy tests failed.');
  }
}

testGatewayProxy();
