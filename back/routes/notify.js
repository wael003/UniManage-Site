const express = require('express');
const route = express.Router();
const Notify = require('../models/Notifications');
const Department = require('../models/Department');
const auth = require('../middleware/auth');

route.get('/notify',auth.authMiddleware,async (req, res) => {
        const departments = await Department.find({ category: req.user.departmentCategory });
        const departmentId = departments.map(dep => dep._id);

    Notify.find({ department: { $in: departmentId } })
    .populate('department', 'name code category')
    .then(data => {
        
        res.json( data );
    })
    .catch(err => {
        res.status(500).json({ message: 'somthing went wrong' + err });
    })
})

module.exports = route