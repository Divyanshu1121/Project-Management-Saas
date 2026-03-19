const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST || 'sandbox.smtp.mailtrap.io',
        port: process.env.MAIL_PORT || 2525,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    const mailOptions = {
        from: `Project Management <${process.env.MAIL_FROM || 'noreply@yourapp.com'}>`,
        to: options.email,
        subject: options.subject,
        html: options.html
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
