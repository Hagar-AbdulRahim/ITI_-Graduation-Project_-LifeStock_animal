const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const Vaccination = require('./models/vaccination');
const User = require('./models/user');
const Notification = require('./models/notification');

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/livestock');
    console.log("Connected");
    
    const today = new Date();
    
    const overdue = await Vaccination.find({
      day_of_reminder_sent: false,
      $or: [
        { vaccine_type: "recurring", next_due_date: { $lte: today } },
        { vaccine_type: "one_time",  scheduled_date: { $lte: today }, completed: false },
      ],
    }).populate({
      path: "animal_id",
      select: "tag_number species farm_id",
      populate: { path: "farm_id", select: "name user_id" },
    });
    
    console.log("Overdue count:", overdue.length);
    
    const debugResults = [];
    for (const v of overdue) {
      const animal = v.animal_id;
      const farm   = animal?.farm_id;
      
      let user = null;
      if (farm && farm.user_id) {
         user = await User.findById(farm.user_id);
      } else if (farm && !farm.user_id) {
         console.log("Farm has no user_id:", farm);
      }
    }
    
    console.log("Done loop");
    process.exit(0);
  } catch (err) {
    console.error("ERROR:", err);
    process.exit(1);
  }
}
test();
