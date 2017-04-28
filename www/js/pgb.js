var gLastPosition;
var gPhotosDirectory = 'CompassMemoData';

var gListCurrName;
var gListCurrFile;
var gListCurrImg;
var gListCurrLon;
var gListCurrLat;

var gTargetLon;
var gTargetLat;

var gGeoOptions = {
  enableHighAccuracy: true, 
  maximumAge : 30000, 
  timeout : 27000
};

function init() 
{
	document.addEventListener('deviceready',onDeviceReady, false);
	updateCompass('Waiting for GPS data...');
}

function onDeviceReady()
{
	//navigator.notification.beep(2);
		
	// ask for location
	if (navigator.geolocation)
	{
		navigator.geolocation.watchPosition(onGpsUpdated, onGpsFailed, gGeoOptions);
		navigator.geolocation.getCurrentPosition(onGpsUpdated, onGpsFailed, gGeoOptions);
	}
	else
	{
		alert('ERROR: Geolocation is not supported by your device!');
	}
	
	// load photos from storage
	updateLocationsList();
}

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
		$('#needle').transform('rotate(' + angle + ', 0, 0)');
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
								function(err) {alert('ERROR: failed to move picture into target directory. ' + error.message);});
						},
						function(err) {alert('ERROR: failed to get output directory. ' + error.message);} );
				},
				function(err) {alert('ERROR: failed to access file system. ' + error.message);} );
			}
		, function(err) {alert('ERROR: Unable to resolve image location. ' + error.code + ' ' + error.message);} );
	}
	
	navigator.camera.getPicture(
		photoSuccess,
		function(err) {alert('ERROR: Unable to get picture. ' + error.message);},
		{ quality: 70, targetWidth: 25, targetHeight: 25 }
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
	$("#navInfoName").attr("src", gListCurrName);
	
	$.mobile.changePage('#navigate');
}

function deleteLocation()
{
	if(!gListCurrName)
	{
		alert("Please select location!");
		return;
	}
	
	window.resolveLocalFileSystemURL(gListCurrFile,
		function(file) 
		{
			file.remove(function()
			{
				updateLocationsList();
			},
			function(err) {alert('ERROR: failed remove file. ' + error.message);});
      }, 
	  function(err) {alert('ERROR: failed to resolve file location. ' + error.message);});
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
								html += '><a href="#">';						
								html += '<img width="20%" src="' + img + '">';
								html += '<h2>' + name + '</h2>';
								html += '</a></li>';
							}
							
							// assign item click event
							$('#locationsList ul').children('li').children('a').bind('touchstart mousedown', 
								function(e) 
								{
									alert("click");
									gListCurrName = $(this).attr('data-custom-name');
									gListCurrFile = $(this).attr('data-custom-file');
									gListCurrImg = $(this).attr('data-img');
									gListCurrLon = $(this).attr('data-custom-lon');
									gListCurrLat = $(this).attr('data-custom-lat');
									alert(gListCurrName);
								});
							
							$('#locationsList').html(html);
							$('#locationsList').listview('refresh');
						},
						function(err) {alert('ERROR: failed to get output directory. ' + error.message);});
				},
				function(err) {alert('ERROR: failed to get output directory. ' + error.message);} );
		},
		function(err) {alert('ERROR: failed to access file system. ' + error.message);} );
}

function onGpsUpdated(position)
{
	updateCompass('GPS data recived!');
	gLastPosition = position;
}

function onGpsFailed(error)
{
	if(error.code !== 3) // not timeout
	{
		updateCompass('Error: Location data not available.');
		alert('code: ' + error.code + '\n message: ' + error.message + '\n');
	}
}
