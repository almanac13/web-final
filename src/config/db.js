const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is missing in .env");

  // покажем только начало, чтобы не светить пароль
  console.log("DEBUG URI starts with:", uri.slice(0, 20));

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log("MongoDB connected");
}

module.exports = connectDB;
