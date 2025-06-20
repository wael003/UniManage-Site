
const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },       // e.g., "Computer Science"
    code: { type: String, required: true, unique: true },       // e.g., "CS"
    category: { type: String, required: true }                  // e.g., "IT"
});

module.exports = mongoose.model('Department', departmentSchema);
