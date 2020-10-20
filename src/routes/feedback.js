"use strict"
const express = require("express");
let bodyParser = require('body-parser');
const gh = require("#src/util/github");

let router = express.Router();

/**
 * Middleware
 */
router.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
router.use(bodyParser.json())

/**
 * Routers
 */

router.post('/:repo',(req,res)=>{
    gh.sendFeedback(req.params.repo,req.body.text,req.body.title).then((issue)=>{
        console.log("issue url",issue.html_url);
        res.redirect(issue.html_url)
    }).catch(console.error);
});

module.exports = router;