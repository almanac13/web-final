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
const eventsRoutes = require("./routes/events.routes");

// ADD THESE TWO
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Absolute path to public
const publicDir = path.resolve(__dirname, "..", "public");
app.use(express.static(publicDir));

//Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// Routes
app.use("/auth", authRoutes);
app.use("/", authRoutes); // allows /register and /login directly

app.use("/users", userRoutes);
app.use("/clubs", clubRoutes);
app.use("/dev", devRoutes);
app.use("/key-requests", keyRequestRoutes);
app.use("/admin", adminRoutes);
app.use("/public", publicRoutes);
app.use("/join", joinRoutes);
app.use("/my", myRoutes);
app.use("/", eventsRoutes);

//  MUST BE LAST (after all routes)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
