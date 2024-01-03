const mongoose = require('mongoose');

//Comment 数据结构
const typhoonSchema = new mongoose.Schema({
    header: Object,
    data: Array,
  });

module.exports = mongoose.model('Typhoon', typhoonSchema);