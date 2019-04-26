const webserver = require("webserver");
const app = require('./app');

app.get("/",(req,res)=>{
});

var server = webserver(app);