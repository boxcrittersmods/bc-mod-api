let bcmodapi = {};
function getBCModAPI(cb = () => { }) {
	return new Promise((resolve, reject) => {
		let xobj = new XMLHttpRequest();
		xobj.overrideMimeType("application/json");
		xobj.open('GET', '/', true); // Replace 'my_data' with the path to your file
		xobj.onreadystatechange = function () {
			if (xobj.readyState == 4 && xobj.status == "200") {
				let res = xobj.responseText;
				bcmodapi = res;
				cb(res);
				resolve(res);
			}
		};
		xobj.send(null);
	});
}