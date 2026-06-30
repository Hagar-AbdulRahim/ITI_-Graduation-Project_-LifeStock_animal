const mongoose = require('mongoose');
require('dotenv').config();
const Notification = require('./models/notification');
const User = require('./models/user');

async function checkNotifications() {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({}, 'name email role');
  console.log(`Found ${users.length} users.`);

  for (const u of users) {
    const count = await Notification.countDocuments({ user_id: u._id });
    console.log(`User: ${u.name} (${u.email}) - Role: ${u.role} -> Notifications: ${count}`);
  }
  await mongoose.disconnect();
}

checkNotifications();
