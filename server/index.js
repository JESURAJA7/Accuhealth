import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
dotenv.config();

import sequelize from "./config/db_sequelize.js";

// Sync Sequelize models
sequelize
  .sync({ alter: true }) // Set alter: true if you want to update tables on schema change, but be careful in production
  .then(() => {
    console.log("✅ MySQL Database Connected..");
  })
  .catch((err) => {
    console.error("Failed to sync MySQL database:", err);
  });

import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import masterRoutes from "./routes/masterRoutes.js";
import vaccinationRoutes from "./routes/vaccination.js";
// Updated route imports
import tbRoutes from "./routes/tbRoutes.js";
import ariRoutes from "./routes/ariRoutes.js";
import polioRoutes from "./routes/polioRoutes.js";
import hemorrhagicRoutes from "./routes/hemorrhagicRoutes.js";
import feverRashRoutes from "./routes/feverRashRoutes.js";

import hevRoutes from "./routes/hevRoutes.js"; // Generic HEV if used
import havRoutes from "./routes/havRoutes.js";
import hbvRoutes from "./routes/hbvRoutes.js";
import hcvRoutes from "./routes/hcvRoutes.js";
const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: ["http://localhost:5173", "https://accuhealth.netlify.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  }),
);
app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/masters", masterRoutes);
app.use("/api/vaccination", vaccinationRoutes);
app.use("/api/tb", tbRoutes);
app.use("/api/ari", ariRoutes);
app.use("/api/polio", polioRoutes);
app.use("/api/hemorrhagic", hemorrhagicRoutes);
app.use("/api/fever-rash", feverRashRoutes);

app.use("/api/hev-notifications", hevRoutes);
app.use("/api/hav-notifications", havRoutes);
app.use("/api/hbv-notifications", hbvRoutes);
app.use("/api/hcv-notifications", hcvRoutes);

app.use(
  fileUpload({
    createParentPath: true,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
  }),
);

//health
app.use("/api/health", (req, res) => {
  res.json({ message: "Health is good" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
