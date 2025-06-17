const express = require('express');
const route = express.Router();
const auth = require('../middleware/auth');


const course = require('../controller/courseController')

route.get('/',auth.authMiddleware , course.getAllCourses);
route.get('/:code', course.getCourseByCode);
route.post('/',auth.authMiddleware , course.addCourse);
route.put('/:code',auth.authMiddleware  ,course.updateInfo);
route.delete('/:code',auth.authMiddleware , course.deleteCourse);


module.exports = route