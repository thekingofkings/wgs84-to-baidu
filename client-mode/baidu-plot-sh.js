window.onload = initialize;


var mp;
var shownMarkers = [];
var casetrips = []
var baiduPoints = [];
var tripLength = 0;
var color;
var caseTripSet;
var currentTripIdx;

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



function plotTrips( ) {
	// map one case onto the map
	var i = currentTripIdx;
	var trips = caseTripSet;
	
	console.log('Plot trip ' + i);
	if (i == trips.length)
		return;
	
	tripLength = trips[i].length;
	
	var j = 0;
	while (j < tripLength)	// each GPS sample in Trip
	{
		var p = new BMap.Point( trips[i][j][1], trips[i][j][0] );
		BMap.Convertor.translate( p, 0, translateCallback );
		j++;
	}
	
}


function plotCase( idx ) {
	caseTripSet = cases[idx];
	currentTripIdx = 0;
	plotTrips();
}



/* GPS convert to Baidu coordinate 
 *  This function is an asynchronized.
 */
function translateCallback(point) {
	var r = $.Deferred();
	
	baiduPoints.push(point);
	console.log(baiduPoints.length + ' ' + tripLength);
	
	r.resolve();
	return $.Deferred( function() {
		r.done(function() {
			if (baiduPoints.length == tripLength) {
				
				if (currentTripIdx==0)
					color = '#9370DB';
				else
					color = '#DC143C';
				
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
				
				baiduPoints = [];
				
				// plot next trips
				currentTripIdx++;
				plotTrips();
			}
		});
	});
}