function init() 
{
	document.addEventListener("deviceready",onDeviceReady, false);
	updateCompass();
}

function onDeviceReady() 
{
	//navigator.notification.beep(2);
}

function updateCompass()
{
	var height = window.innerHeight;
	height -= document.getElementById("navHeader").offsetHeight;
	height -= document.getElementById("navInfo").offsetHeight;
	height -= document.getElementById("navFooter").offsetHeight;
	height += 50;
	
	document.getElementById("navCompass").height = height + "px";
	
	var needle = document.getElementById("needle");
	needle.setAttribute("transform", "rotate(0 60 60) translate(100, 100) ");
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
