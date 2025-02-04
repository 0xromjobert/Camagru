const nodemailer = require('nodemailer');

//create and cnfigure the transporter
const transporter = nodemailer.createTransport({
    host: 'mail.privateemail.com', // Replace with your SMTP host
    port: 587, // Use 465 for SSL or 587 for STARTTLS
    secure: false, // Use true for SSL (port 465)
    auth: {
      user: process.env.EMAIL_USER, // Email address
      pass: process.env.EMAIL_PASS, // Email password
    },
  });
  
// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
      console.error('SMTP Transporter Error:', error);
    } else {
      console.log('SMTP Transporter Ready:', success);
    }
  });
  
  // Export the transporter for use in other files

// Helper function to send emails
const sendEmail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: `"Camagru rjobert" <${process.env.EMAIL_USER}>`, // Sender's (US) email
      to, // Recipient's email
      subject, // Email subject
      text, // Plain text version of the email
      ...(html && { html }), // Optional HTML version of the email
    };

    const info = await transporter.sendMail(mailOptions);
    return info; // Return info for logging or further use
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Throw error to handle in the calling function
  }
};

module.exports = { sendEmail };
