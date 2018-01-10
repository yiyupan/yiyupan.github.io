var map;
var markers = [];
var defaultIcon
var highlightedIcon

function initMap() {
    
    default_center = {lat: 42.2808256, lng: -83.74303780000002};
    map = new google.maps.Map(document.getElementById('map'), {
        center: default_center,
        zoom: 13,
    });
    
    ko.applyBindings(new ViewModel());
    
}

//**** Knockout ****//

// ViewModel
var ViewModel = function () {
    var self = this;
    
    // load data : info around
    function initialize() {
        loadData();
    }
    
    var largeInfowindow = new google.maps.InfoWindow();
    defaultIcon = makeMarkerIcon('0091ff');
    highlightedIcon = makeMarkerIcon('FFFF24');
}

function showListings() {
    var bounds = new google.maps.LatLngBounds();
    
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
}


function hideListings() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}


function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21,34));
    return markerImage;
} 

function loadData() {
    var data;
    
    $.ajax({
        url: 'https://api.foursquare.com/v2/venues/search',
        data: ''
    })
}