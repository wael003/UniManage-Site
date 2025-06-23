const nodeMailer = require("nodemailer");

const transporter = nodeMailer.createTransport({
    host : "smtp.gmail.com",
    port : process.env.NODEMILER_PORT || 587,
    secure : false,
    auth: {
      user: process.env.NODEMILER_USER,
      pass: process.env.NODEMILER_PASSKEY, 
          },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout : 5000,
    greetingTimeout : 3000,
  });

  
  module.exports = transporter;

  