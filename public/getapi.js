var bcmodapi = {};
function getBCModAPI(cb=()=>{}) {
    return new Promise((resolve,reject)=>{
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', '/', true); // Replace 'my_data' with the path to your file
        xobj.onreadystatechange = function () {
              if (xobj.readyState == 4 && xobj.status == "200") {
                var res = xobj.responseText;
                bcmodapi = res
                cb(res);
                resolve(res);
              }
        };
        xobj.send(null);
    });     
}