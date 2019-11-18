const express = require("express");

var router = express.Router();

/**
 * Settings
 */
app.set('json spaces', 2);

/**
 * Middleware
 */
router.use((req,res,next)=>{
    res.type("application/json");
    next();
});

/**
 * Routers
 */
// /versions
router.get('/',(req,res)=>{

});
// /versions/latest
router.get('/latest',(req,res)=>{

});
// /versions/(version)
router.get('/:ver',(req,res)=>{

});

module.exports = router;