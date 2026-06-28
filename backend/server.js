require("dotenv").config();
const express      = require("express");
const mongoose     = require("mongoose");
const cors         = require("cors");
const cookieParser = require("cookie-parser");
const path         = require("path");

const authRoutes        = require("./routes/Auth.routes");
const userRoutes        = require("./routes/User.routes");
const farmRoutes        = require("./routes/Farm.routes");
const animalRoutes      = require("./routes/Animal.routes");
const vaccinationRoutes = require("./routes/Vaccination.routes");
const healthCaseRoutes  = require("./routes/Healthcase.routes");
const onboardingRoutes  = require("./routes/onboarding.routes");

const { startVaccinationReminderJob } = require("./Cron_vaccinationreminder");
const notificationRoutes = require("./routes/notification.routes");
const app = express();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  
    startVaccinationReminderJob();
  })
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
  credentials:    true,
  methods:        ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth",        authRoutes);
app.use("/api/users",       userRoutes);
app.use("/api/farms",       farmRoutes);
app.use("/api/animals",     animalRoutes);
app.use("/api/vaccinations", vaccinationRoutes);
app.use("/api/health-cases", healthCaseRoutes);
app.use("/api/onboarding",   onboardingRoutes);
app.use("/api/notifications", notificationRoutes);
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});