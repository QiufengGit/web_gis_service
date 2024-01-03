const express = require('express');
const router = express.Router();
const Event = require('../models/event');
const distanceBetweenPoints = require('../utils/distance');

router.post('/', (req, res) => {

    const lat = req.body.lat;
    const lon = req.body.lon;
    console.log(lat,lon)
    const distance = req.body.distance; // 新增：距离
    const eventType = req.body.eventType; // 新增：事件类型
    console.log(eventType)
    Event.find({}).then((events) => {
      let nearbyEvents = [];
      events.forEach((event) => {
        if (!eventType||event.einfo.type === eventType) {
          const eventLat = event.einfo.lat;
          const eventLon = event.einfo.lon;
          const d = distanceBetweenPoints.distanceBetweenPoints(lat, lon, eventLat, eventLon);
          if (d < distance) { // 修改：判断距离是否小于给定的距离
            nearbyEvents.push(event);
          }
        }
      });
      res.send({ events: nearbyEvents });
    }).catch((err) => {
      console.log(err);
      res.send({ error: err });
    });
  });

  module.exports = router;