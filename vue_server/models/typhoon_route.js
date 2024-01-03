const mongoose = require('mongoose');

//Comment 数据结构
const typhoon_routeSchema = new mongoose.Schema({
    '日期': String,
    '时间': String,
    '风速': String,
    '移动方向': String,
    '强度': String,
    '纬度':String,
    "中心气压(百帕)": String,
    "移动速度(km/h)": String,
    "x": String,
    "y": String,
    "英文名": String
  });

module.exports = mongoose.model('Typhoon_route', typhoon_routeSchema);