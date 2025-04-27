const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Book = require('../models/Book');

class PDFService {
  static async generateReceipt(loan) {
    try {
      const doc = new PDFDocument();
      const user = await User.findById(loan.user);
      const book = await Book.findById(loan.book);
      
      if (!user || !book) {
        throw new Error('User or book not found');
      }

      // Create a unique filename
      const filename = `receipt_${loan._id}_${Date.now()}.pdf`;
      const filepath = path.join(__dirname, '../public/receipts', filename);
      
      // Ensure directory exists
      const dir = path.dirname(filepath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Pipe the PDF to a file
      const writeStream = fs.createWriteStream(filepath);
      doc.pipe(writeStream);

      // Add content
      doc.fontSize(20).text('Payment Receipt', { align: 'center' });
      doc.moveDown();
      
      // Library Info
      doc.fontSize(12).text('Smart Library Management System', { align: 'center' });
      doc.text('123 Library Street, City, Country', { align: 'center' });
      doc.text('Phone: +1234567890 | Email: library@example.com', { align: 'center' });
      doc.moveDown();

      // Receipt Details
      doc.fontSize(14).text('Receipt Details');
      doc.fontSize(12);
      doc.text(`Receipt Number: ${loan._id}`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      // User Details
      doc.fontSize(14).text('User Information');
      doc.fontSize(12);
      doc.text(`Name: ${user.firstName} ${user.lastName}`);
      doc.text(`Email: ${user.email}`);
      if (user.phoneNumber) doc.text(`Phone: ${user.phoneNumber}`);
      doc.moveDown();

      // Payment Details
      doc.fontSize(14).text('Payment Information');
      doc.fontSize(12);
      doc.text(`Book: ${book.title}`);
      doc.text(`Author: ${book.author}`);
      doc.text(`Payment Method: ${loan.fine.paymentMethod}`);
      doc.text(`Amount: ${loan.fine.amount} BDT`);
      doc.text(`Payment Date: ${loan.fine.paymentDate.toLocaleDateString()}`);
      doc.moveDown();

      // Terms and Conditions
      doc.fontSize(10).text('Terms and Conditions:', { underline: true });
      doc.fontSize(8).text('1. This receipt is proof of payment for library fines.');
      doc.text('2. Please keep this receipt for your records.');
      doc.text('3. For any queries, please contact the library administration.');
      doc.moveDown();

      // Signature
      doc.moveDown();
      doc.text('________________________', { align: 'right' });
      doc.text('Library Administration', { align: 'right' });

      // Finalize the PDF
      doc.end();

      // Wait for the write stream to finish
      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      return {
        filename,
        filepath
      };
    } catch (error) {
      console.error('Error generating receipt:', error);
      throw new Error('Failed to generate receipt: ' + error.message);
    }
  }

  static async generateInvoice(loan) {
    try {
      const doc = new PDFDocument();
      const user = await User.findById(loan.user);
      const book = await Book.findById(loan.book);
      
      if (!user || !book) {
        throw new Error('User or book not found');
      }

      // Create a unique filename
      const filename = `invoice_${loan._id}_${Date.now()}.pdf`;
      const filepath = path.join(__dirname, '../public/invoices', filename);
      
      // Ensure directory exists
      const dir = path.dirname(filepath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Pipe the PDF to a file
      const writeStream = fs.createWriteStream(filepath);
      doc.pipe(writeStream);

      // Add content
      doc.fontSize(20).text('Library Fine Invoice', { align: 'center' });
      doc.moveDown();
      
      // Library Info
      doc.fontSize(12).text('Smart Library Management System', { align: 'center' });
      doc.text('123 Library Street, City, Country', { align: 'center' });
      doc.text('Phone: +1234567890 | Email: library@example.com', { align: 'center' });
      doc.moveDown();

      // Invoice Details
      doc.fontSize(14).text('Invoice Details');
      doc.fontSize(12);
      doc.text(`Invoice Number: ${loan._id}`);
      doc.text(`Issue Date: ${new Date().toLocaleDateString()}`);
      doc.text(`Due Date: ${loan.dueDate.toLocaleDateString()}`);
      doc.moveDown();

      // User Details
      doc.fontSize(14).text('Billing Information');
      doc.fontSize(12);
      doc.text(`Name: ${user.firstName} ${user.lastName}`);
      doc.text(`Email: ${user.email}`);
      if (user.phoneNumber) doc.text(`Phone: ${user.phoneNumber}`);
      if (user.address) doc.text(`Address: ${user.address}`);
      doc.moveDown();

      // Fine Details
      doc.fontSize(14).text('Fine Details');
      doc.fontSize(12);
      doc.text(`Book: ${book.title}`);
      doc.text(`Author: ${book.author}`);
      doc.text(`ISBN: ${book.isbn}`);
      doc.text(`Issue Date: ${loan.issueDate.toLocaleDateString()}`);
      doc.text(`Return Date: ${loan.returnDate.toLocaleDateString()}`);
      doc.text(`Days Overdue: ${Math.ceil((loan.returnDate - loan.dueDate) / (1000 * 60 * 60 * 24))}`);
      doc.moveDown();

      // Payment Summary
      doc.fontSize(14).text('Payment Summary');
      doc.fontSize(12);
      doc.text(`Fine Amount: ${loan.fine.amount} BDT`);
      doc.text(`Payment Status: ${loan.fine.status}`);
      if (loan.fine.paymentMethod !== 'none') {
        doc.text(`Payment Method: ${loan.fine.paymentMethod}`);
        doc.text(`Payment Date: ${loan.fine.paymentDate.toLocaleDateString()}`);
      }
      doc.moveDown();

      // Terms and Conditions
      doc.fontSize(10).text('Terms and Conditions:', { underline: true });
      doc.fontSize(8).text('1. This invoice is for library fine payment.');
      doc.text('2. Payment must be made within 7 days of issue.');
      doc.text('3. Late payments may result in account restrictions.');
      doc.text('4. For any queries, please contact the library administration.');
      doc.moveDown();

      // Signature
      doc.moveDown();
      doc.text('________________________', { align: 'right' });
      doc.text('Library Administration', { align: 'right' });

      // Finalize the PDF
      doc.end();

      // Wait for the write stream to finish
      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      return {
        filename,
        filepath
      };
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw new Error('Failed to generate invoice: ' + error.message);
    }
  }
}

module.exports = PDFService; 