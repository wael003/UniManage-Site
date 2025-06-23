const express = require('express');
const route = express.Router();
const Student = require('../models/Student');
const auth = require('../middleware/auth');
const Transporter = require("../config/Email");

route.post('/:id', auth.authMiddleware, (req, res) => {
    const { subject, body } = req.body;
    Student.findById(req.params.id)
        .then(data => {
            const user = data.email;
            const message = {
                "from": "travelar432@gmail.com",
                "to": user,
                "subject": subject,
                "text": body,
            };
            Transporter.sendMail(message, (error, info) => {
                if (error) {
                    res.status(501).json("something went wrong! , try again later ");
                } else {
                    console.log("Email sent !")
                    res.json(`email sent to ${data.name} successfully!`);
                }
            });
        }).catch(err=>{
            res.status(500).json({error : err})
        })

})

module.exports = route;