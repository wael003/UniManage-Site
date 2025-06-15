const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  studentId: { type: Number, unique: true},
  email: { type: String, unique: true },
  department: { type: String,},
  enrollmentDate: { type: Date, default: Date.now },

  phone: { type: String },  // Optional, add validation if needed
  address: { type: String }, // Optional
  entryDate: { type: Date }, // Optional
  expectedGraduation: { type: Date }, // Optional
  advisor: { type: String }, // Optional — could be a name or an ObjectId ref to another model if you want
  totalCredits: { type: Number, default: 0 }, // Optional with default value
  yearLevel : {type: Number, default: 1}
});

studentSchema.plugin(AutoIncrement, { inc_field: 'studentId' });

module.exports = mongoose.model('Student', studentSchema);
