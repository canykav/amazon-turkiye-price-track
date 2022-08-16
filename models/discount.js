const mongoose = require('mongoose');

let discountSchema = new mongoose.Schema({
    url: String,
    code: String,
    price: String,
    oldPrice: String,
    title: String,
    date: String
  });

  const discount = mongoose.model('discounts', discountSchema);
  module.exports = { discount };