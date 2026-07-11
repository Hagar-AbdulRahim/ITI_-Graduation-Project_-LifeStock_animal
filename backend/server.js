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
const vaccineAdvisorRoutes = require("./routes/VaccineAdvisor.routes");
const healthCaseRoutes  = require("./routes/Healthcase.routes");
const onboardingRoutes  = require("./routes/onboarding.routes");

const { startVaccinationReminderJob } = require("./Cron_vaccinationreminder");
const notificationRoutes = require("./routes/notification.routes");
const adminRoutes        = require("./routes/Admin.routes");
const { startOutbreakDetectionJob } = require("./Cron_outbreakdetection");
const clinicsRoutes = require("./routes/Clinics.routes");
const reviewRoutes  = require("./routes/Review.routes");
const contactRoutes = require("./routes/contact.routes");
const outbreakRoutes = require("./routes/Outbreak.routes");

const app = express();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  
    startVaccinationReminderJob();
    startOutbreakDetectionJob();
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
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:3000",
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
app.use("/api/vaccine-advisor", vaccineAdvisorRoutes);
app.use("/api/health-cases", healthCaseRoutes);
app.use("/api/onboarding",   onboardingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin",         adminRoutes);
app.use("/api/veterinary", require("./routes/veterinary.routes"));
app.use("/api/clinics", clinicsRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/outbreaks", outbreakRoutes);
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});