import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, text }) => {
  // Configure transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Send mail
  await transporter.sendMail({
    from: `"TravelMate" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
  });
};

export default sendEmail;