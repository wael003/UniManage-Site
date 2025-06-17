const express = require('express');
const route = express.Router();
const students = require('../controller/studentController')
const auth = require('../middleware/auth');

route.get('/' ,auth.authMiddleware , students.getAllStudents);
route.get('/:id' ,auth.authMiddleware , students.getStudentByID);
route.post('/' ,auth.authMiddleware , students.addStudent);
route.put('/:id' ,auth.authMiddleware , students.updateInfo);
route.delete('/:id' ,auth.authMiddleware , students.deleteStudent);


module.exports = route
