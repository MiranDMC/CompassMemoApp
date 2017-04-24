var gLastPosition;

function init() 
{
	document.addEventListener("deviceready",onDeviceReady, false);
	updateCompass("Waiting for GPS data...");
}

function onDeviceReady() 
{
	//navigator.notification.beep(2);
	
	if ("geolocation" in navigator)
	{
		navigator.geolocation.watchPosition(onGpsUpdated, onGpsFailed, {timeout:100000});
		navigator.geolocation.getCurrentPosition(onGpsUpdated, onGpsFailed, {timeout:100000});
	}
	else
	{
		alert("ERROR: Failed to obtain GPS position on your device!");
	}
}

function updateCompass(angle)
{	
	var width = window.innerWidth;
	
	var height = window.innerHeight;
	height -= document.getElementById("navHeader").offsetHeight;
	height -= document.getElementById("navInfo").offsetHeight;
	height -= document.getElementById("navFooter").offsetHeight;
	height -= 20;
	
	document.getElementById("canvas").setAttribute( "height", height + "px" );
	
	var needle = document.getElementById("needle");
	var text = document.getElementById("compassText");
	
	if(typeof angle == "number" || (typeof angle == "object" && angle.constructor === Number))
	{
		text.style.display = "none"; // hide
		needle.style.display = "block"; // show
		
		var transform = "";
		//transform += " translate(" + (width / 2) + ", " + (height / 2) + ")";
		transform += " rotate(" + angle + ", 0, 0)";
		//transform += " scale(" + scale + ", " + scale + ")";
		
		needle.setAttribute("transform", transform );
	}
	else
	{
		needle.style.display = "none"; // hide
		text.style.display = "block"; // show
		text.textContent = angle;
	}
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

function onGpsUpdated(position)
{
	gLastPosition = position;
	
	updateCompass("GPS data recived!");
}

function onGpsFailed(error)
{
	updateCompass("Error: Location data not available.");
	alert('code: ' + error.code + '\n message: ' + error.message + '\n');
}
