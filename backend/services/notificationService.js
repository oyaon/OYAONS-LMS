const nodemailer = require('nodemailer');
const twilio = require('twilio');
const User = require('../models/User');
const Book = require('../models/Book');

// Email configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Twilio configuration
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

class NotificationService {
  static async sendEmail(userId, subject, message) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.preferences.notifications.email) return;

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject,
        html: message
      });
    } catch (error) {
      console.error('Email notification error:', error);
    }
  }

  static async sendSMS(userId, message) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.phoneNumber || !user.preferences.notifications.push) return;

      await twilioClient.messages.create({
        body: message,
        to: user.phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER
      });
    } catch (error) {
      console.error('SMS notification error:', error);
    }
  }

  static async notifyLoanDue(loan) {
    const user = await User.findById(loan.user);
    const book = await Book.findById(loan.book);

    const emailSubject = 'Book Return Reminder';
    const emailMessage = `
      <h2>Book Return Reminder</h2>
      <p>Dear ${user.firstName},</p>
      <p>This is a reminder that your book "${book.title}" is due on ${loan.dueDate.toLocaleDateString()}.</p>
      <p>Please return it on time to avoid fines.</p>
    `;

    const smsMessage = `Reminder: Your book "${book.title}" is due on ${loan.dueDate.toLocaleDateString()}.`;

    await this.sendEmail(loan.user, emailSubject, emailMessage);
    await this.sendSMS(loan.user, smsMessage);
  }

  static async notifyFine(loan) {
    const user = await User.findById(loan.user);
    const book = await Book.findById(loan.book);

    const emailSubject = 'Overdue Book Fine';
    const emailMessage = `
      <h2>Overdue Book Fine</h2>
      <p>Dear ${user.firstName},</p>
      <p>Your book "${book.title}" is overdue.</p>
      <p>Fine amount: ${loan.fine.amount} BDT</p>
      <p>Please pay the fine to avoid account restrictions.</p>
    `;

    const smsMessage = `Fine Alert: ${loan.fine.amount} BDT for overdue book "${book.title}".`;

    await this.sendEmail(loan.user, emailSubject, emailMessage);
    await this.sendSMS(loan.user, smsMessage);
  }

  static async notifyPayment(loan) {
    const user = await User.findById(loan.user);
    const book = await Book.findById(loan.book);

    const emailSubject = 'Payment Confirmation';
    const emailMessage = `
      <h2>Payment Confirmation</h2>
      <p>Dear ${user.firstName},</p>
      <p>Your payment of ${loan.fine.amount} BDT for the book "${book.title}" has been received.</p>
      <p>Thank you for your payment.</p>
    `;

    const smsMessage = `Payment Confirmed: ${loan.fine.amount} BDT for "${book.title}".`;

    await this.sendEmail(loan.user, emailSubject, emailMessage);
    await this.sendSMS(loan.user, smsMessage);
  }
}

module.exports = NotificationService; 