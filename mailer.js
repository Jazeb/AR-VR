const nodemailer = require('nodemailer');
const { MAILER_EMAIL, MAILER_PASSWORD } = process.env; 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: MAILER_EMAIL,
        pass: MAILER_PASSWORD
    }
});

const sendOTPToEmail = data => {
    return new Promise((resolve, reject) => {
        const mailOptions = {
            from: MAILER_EMAIL,
            to: 'jazeb.jazi007@gmail.com',
            subject: 'OTP verification from Americana',
            html: `
                <h2 style="color:black;">Welcome to Americana Heros</h2>
                <a style="text-decoration:none; color:#B9345A;"> <b style="color:#383CC1;" >Your Email veification code is ${data.otp} </b></a><br><br>
                Regards 
                </p>
                `
        };

        transporter.sendMail(mailOptions, (err, response) => {
            if (err) reject(err)
            return resolve(true)
        });

    });
}
module.exports = { sendOTPToEmail }