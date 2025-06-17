const express = require('express');
const route = express.Router();
const userController = require('../controller/userController');
const User = require('../models/User');


route.post('/login',userController.Login );
route.post("/register",userController.SignUp );
route.get("/logout", (req, res) => {
    res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  });
  res.json({message : 'loged out'});
});
route.get("/user", (req, res) => {
  User.find()
  .then(data=>{
    res.json(data);
  })
  .catch((err)=>{
    res.status(500).json(err);
  })
});

module.exports = route