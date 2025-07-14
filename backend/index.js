// const express = require("express");
// const cors = require("cors");
// const app = express();
// const analyzeRoute = require("./routes/analyzeRoute");

// app.use(cors());
// app.use(express.json());
// app.use("/api", analyzeRoute);

// const PORT = 5001;
// app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));


require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const analyzeRoutes = require("./routes/analyzeRoute"); // Ensure this route is defined

const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

app.use("/auth", authRoutes);
app.use("/api", analyzeRoutes); // Use the analyze route

app.get("/", (req, res) => {
  res.send("🚀 Backend Running...");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));



// const express = require('express');
// const connectDB = require('./config/db');
// const analyzeRoutes = require('./routes/analyze');
// const cors = require('cors');
// const authRoutes = require("./routes/auth");

// const app = express();
// connectDB();

// app.use(cors({ origin: "http://localhost:5173", credentials: true }));
// app.use(express.json());
// app.use('/api', analyzeRoutes); // expose /api/analyze
// app.use("/auth", authRoutes);
// const PORT = process.env.PORT || 5001;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
