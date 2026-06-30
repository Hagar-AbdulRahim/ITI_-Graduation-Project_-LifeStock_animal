const nodemailer = require("nodemailer");
require("dotenv").config();

async function testEmail() {
  console.log("📧 Sending test email to re053174@gmail.com ...");
  console.log("FROM:", process.env.EMAIL_USER);
  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"LivestockCare AI" <${process.env.EMAIL_USER}>`,
      to: "re053174@gmail.com",
      subject: "🔔 اختبار - تفعيل الحساب في LivestockCare",
      html: `
        <div style="font-family: Arial; direction: rtl; padding: 20px;">
          <h2>✅ وصلك الإيميل!</h2>
          <p>الإيميل ده تأكيد إن نظام الإرسال شغال صح.</p>
          <p>لو بتشوفه في الـ Spam، اضغط "ليس بريداً غير مرغوب فيه" أو "Not Spam"</p>
        </div>
      `,
    });
    console.log("✅ Email sent! Message ID:", info.messageId);
    console.log("📬 Accepted by:", info.accepted);
    console.log("❌ Rejected:", info.rejected);
  } catch (error) {
    console.error("❌ FAILED:", error.message);
  }
}

testEmail();
