const express = require("express");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const clubRoutes = require("./routes/club.routes");
const devRoutes = require("./routes/dev.routes");
const keyRequestRoutes = require("./routes/keyrequest.routes");
const adminRoutes = require("./routes/admin.routes");
const publicRoutes = require("./routes/public.routes");
const joinRoutes = require("./routes/join.routes");
const myRoutes = require("./routes/my.routes");







const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ 1) абсолютный путь к public
const publicDir = path.resolve(__dirname, "..", "public");
app.use(express.static(publicDir));

// ✅ 2) home отдаёт index.html из public
app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/clubs", clubRoutes);
app.use("/dev", devRoutes);
app.use("/key-requests", keyRequestRoutes);
app.use("/admin", adminRoutes);
app.use("/public", publicRoutes);
app.use("/join", joinRoutes);
app.use("/my", myRoutes);

module.exports = app;
