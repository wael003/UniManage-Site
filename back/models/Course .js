const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  courseId: { type: String, unique: true, required: true },
  creditHours: { type: Number, required: true },
  instructor: { type: String, required: true },
  department : {type: String, required: true },
  schedule : {type: String, required: true},
  capacity : {type: Number, required: true},
  semester : {type: String, required: true},
  enrolled : {type: Number, default : 0},
  room : {type: String, required: true}
});

module.exports = mongoose.model('Course', courseSchema);
