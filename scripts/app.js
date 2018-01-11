'use strict';

/* global variables*/
var map;
var client_id = "WA0FIZATTHTFACN00QZYRSGI4I1EACJVBCSFHRNRDCNDQDEA";
var client_secret = "RZX3DBPHBMPNR3KYGZ3RRGWZOX3NH2RU1YEC2FRJ4DFSYUSJ";
var defaultIcon;
var highlightedIcon;
var ann_arbor;

/** Knockout JS**/

var initial_area = [
    {name: 'Central', 
        lat: 42.27999509197188, lng: -83.74351015355471},
    {name: 'The Private Music Network Presents @ the Black Crystal Cafe', 
        lat: 42.2808256, lng: -83.7430378},
    {name: 'Varsity Ann Arbor', 
        lat: 42.280381186918376, lng: -83.74286236815283},
    {name: 'Ann Arbor Food Truck Rally', 
        lat: 42.2808256, lng: -83.7430378},
    {name: 'NWP SmartSource', 
        lat: 42.28044419172267, lng: -83.74304852780615},
    {name: 'Prechter Laboratory - UM SOE', 
        lat: 42.28079069158865, lng: -83.74252984309415},
    {name: 'Downtown Ann Arbor', 
        lat: 42.27948839981714, lng: -83.74784615591695},
];


var Area = function(data) {
    var self = this;
    this.name = data.name;
    this.lat = data.lat;
    this.lng = data.lng;
    this.url = "";
    this.phone = "";
    this.address = "";
    this.id = "";
    
    this.visible = ko.observable(true);
    
    // implement fourSquare API finding location details
    var fourSquareURL = 'https://api.foursquare.com/v2/venues/search?ll=' + this.lat + ',' + this.lng + '&client_id=' + client_id + '&client_secret=' + client_secret + '&v=20180110';
    
    $.getJSON(fourSquareURL).done(function(data) {
        var result = data.response.venues[0];
        self.url = result.url;
        if(typeof self.url === 'undefined') {
            self.url = "";
        }
        self.phone = result.contact.formattedPhone;
        self.address = result.location.formattedAddress[0];
        if(typeof self.phone === 'undefined') {
            self.phone = "";
        }
        
    }).fail(function() {
        alert("Error with FourSquare API call!")
    });
    
    this.contentString = 
        '<div class="info-window">' + '<a href="' + self.url + '">' + 
        '<span class="infor-window-title"><h4>' + self.name + '</h4></span>' +
        '</a><h6>' + self.address + '<br>' +
        self.phone + '</h6></div>';
    
    
    this.infoWindow = new google.maps.InfoWindow({content: self.contentString});
    
    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(data.lat, data.lng),
        icon: defaultIcon,
        map: map,
        title: data.name
    });
    
    this.showMarker = ko.computed(function(){
        if(this.visible() == true) {
            this.marker.setMap(map);
        }else {
            this.marker.setMap(null);
        }
        return true;
    },this);
    
    this.marker.addListener('click', function(){
        self.infoWindow.setContent(self.contentString);
        self.infoWindow.open(map, self.marker);
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        self.marker.setIcon(highlightedIcon);
        setTimeout(function(){
           self.marker.setAnimation(null) 
        }, 2100);
    });
    
    this.onclick = function() {
        document.getElmentById('item').innerHTML = '<span>' + self.name + '</span>';
        google.maps.event.trigger(self.marker, 'click');
    };
};

// Set default and highlighted icon
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

// ViewModel
function ViewModel() {
    var self = this;
    this.areaList = ko.observableArray([]);
    this.query = ko.observable('');
    this.queryResult = ko.observable('');
    
    defaultIcon = makeMarkerIcon('0091ff');
    highlightedIcon = makeMarkerIcon('FFFF24');
    
    initial_area.forEach(function(init_area) {
        self.areaList.push(new Area(init_area));
    });
    
    this.filteredList = ko.computed(function(){
        var query_lowercase = self.query().toLowerCase();
        if(!query_lowercase) {
            self.areaList().forEach(function(are) {
                are.visible(true);
            });
            return self.areaList();
        }else {
            return ko.utils.arrayFilter(self.areaList(), function(are) {
                var name_lowercase = are.name().toLowerCase();
                var res = name_lowercase.search(query_lowercase) >= 0;
                are.visible(res);
                return res;
            });
        }
    }, self);
    

}

/** Initial map function**/
function initMap() {
    
    var ann_arbor = {lat: 42.2808256, lng: -83.74303780000002};
    map = new google.maps.Map(document.getElementById('map'), {
        center: ann_arbor,
        zoom: 15,
    });

    ko.applyBindings(new ViewModel());
    
}

function errorOnLoad() {
    alert('Error: Unable to Load Google Maps API');
}
