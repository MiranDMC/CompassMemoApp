var gLastPosition;
var gPhotosDirectory = 'CompassMemoData';

var gListCurrName;
var gListCurrFile;
var gListCurrImg;
var gListCurrLon;
var gListCurrLat;

var gTargetLon;
var gTargetLat;

var gGeoOptions = 
{
  enableHighAccuracy: true, 
  //maximumAge : 5,
  //timeout : 30
};

//var geolocation = false;
if(navigator.geolocation) // try use HTML5 geolocation
{
	//geolocation = navigator.geolocation;
	navigator.geolocation.watchPosition(onGpsUpdated, onGpsFailed, gGeoOptions);
	navigator.geolocation.getCurrentPosition(onGpsUpdated, onGpsFailed, gGeoOptions);
}


if (typeof(Number.prototype.toRad) === "undefined")
{
	Number.prototype.toRad = function() 
	{
		return this * Math.PI / 180.0;
	}
}

if (typeof(Number.prototype.toDeeg) === "undefined")
{
	Number.prototype.toDeeg = function() 
	{
		return this * 180.0 / Math.PI;
	}
}

function geoDistance(lon1, lat1, lon2, lat2) 
{
	var R = 6371.0; // Radius of the earth in km
	var dLat = (lat2-lat1).toRad();  // Javascript functions in radians
	var dLon = (lon2-lon1).toRad(); 
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
		  Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
		  Math.sin(dLon/2) * Math.sin(dLon/2); 
	var c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0-a)); 
	var d = R * c; // Distance in km
	return d;
}

function geoAngleFromCoordinate(lon1, lat1, lon2, lat2) 
{
	lon1 = lon1.toRad();
	lat1 = lat1.toRad();
	lon2 = lon2.toRad();
	lat2 = lat2.toRad();
	
    var dLon = (lon2 - lon1);
    var y = Math.sin(dLon) * Math.cos(lat2);
    var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
	
    var brng = Math.atan2(y, x);
    brng = brng.toDeeg();
    brng = (brng + 360.0) % 360.0;
    return brng;
}

function init() 
{
	document.addEventListener('deviceready',onDeviceReady, false);
	updateCompass('Waiting for GPS data...');
}

function onDeviceReady()
{
	//navigator.notification.beep(2);
	
	var geolocationOk = false;
	
	// html geolocation	
	/*if(geolocation)
	{
		geolocation.watchPosition(onGpsUpdated, onGpsFailed, gGeoOptions);
		geolocation.getCurrentPosition(onGpsUpdated, onGpsFailed, gGeoOptions);
		geolocationOk = true;
	}*/
	
	// phone gap
	if(navigator.geolocation)
	{
		navigator.geolocation.watchPosition(onGpsUpdated, onGpsFailed, gGeoOptions);
		navigator.geolocation.getCurrentPosition(onGpsUpdated, onGpsFailed, gGeoOptions);
		geolocationOk = true;
	}
	
	if(!geolocationOk)
	{
		alert('ERROR: geolocation is not supported by your device.');
	}
	
	// load photos from storage
	updateLocationsList();
}
document.addEventListener("deviceready", onDeviceReady, false); // add listener my self to be double sure

function updateCompass(angle)
{	
	var width = window.innerWidth;
	
	var height = window.innerHeight;
	height -= $('#navHeader').outerHeight();
	height -= $('#navInfo').outerHeight();
	height -= $('#navFooter').outerHeight();
	height -= 20;
	
	$('#canvas').height(height + 'px');
	
	if(typeof angle == 'number' || (typeof angle == 'object' && angle.constructor === Number))
	{
		$('#compassText').css('display', 'none'); // hide
		$('#needle').css('display', 'block'); // show
		$('#needle').attr('transform', 'rotate(' + angle + ', 0, 0)');
	}
	else
	{
		$('#needle').css('display', 'none'); // hide
		$('#compassText').css('display', 'block'); // show
		$('#compassText').text(angle);
	}
}

function addNewLocation()
{
	if(gLastPosition == undefined)
	{
		alert('GPS data is required to perform this action.\nPlease try again later.');
		return;
	}
	
	function photoSuccess(imgData) // save photo to file in app's directory
	{
		var description = prompt('Please enter location name', '');
		
		if (description == null || description == '')
		{
			return;
		}
		
		window.resolveLocalFileSystemURI(imgData,
			function(entry)
			{
				var fileName = '';
				fileName += gLastPosition.coords.latitude + '_' + gLastPosition.coords.longitude;
				fileName += '_' + description;
				fileName += '.jpg';
				
				window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
				function(fileSys) 
				{
					fileSys.root.getDirectory( gPhotosDirectory, {create:true, exclusive: false},
						function(directory) 
						{
							entry.moveTo(directory, fileName,  
								function(entry){ updateLocationsList(); },  // succcess, refresh locations list
								function(err) {alert('ERROR: failed to move picture into target directory. ' + err.message);});
						},
						function(err) {alert('ERROR: failed to get output directory. ' + err.message);} );
				},
				function(err) {alert('ERROR: failed to access file system. ' + err.message);} );
			}
		, function(err) {alert('ERROR: Unable to resolve image location. ' + err.code + ' ' + err.message);} );
	}
	
	navigator.camera.getPicture(
		photoSuccess,
		function(err) {alert('ERROR: Unable to get picture. ' + err.message);},
		{ quality: 70, targetWidth: 200, targetHeight: 200 }
	);
}

function navigateToLocation()
{
	if(!gListCurrName)
	{
		alert("Please select location!");
		return;
	}
	
	$("#navInfoImg").attr("src", gListCurrImg);
	$("#navInfoName").text(gListCurrName);
	
	gTargetLon = parseFloat(gListCurrLon);
	gTargetLat = parseFloat(gListCurrLat);
	
	$.mobile.changePage('#navigate');
}

function deleteLocation()
{
	if(!gListCurrName)
	{
		alert("Please select location!");
		return;
	}
	
	if (confirm('Do you want to delete "' + gListCurrName + '" location?'))
	{
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
			function(fileSys) 
			{
				fileSys.root.getDirectory( gPhotosDirectory, {create:true, exclusive: false},
					function(directory) 
					{
						directory.getFile(gListCurrFile, {create: false, exclusive: false},
							function(file) 
							{
								file.remove(
									function(entry)
									{
										updateLocationsList();
									},
									function(err) {alert('ERROR: failed remove file. ' + err.message);} 
								);
							},
							function(err) {alert('ERROR: failed to get file. ' + err.message);}
						);
					}, 
					function(err) {alert('ERROR: failed to get output directory. ' + err.message);} 
				);
			},
			function(err) {alert('ERROR: failed to access file system. ' + err.message);}
		);
	}
}

function updateLocationsList()
{	
	$('#locationsList').html(''); // clear list
	
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
		function(fileSys) 
		{
			fileSys.root.getDirectory( gPhotosDirectory, {create:true, exclusive: false},
				function(directory) 
				{
					var directoryReader = directory.createReader();
					
					directoryReader.readEntries(
						function(entries)
						{
							var html = '';
							
							for (var i=0; i<entries.length; i++) 
							{
								// filename format : lon_lat_description.jpg
								var filename = entries[i].name;

								if(!filename.endsWith('.jpg'))
								{
									continue; // not jpg file
								}
																
								var filenameParts = filename.substring(0, filename.length-4).split('_'); // remove extension, split
								
								if( (filenameParts.length - 1) < 2)
								{
									continue; // not enough of '_' characters
								}
								
								var onClick = `
									{
										gListCurrName = $(this).attr('data-custom-name');
										gListCurrFile = $(this).attr('data-custom-file');
										gListCurrImg = $(this).attr('data-img');
										gListCurrLon = $(this).attr('data-custom-lon');
										gListCurrLat = $(this).attr('data-custom-lat');
									}
								`;
								
								var lat = filenameParts[0];
								var lon = filenameParts[1];
								var name = filenameParts[2];
								var img = entries[i].toURL();
								
								html += '<li data-icon="false"'
								html += ' data-custom-name="' + name + '"';
								html += ' data-custom-lon="' + lon + '"';
								html += ' data-custom-lat="' + lat + '"';
								html += ' data-custom-file="' + filename + '"';
								html += ' data-img="' + img + '"';
								html += 'onclick="' + onClick + '"';
								html += '><a href="#">';						
								html += '<img width="20%" src="' + img + '">';
								html += '<h2>' + name + '</h2>';
								html += '</a></li>';
							}
							
							$('#locationsList').html(html);
							$('#locationsList').listview('refresh');
						},
						function(err) {alert('ERROR: failed to get output directory. ' + err.message);});
				},
				function(err) {alert('ERROR: failed to get output directory. ' + err.message);} );
		},
		function(err) {alert('ERROR: failed to access file system. ' + err.message);} );
}


function onGpsUpdated(position)
{
	if(position != undefined && position.coords !== undefined && position.coords.heading !== undefined)
	{		
		/*gLastPosition = position;
		
		if(gListCurrName)
		{
			var dist = geoDistance(position.coords.longitude, position.coords.latitude, gTargetLon, gTargetLat);
			$('#distance').text('Distance: ' + Math.round(1000.0 * dist) + 'm');
			
			var angleHeading = position.coords.heading;
			
			if(angleHeading)
			{
				var angleToTarget = geoAngleFromCoordinate(position.coords.longitude, position.coords.latitude, gTargetLon, gTargetLat);
				updateCompass(angleToTarget - angleHeading);
			}
			else
			{
				updateCompass('Please start walking');
			}
		}
		else
		{
			updateCompass('');
			$('#distance').text('');
		}*/
		
		alert('GPs');
	}
	else
	{
		alert(position);
	}
}

function onGpsFailed(err)
{
	if(err.code !== 3) // not timeout
	{
		updateCompass('Error: Location data not available.');
		alert('code: ' + err.code + '\n message: ' + err.message + '\n');
	}
	else
	{
		updateCompass('Waiting for GPS data...');
	}
}
