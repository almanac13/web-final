require("dotenv").config();
const { sendMail } = require("./utils/mailer");

(async () => {
  try {
    await sendMail(
      process.env.SENDGRID_FROM_EMAIL,
      "SendGrid test",
      "Email works ✅"
    );
    console.log("✅ Email sent!");
  } catch (e) {
    console.error("❌ Email error:", e.response?.body || e.message);
  }
})();
