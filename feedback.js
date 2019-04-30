const express = require("express");
var bodyParser = require('body-parser');
const gh = require("./github");

var router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
router.use(bodyParser.json())

router.post('/:repo',(req,res)=>{
    gh.sendFeedback(req.params.repo,req.body.title,request.body.text);
});



module.exports = router;