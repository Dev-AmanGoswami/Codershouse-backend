const crypto = require('crypto');
const hashService = require('./hash-service');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASSWORD
    }
});


class OtpService{
    async generateOtp() {
        const otp = crypto.randomInt(1000,9999);
        return otp;
    }
    async sendByEmail(email,otp) {
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'EchoRoom Authentication',
            text: `Dear User,\n\nYour One-Time Password (OTP) for EchoRoom authentication is:\n\n${otp}\n\nThis OTP is valid for the next 2 minutes. Please do not share this code with anyone.\n\nIf you did not request this OTP, please contact our support team immediately at echoroom.support@gmail.com.\n\nThank you for choosing EchoRoom!\n\nBest regards,\nThe EchoRoom Team`
        }
        return await transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
        });
    }
    
    verifyOtp(hashedOtp, data) {
        let computedHash = hashService.hashOtp(data);
        return computedHash === hashedOtp;
    }
}

module.exports = new OtpService();