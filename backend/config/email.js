const nodemailer = require("nodemailer");

const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

const verificationEmailHTML = (name, verifyUrl) => `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; direction: rtl; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: #1a6b3a; padding: 32px 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; }
    .header p  { color: #a8d5bc; margin: 6px 0 0; font-size: 14px; }
    .body { padding: 32px 24px; }
    .body p { color: #444444; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
    .btn { display: block; width: fit-content; margin: 24px auto; padding: 14px 36px; background: #1a6b3a; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; text-align: center; }
    .note { font-size: 13px; color: #888888; text-align: center; margin-top: 24px; }
    .footer { background: #f9f9f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #aaaaaa; border-top: 1px solid #eeeeee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🐄 منصة رعايه</h1>
      <p>مرحباً بك في منصتك البيطرية الذكية</p>
    </div>
    <div class="body">
      <p>مرحباً <strong>${name}</strong>،</p>
      <p>شكراً لتسجيلك في منصة صحة المواشي الذكية. لإتمام التسجيل وتفعيل حسابك، يرجى الضغط على الزر أدناه:</p>
      <a href="${verifyUrl}" class="btn">تفعيل الحساب</a>
      <p class="note">هذا الرابط صالح لمدة <strong>10 دقائق</strong> فقط.<br>لو ما طلبتش التسجيل، تجاهل هذا الإيميل.</p>
    </div>
    <div class="footer">
      منصة رعايه الذكية — جميع الحقوق محفوظة
    </div>
  </div>
</body>
</html>
`;

const passwordResetEmailHTML = (name, otp) => `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; direction: rtl; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: #1a6b3a; padding: 32px 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; }
    .header p  { color: #a8d5bc; margin: 6px 0 0; font-size: 14px; }
    .body { padding: 32px 24px; }
    .body p { color: #444444; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
    .otp-box { font-size: 40px; font-weight: bold; letter-spacing: 10px; text-align: center; padding: 24px; background: #f0faf4; border-radius: 8px; color: #1a6b3a; margin: 24px 0; border: 2px dashed #1a6b3a; }
    .note { font-size: 13px; color: #888888; text-align: center; margin-top: 24px; }
    .footer { background: #f9f9f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #aaaaaa; border-top: 1px solid #eeeeee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🐄 منصة رعايه </h1>
      <p>إعادة تعيين كلمة المرور</p>
    </div>
    <div class="body">
      <p>مرحباً <strong>${name}</strong>،</p>
      <p>تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. كود التحقق هو:</p>
      <div class="otp-box">${otp}</div>
      <p class="note">صالح لمدة <strong>60 دقيقه</strong> فقط.<br>لو ما طلبتش تغيير كلمة المرور، تجاهل هذا الإيميل.</p>
    </div>  
    <div class="footer">
      منصة رعايه الذكية — جميع الحقوق محفوظة
    </div>
  </div>
</body>
</html>
`;

const sendVerificationEmail = async (user, rawToken) => {
  const verifyUrl   = `${process.env.FRONTEND_URL}/verify-email?token=${rawToken}`;
  const transporter = createTransporter();
  
  console.log(`[Email] Attempting to send verification email to: ${user.email}`);
  const info = await transporter.sendMail({
    from:    `"منصة رعايه" <${process.env.EMAIL_USER}>`,
    to:      user.email,
    subject: "تفعيل حسابك في منصة رعايه 🐄",
    html:    verificationEmailHTML(user.name, verifyUrl),
  });
  console.log(`[Email] Success! Message ID: ${info.messageId}`);
};

const sendPasswordResetOtp = async (user, otp) => {
  const transporter = createTransporter(); 
  await transporter.sendMail({
    from:    `"منصة رعايه" <${process.env.EMAIL_USER}>`,
    to:      user.email,
    subject: "كود إعادة تعيين كلمة المرور 🔐",
    html:    passwordResetEmailHTML(user.name, otp),
  });
};

const contactUsEmailHTML = (name, email, subject, message) => `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; direction: rtl; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: #1b4d2c; padding: 24px; text-align: right; color: white; }
    .header h1 { margin: 0; font-size: 20px; }
    .body { padding: 32px 24px; color: #444; font-size: 15px; line-height: 1.6; }
    .detail { margin-bottom: 15px; }
    .detail strong { color: #1b4d2c; display: inline-block; width: 120px; }
    .message-box { background: #f9f9f9; border-right: 4px solid #1b4d2c; padding: 15px; margin-top: 20px; border-radius: 4px; white-space: pre-wrap; }
    .footer { background: #f9f9f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>رسالة جديده من منصة رعاية 📩</h1>
    </div>
    <div class="body">
      <p>يوجد رسالة جديدة تم إرسالها عبر نموذج الاتصال في الموقع:</p>
      
      <div class="detail"><strong>اسم المرسل:</strong> ${name}</div>
      <div class="detail"><strong>البريد الإلكتروني:</strong> <span dir="ltr">${email}</span></div>
      <div class="detail"><strong>الموضوع:</strong> ${subject}</div>
      
      <div class="message-box">${message}</div>
    </div>
    <div class="footer">
      هذا إيميل تلقائي من نظام منصة رعايه
    </div>
  </div>
</body>
</html>
`;

const sendContactUsEmail = async (contactData) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"رسائل المنصة" <${process.env.EMAIL_USER}>`,
    to: "sahmah227@gmail.com",
    subject: `رسالة جديده من منصة رعاية`,
    html: contactUsEmailHTML(contactData.name, contactData.email, contactData.subject, contactData.message),
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetOtp, sendContactUsEmail };