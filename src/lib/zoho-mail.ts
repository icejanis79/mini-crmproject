import nodemailer from 'nodemailer';

export const zohoTransporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.ZOHO_EMAIL, // e.g., 'your_email@zoho.com'
    pass: process.env.ZOHO_PASSWORD, // App Password generated in Zoho
  },
});

export async function sendEmail(to: string, subject: string, text: string, html?: string) {
  try {
    const info = await zohoTransporter.sendMail({
      from: process.env.ZOHO_EMAIL,
      to,
      subject,
      text,
      html,
    });
    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
