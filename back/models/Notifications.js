const mongoose = require('mongoose');

const notifySchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  date: { type: Date, default: Date.now }

});

module.exports = mongoose.model('Notify', notifySchema);
