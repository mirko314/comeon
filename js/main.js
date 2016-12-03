
var map;

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    latlon = new google.maps.LatLng(lat, lon)
    mapholder = document.getElementById('mapholder')
    console.log($(window.top).height() - $(".user-input").height());
    mapholder.style.height = $(window.top).height() - $(".user-input").height() + "px"
    mapholder.style.width =  $(document).width()

    var myOptions = {
    center:latlon,zoom:14,
    mapTypeId:google.maps.MapTypeId.ROADMAP,
    mapTypeControl:false,
    navigationControlOptions:{style:google.maps.NavigationControlStyle.SMALL}
    }

    var map = new google.maps.Map(document.getElementById("mapholder"), myOptions);
    var marker = new google.maps.Marker({position:latlon,map:map,title:"You are here!"});
}
function makeMarker(lat, lon){

  var marker = new google.maps.Marker({position:{lat: lat, lng: lon},map:map,title:"You are here!"});
}
function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            x.innerHTML = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            x.innerHTML = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            x.innerHTML = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            x.innerHTML = "An unknown error occurred."
            break;
    }
}


$.postJSON = function(url, data, callback) {
    return jQuery.ajax({
        'type': 'POST',
        'url': url,
        'contentType': 'application/json',
        'data': data,
        'dataType': 'json',
        'success': callback
    });
};

function getLocationData(){
  $.postJSON( "https://api.graph.cool/simple/v1/ciw93mn3u12ag0171fuupvn01", '{"query":"query {allUsers {id positions {  lat lon}}}"}', function (data) {
    console.log(data.data)
    var users = data.data.allUsers;
    users.map(function (element) {
      makeMarker(element.positions[0].lat, element.positions[0].lon)
    })

  } );

  //ttps://api.graph.cool/simple/v1/ciw93mn3u12ag0171fuupvn01' -H 'content-type: application/json' --data-binary '{"query":"query {allUsers {id name}}"}' --compressed
}
$( document ).ready(function() {
  getLocation();
  getLocationData();

  var service = new google.maps.places.AutocompleteService();
  var geocoder = new google.maps.Geocoder();

  $("#DestinationInput").typeahead({
    source: function(query, process) {
      service.getPlacePredictions({ input: query }, function(predictions, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          process($.map(predictions, function(prediction) {
            return prediction.description;
          }));
        }
      });
    },
    updater: function (item) {
      geocoder.geocode({ address: item }, function(results, status) {
        if (status != google.maps.GeocoderStatus.OK) {
          alert('Cannot find address');
          return;
        }
        map.setCenter(results[0].geometry.location);
        map.setZoom(12);
      });
      return item;
    }
  });
});
