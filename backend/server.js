const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/Auth.routes");
const userRoutes = require("./routes/user.routes");
const { OAuth2Client } = require('google-auth-library');
const cookieParser = require('cookie-parser');
const app = express();
require("dotenv").config();
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:3000",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(cookieParser());

// روتات التطبيق: هنا روتات المصادقة وعمليات المستخدم
app.use("/api/auth",  authRoutes);
app.use("/api/users", userRoutes);
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
