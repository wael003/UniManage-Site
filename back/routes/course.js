const express = require('express');
const route = express.Router();

const course = require('../controller/courseController')

route.get('/', course.getAllCourses);
route.get('/:code', course.getCourseByCode);
route.post('/', course.addCourse);
route.put('/:code', course.updateInfo);
route.delete('/:code', course.deleteCourse);


module.exports = route