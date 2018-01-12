/* global variables*/
var map;
var client_id = "WA0FIZATTHTFACN00QZYRSGI4I1EACJVBCSFHRNRDCNDQDEA";
var client_secret = "RZX3DBPHBMPNR3KYGZ3RRGWZOX3NH2RU1YEC2FRJ4DFSYUSJ";
var defaultIcon;
var highlightedIcon;

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

/** Initial map function**/
function startApp() {

    ko.applyBindings(new ViewModel());
    
}

function errorOnLoad() {
    alert('Error: Unable to Load Google Maps API');
}

function ViewModel(){
    var self = this;
    
    this.markers = [];
    this.query = ko.observable("");
    
    // function called when the marker is clicked
    this.showInfoWindow = function(marker, info_window) {
        if (info_window.marker != marker) {
            info_window.setContent('');
            info_window.marker = marker;
            
            // URL for Foursquare API
            var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll=' +
                marker.lat + ',' + marker.lng + '&client_id=' + client_id +
                '&client_secret=' + client_secret + '&query=' + marker.title +
                '&v=20180111' + '&m=foursquare';
            
            // get location info from Foursquare API
            $.getJSON(foursquareURL).done(function(marker) {
                
                var response = marker.response.venues[0];
                self.name = response.name;
                self.street = response.location.formattedAddress[0];
                self.city = response.location.formattedAddress[1];
                //self.zip = response.location.formattedAddress[3];
                //self.country = response.location.formattedAddress[4];
                self.category = response.categories[0].shortName;
                self.stringContent =
                    '<div>' + '<h4>' + self.name +'</h4>' +
                    '<h5>(' + self.category +
                    ')</h5>' + '<div>' +
                    '<h6> Address: </h6>' +
                    '<p>' + self.street + '</p>' +
                    '<p>' + self.city + '</p>' +
                    '</p>' + '</div>' + '</div>';

                info_window.setContent(self.stringContent);
            }).fail(function() {
                alert(
                    "There was an issue loading the Foursquare API. Please refresh your page to try again."
                );
            });

            info_window.open(map, marker);

            info_window.addListener('closeclick', function() {
                info_window.marker = null;
            });
        }
    };
    
    this.show_bounce_marker = function() {
        
        self.showInfoWindow(this, self.infoWindow);
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout((function() {
            this.setAnimation(null);
        }).bind(this), 2100);
    };
    
    this.initMap = function() {
        
        var ann_arbor = {lat: 42.2808256, lng: -83.74303780000002};
        // Map constructor
        map = new google.maps.Map(document.getElementById('map'), {
            center: ann_arbor,
            zoom: 15,
        });
        
        // Create infoWindow
        this.infoWindow = new google.maps.InfoWindow();
        for(var i = 0; i < initial_area.length; i++) {
            this.lat = initial_area[i].lat;
            this.lng = initial_area[i].lng
            // Setup markers
            this.marker = new google.maps.Marker({
                map: map,
                position: new google.maps.LatLng(this.lat, this.lng),
                lat: this.lat,
                lng: this.lng,
                title: initial_area[i].name,
                id: i,
                animation: google.maps.Animation.DROP
            });
            
            this.marker.setMap(map);
            this.markers.push(this.marker);
            this.marker.addListener('click', self.show_bounce_marker);
        }
    };
    
    this.initMap();
    
    this.queryResults = ko.computed(function() {
        var result = [];
        for (var i = 0; i < this.markers.length; i++) {

            if (this.markers[i].title.toLowerCase().includes(this.query().toLowerCase())) {
                result.push(this.markers[i]);
                this.markers[i].setVisible(true);
            } else {
                this.markers[i].setVisible(false);
            }
        }
        return result;
    }, this);
}
