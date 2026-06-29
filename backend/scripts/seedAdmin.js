require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const email = "admin@livestock.ai";
    const password = process.env.ADMIN_SEED_PASSWORD;

    if (!password) {
      console.error("❌ ADMIN_SEED_PASSWORD env variable is required");
      process.exit(1);
    }

    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.role !== "admin") {
        existing.role = "admin";
        existing.is_email_verified = true;
        await existing.save({ validateBeforeSave: false });
        console.log("✅ Updated existing user to admin role");
      } else {
        console.log("ℹ️  Admin user already exists");
      }
      process.exit(0);
    }

    await User.create({
      name: "مدير النظام",
      email,
      password,
      governorate: "القاهرة",
      role: "admin",
      is_email_verified: true,
      auth_provider: "local",
    });

    console.log(`✅ Admin seeded: ${email}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
};

seedAdmin();
