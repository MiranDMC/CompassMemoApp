function init() 
{
	document.addEventListener("deviceready",onDeviceReady, false);
}

function onDeviceReady() 
{
	//navigator.notification.beep(2);
}

function addNewLocation()
{
	var imgData = ''
	navigator.camera.getPicture(
		function(val) { imgData = val; alert('Photo OK'); },
		function(val) { alert('Failed to get photo: ' + val); }
	);
	
	var lon = 0;
	var lat = 0;
	navigator.geolocation.getCurrentPosition(
		function(val) { lon = val.coords.latitude; val.coords.longitude; alert('Position:' + lon + ", " + lat); },
		function(val) { alert('Failed to get geolocation: ' + val); }
	);
}
