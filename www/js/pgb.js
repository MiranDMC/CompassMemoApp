var gLastPosition;
var gPhotosDirectoryPath;

var gGeoOptions = {
  enableHighAccuracy: true, 
  maximumAge : 30000, 
  timeout : 27000
};

function init() 
{
	document.addEventListener("deviceready",onDeviceReady, false);
	updateCompass("Waiting for GPS data...");
}

function onDeviceReady() 
{
	 alert("bbb");
	//navigator.notification.beep(2);
	
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
		function(fileSystem) { alert("FS: " + fileSystem); }, 
		function(err) { alert("ERROR: Failed to request local file system: " + err ); });
	
	if (navigator.geolocation)
	{
		navigator.geolocation.watchPosition(onGpsUpdated, onGpsFailed, gGeoOptions);
		navigator.geolocation.getCurrentPosition(onGpsUpdated, onGpsFailed, gGeoOptions);
	}
	else
	{
		alert("ERROR: Geolocation is not supported by your device!");
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
	function photoSuccess(imgData)
	{
		
	}
	
	var imgData = ''
	navigator.camera.getPicture(
		photoSuccess,
		function(val) { alert('Failed to get photo: ' + val); },
		{ quality: 75 }
	);
}

function onGpsUpdated(position)
{
	updateCompass("GPS data recived!");
	gLastPosition = position;
}

function onGpsFailed(error)
{
	updateCompass("Error: Location data not available.");
	alert('code: ' + error.code + '\n message: ' + error.message + '\n');
}
