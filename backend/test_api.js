const axios = require('axios');

async function testApi() {
  try {
    // 1. Login
    const loginRes = await axios.post('http://127.0.0.1:5000/api/auth/login', {
      email: 'melwheshiy@gmail.com',
      password: 'Mariam12345'
    });
    
    const token = loginRes.data.access_token || loginRes.data.token || loginRes.data.data?.token || loginRes.data.data?.access_token;
    console.log("Login token acquired.");
    
    // 2. Test test-run
    try {
      const runRes = await axios.post('http://127.0.0.1:5000/api/notifications/test-run', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("test-run success:", runRes.data);
    } catch (err) {
      console.error("test-run failed with status:", err.response?.status);
      console.error("test-run error data:", err.response?.data);
    }
  } catch (err) {
    console.error("Login failed:", err.response?.data || err.message);
  }
}

testApi();
