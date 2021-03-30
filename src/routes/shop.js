"use strict";
const express = require("express");




let router = express.Router();

router.use(express.json());

router.get('/', async function (req, res) {
    res.send({ coming: "soon" });
});

module.exports = router;