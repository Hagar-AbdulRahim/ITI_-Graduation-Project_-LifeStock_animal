require("dotenv").config();
const { sendContactUsEmail } = require("./config/email");

const test = async () => {
  try {
    await sendContactUsEmail({
      name: "Test User",
      email: "test@example.com",
      subject: "Test Subject",
      message: "This is a test message to verify nodemailer."
    });
    console.log("Email sent successfully!");
  } catch (err) {
    console.error("Failed to send email:", err);
  }
};

test();
