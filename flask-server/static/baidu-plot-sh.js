window.onload = initialize;


var mp;
var shownMarkers = [];
var baiduPoints = [];
var tripLength = 0;
var color;

function initialize() {
	mp = new BMap.Map("map-canvas");
	mp.centerAndZoom(new BMap.Point(121.454094, 31.213192), 13);
	mp.enableScrollWheelZoom(true);
	mp.addControl(new BMap.NavigationControl());
	mp.addControl(new BMap.ScaleControl());
}




function addMarker( point )
{
	var marker = new BMap.Marker(point);
	mp.addOverlay(marker);
	shownMarkers.push(marker);
}




function showTripMarkers(event) {
	var points = this.getPath();
	
	for (var i = 0; i < points.length; i++)
	{
		var point = points[i];

		// add a new marker
		addMarker( point );
	}

}


function removeShownMarkers(event) {
	for ( i = 0; i < shownMarkers.length; i++ )
	{
		mp.removeOverlay(shownMarkers[i]);
	}
	shownMarkers = [];
}


function plotTrip( coords, color ) {
	var points = [];
	for (var i = 0; i < coords.length; i++) 
	{
		var p = new BMap.Point( coords[i].x, coords[i].y );
		points.push(p);
	}
	
	var tripPath = new BMap.Polyline( points, {
			strokeColor: color,
			strokeOpacity: 1.0,
			strokeWeight: 2,
			enableEditing: true,
	});
	
	mp.addOverlay(tripPath);
	tripPath.addEventListener('mouseover', showTripMarkers);
	tripPath.addEventListener('mouseout', removeShownMarkers);
}



/* Answer the event:
	Button "Plot Trip" is pressed
*/
function plotTripByID() {
	var id = $('input[name=tripID]').val();
	$.ajax({
		type: 'get',
		url: '/trip/',
		data: {id: id},
		success: function(data) {
			var d = JSON.parse(data);
			var color = '#DC143C';
			plotTrip(d, color);
			message(id + ' is plotted');
		}
	});
}
		
	
function message( content )
{
	$('#line').html( content )
}


function plotCase( idx ) {
	caseTripSet = cases[idx];
	currentTripIdx = 0;
	plotTrips();
}




function plotTrips( ) {
	// map one case onto the map
	var i = currentTripIdx;
	var trips = caseTripSet;
	currentTrip = trips[i];
	
	if (i == trips.length)
		return;
	
	
	console.log('Plot trip ' + i);
	
	if (i==0)
		color = '#9370DB';
	else
		color = '#DC143C';
	
	tripLength = currentTrip.length;
	
	
	currentPointIdx = 0;
	
	var tripPath = new BMap.Polyline(baiduPoints, {
				strokeColor: color,
				strokeOpacity: 1.0,
				strokeWeight: 2,
				enableEditing: true,
	});
		
	mp.addOverlay(tripPath);
	
	tripPath.addEventListener('mouseover', showTripMarkers);
	tripPath.addEventListener('mouseout', removeShownMarkers);
	
	// save trips in global space.
	casetrips.push(tripPath);
	currentTripIdx++;
				
}

	