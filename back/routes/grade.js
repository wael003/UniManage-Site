const express = require('express');
const route = express.Router();

const grade = require('../controller/gradeController')

route.get('/' , grade.getGrades);
route.get('/:studentId' , grade.getStudentsGrade);
route.post('/' , grade.addGrade);
route.put('/:gradeId' , grade.updateGrade);
route.delete('/:gradeId' , grade.deleteGrade);
route.get('/gpa/:studentId', grade.calculateGrade);

module.exports = route