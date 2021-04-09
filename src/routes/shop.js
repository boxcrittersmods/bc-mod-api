"use strict";
const express = require("express");


const shopInfo = require('#data/getShop.json');




let router = express.Router();

router.use(express.json());

router.get('/', async function (req, res) {
    res.send(shopInfo);
});

module.exports = router;