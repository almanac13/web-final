const path = require("path");
const dotenv = require("dotenv");

// Loads .env from project root
dotenv.config({ path: path.join(process.cwd(), ".env") });

function mustGet(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,
  MONGO_URI: mustGet("MONGO_URI"),
};
