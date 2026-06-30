const axios = require('axios');

async function testResend() {
  const email = 're053174@gmail.com';
  console.log(`\n🔍 Testing resend-verification for: ${email}\n`);

  try {
    const res = await axios.post('http://127.0.0.1:5000/api/auth/resend-verification', { email });
    console.log('✅ Response:', res.data);
  } catch (err) {
    console.error('❌ Error:', err.response?.status, err.response?.data || err.message);
  }
}

testResend();
