const express = require("express");
const puppeteer = require("puppeteer");
const absolutify = require("absolutify");

var router = express.Router();

function getHostName(url) {
    var nohttp = url.replace('http://','').replace('https://','');
    var http = url.replace(nohttp,'');
    var hostname = http + nohttp.split(/[/?#]/)[0];
    return hostname;
}

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


router.use((req,res,next)=>{
    res.type("html");
    next();
});

router.use(async (req,res)=>{
    var url = req.path.substr(1);
    console.log("URL:",url);
    if(!url) {
        res.send("No URL provided");
        return;
    }
    try {
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();
    await page.goto(`${url}`);
    var document = await page.evaluate(()=>document.documentElement.outerHTML);
    document = absolutify(document,`/cors/${getHostName(url)}`);

    res.send(document);
    } catch(e) {
        res.send(e);
        return;
    }
});



module.exports = router;