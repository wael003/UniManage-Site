const nodeMailer = require("nodemailer");

const transporter = nodeMailer.createTransport({
    host : "smtp.gmail.com",
    port : 587,
    secure : false,
    auth: {
      user: 'travelar432@gmail.com', // your email
      pass: 'tlad vepa aeux rsaa', // your password
          },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout : 5000,
    greetingTimeout : 3000,
  });

  
  module.exports = transporter;

  