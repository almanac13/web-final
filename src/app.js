const express = require("express");
const User = require("./models/user"); // проверь имя файла

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Clubs Hub API is running ✅" });
});

// временный тестовый роут
app.post("/test-user", async (req, res) => {
  const { username, email } = req.body;
  const user = await User.create({ username, email });
  res.json({ message: "User created", user });
});

module.exports = app;
