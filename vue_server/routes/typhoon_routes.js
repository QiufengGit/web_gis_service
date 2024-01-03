const express = require("express");
const router = express.Router();
const Typhoon_route = require("../models/typhoon_route");

// Get
router.get("/", async (req, res) => {
  try {
    const Typhoon_routes = await Typhoon_route.find();
    res.json(Typhoon_routes);
    console.log(`Get Typhoons OK`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//通过id查找
router.get("/:id", async (req, res) => {
  try {
    const Typhoon_routes = await Typhoon_route.findById(req.params.id);
    if (!Typhoon_routes)
      return res
        .status(404)
        .json({ error: `Typhoon with id ${req.params.id} not found` });
    res.json(Typhoon_routes);
    console.log(`Get OK`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//通过id查找
router.get("/name/:id", async (req, res) => {
  try {
    const Typhoon_routes = await Typhoon_route.find({ "英文名": req.params.id });
    if (!Typhoon_routes)
      return res
        .status(404)
        .json({ error: `Typhoon with id ${req.params.id} not found` });
    res.json(Typhoon_routes);
    console.log(`Get OK`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
