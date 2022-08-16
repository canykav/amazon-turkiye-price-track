const mongoose = require('mongoose');

let amazonSchema = new mongoose.Schema({
    url: String,
    code: String,
    price: String,
    title: String,
    date: String
  });

  const amazon = mongoose.model('trackings', amazonSchema, 'amazon');
  module.exports = { amazon };