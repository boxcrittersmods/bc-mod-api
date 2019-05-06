const express = require("express");
var bodyParser = require('body-parser');
const gh = require("./github");

var router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
router.use(bodyParser.json())

router.post('/:repo',(req,res)=>{
    
    gh.sendFeedback(req.params.repo,req.body.text,req.body.title).then((issue)=>{
        console.log("issue url",issue.html_url);
        res.redirect(issue.html_url)
    }).catch(console.error)
});



module.exports = router;