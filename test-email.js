const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendTestEmail() {
  try {
    let info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: "lopezb.jl@gmail.com",
      subject: "Test Email from Lucero",
      text: "If you received this, your SMTP setup is working!",
    });

    console.log("✅ Email sent:", info.response);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
}

sendTestEmail();
