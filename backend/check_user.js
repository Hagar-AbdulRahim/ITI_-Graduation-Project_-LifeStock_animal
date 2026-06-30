const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/user');

async function checkUser() {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({ is_email_verified: false }).select('+email_verification_sent_at').sort({ created_at: -1 }).limit(3);
  console.log("Latest unverified users:");
  for (let u of users) {
    console.log(`Email: ${u.email}, SentAt: ${u.email_verification_sent_at}, CreatedAt: ${u.created_at}`);
  }
  await mongoose.disconnect();
}
checkUser();
