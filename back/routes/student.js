const express = require('express');
const route = express.Router();
const students = require('../controller/studentController')

route.get('/' , students.getAllStudents);
route.get('/:id' , students.getStudentByID);
route.post('/' , students.addStudent);
route.put('/:id' , students.updateInfo);
route.delete('/:id' , students.deleteStudent);


module.exports = route
