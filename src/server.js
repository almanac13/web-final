require("dotenv").config();  // <-- первая строка
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));
  } catch (e) {
    console.error("❌ DB connect error:", e.message);
    process.exit(1);
  }
})();
