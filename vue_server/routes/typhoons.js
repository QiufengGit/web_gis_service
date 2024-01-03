const express = require("express");
const router = express.Router();
const Typhoon = require("../models/typhoon");

// Get
router.get("/", async (req, res) => {
  try {
    const Typhoons = await Typhoon.find();
    res.json(Typhoons);
    console.log(`Get Typhoons OK`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//通过id查找
router.get("/:id", async (req, res) => {
  try {
    const Typhoons = await Typhoon.findById(req.params.id);
    if (!Typhoons)
      return res
        .status(404)
        .json({ error: `Typhoon with id ${req.params.id} not found` });
    res.json(Typhoons);
    console.log(`Get OK`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//通过id查找
router.get("/eid/:id", async (req, res) => {
  try {
    const Typhoons = await Typhoon.find({ "eid": req.params.id });
    if (!Typhoons)
      return res
        .status(404)
        .json({ error: `Typhoon with id ${req.params.id} not found` });
    res.json(Typhoons);
    console.log(`Get OK`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//通过id查找
router.get("/time/:id", async (req, res) => {
  try {
    const Typhoons = await Typhoon.find({ "header.refTime": req.params.id });
    if (!Typhoons)
      return res
        .status(404)
        .json({ error: `Typhoon with id ${req.params.id} not found` });
    res.json(Typhoons);
    console.log(`Get OK`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
