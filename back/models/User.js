const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String, unique: true },
  departmentCategory: { type: String, required: true },
  role : {type: String, required: true}
});

// Hash the password before saving
userSchema.pre('save', async function (next) {
  const student = this;

  // Only hash the password if it has been modified (or is new)
  if (!student.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(student.password, salt);
    student.password = hash;
    next();
  } catch (err) {
    next(err);
  }
});

// Optional: Method to compare password during login
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};


module.exports = mongoose.model('User', userSchema);
