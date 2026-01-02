require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const imageRoutes = require("./routes/images");

const app = express();

/* CORS */
app.use(cors({
  origin: "https://save-photo.vercel.app", 
  methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"], // DELETE qo‘shildi
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/images", imageRoutes);


app.listen(process.env.PORT, () => {
  console.log(`Server ${process.env.PORT}-portda ishlayapti`);
});
