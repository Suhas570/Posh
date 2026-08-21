const BASE_URL = 'http://localhost:5001';

async function main() {
  console.log('=== TESTING API ENDPOINTS VIA HTTP (NATIVE FETCH) ===');
  
  try {
    // 1. Login
    console.log('Logging in as candidate@test.com...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'candidate@test.com',
        password: 'password'
      })
    });
    
    if (!loginRes.ok) {
      const errText = await loginRes.text();
      console.error(`Login failed: ${loginRes.status} ${errText}`);
      return;
    }

    const loginData = await loginRes.json() as any;
    const { token, user } = loginData;
    console.log(`Login succeeded. Token length: ${token.length}`);
    console.log(`User object:`, user);

    // 2. Query exam-status
    console.log('\nQuerying /api/candidate/exam-status...');
    const statusRes = await fetch(`${BASE_URL}/api/candidate/exam-status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!statusRes.ok) {
      const errText = await statusRes.text();
      console.error(`Status check failed: ${statusRes.status} ${errText}`);
      return;
    }

    const statusData = await statusRes.json();
    console.log('Exam Status Response:');
    console.log(JSON.stringify(statusData, null, 2));
  } catch (err: any) {
    console.error(`Error:`, err.message);
  }
}

main();
