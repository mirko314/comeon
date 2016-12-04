var map;
var friends = [];
var location;
var friendsInRadius = [];
var updateTimer;

var ownLocation = "";
const radius = 2;
var userid = findGetParameter("userid")
function getLocation(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (pos) {
          showPosition(pos);
          callback();
        }, showError);

    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    location.lat = position.coords.latitude;
    location.lon = position.coords.longitude
    latlon = new google.maps.LatLng(lat, lon)
    mapholder = document.getElementById('mapholder')
    //console.log($(window.top).height() - $(".user-input").height());
    mapholder.style.height = $(window.top).height() - $(".top-part").height() + "px"
    mapholder.style.width =  $(document).width()

    var myOptions = {
    center:latlon,
    zoom:12,
    mapTypeId:google.maps.MapTypeId.ROADMAP,
    mapTypeControl:false,
    navigationControlOptions:{style:google.maps.NavigationControlStyle.SMALL}
    }

    map = new google.maps.Map(document.getElementById("mapholder"), myOptions);
    var OwnMarker = new google.maps.Marker({position:latlon,map:map,title:"You are here!"});

    var circle = new google.maps.Circle({
      map: map,
      radius: radius*1000,    // 10 miles in metres
      fillColor: '#AA0000'
    });
    circle.bindTo('center', OwnMarker, 'position');

    $.postJSON( "https://api.graph.cool/simple/v1/ciw93mn3u12ag0171fuupvn01", `{"query": "mutation b {createPosition(userId :\\"${userid}\\", lat:${lat}, lon:${lon}) {id}}"}`, function (data) {
    })
}
function makeMarker(lat, lon){

  new google.maps.Marker({position:{lat: lat, lng: lon},map:map,title:"You are here!"});
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
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
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
function UserIsInFriends(id){
  var found = false
  friendsInRadius.forEach(function (friend) {
    if(friend.id ==  id)
      found = true;
  })
  return found;
}
function updateFriendCount(count){
  if (count === 0)
    $("#friends").text("Nobody nearby 😟")
  else if( count === 1)
    $("#friends").text("One person nearby 😉")
  else
    $("#friends").text(count + " people nearby 😮")
}
function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
    .substr(1)
        .split("&")
        .forEach(function (item) {
        tmp = item.split("=");
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    });
    return result;
}
function addDestination(destination, userid) {
  $.postJSON( "https://api.graph.cool/simple/v1/ciw93mn3u12ag0171fuupvn01", `{"query": "mutation b {updateUser(destination :\\"${destination}\\", id:\\"${userid}\\") {id, destination}}"}`, function (data) {
    console.log(data);
  })
}
function getDestinations() {
  var counter = 0;
  $.postJSON( "https://api.graph.cool/simple/v1/ciw93mn3u12ag0171fuupvn01", '{"query":"query {allUsers {id url name destination}}"}', function (data) {
    console.log(data.data.allUsers)
    $(".people-list").empty();
    data.data.allUsers.forEach(function (user) {
      if(user.id != userid && user.destination != null && user.destination == ownLocation && UserIsInFriends(user.id) ){
        console.log(user.name + " is going to " + user.destination)
        counter++;
        $(".people-list").append(`
          <label class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input">
            <span class="custom-control-indicator"></span>
            <span class="custom-control-description"><a href="${user.url}">${user.name}</a></span>
          </label>
          `)
      }
    })
    $(".going").text(counter + " going to " + ownLocation);
  })
}
function sendPing(userid, recipient){
  $.postJSON( "https://api.graph.cool/simple/v1/ciw93mn3u12ag0171fuupvn01", '{ "query" : "mutation {createPing(message:"Hi! lets meet",sender:"'+userid+'", recipient:"'+recipient+'"){id}"}', function (data) {
  })
}
var test;
function getPing(userid) {
  console.log(`{"query": "query {allPings(filter: {recipient:"${userid}"}) {id message sender}}"}`);
  $.postJSON( "https://api.graph.cool/simple/v1/ciw93mn3u12ag0171fuupvn01", `{ "query" : "query { allPings(filter: {recipient: \\"${userid}\\"}) { id message sender } }" }`, function (data) {
    data.data.allPings.forEach(function (ping) {
      alert(ping.message)
    })
  })

}
function getLocationData(){
  $.postJSON( "https://api.graph.cool/simple/v1/ciw93mn3u12ag0171fuupvn01", '{"query": "query {allUsers {id positions(orderBy: createdAt_DESC first: 1) {  lat lon}}}"}', function (data) {

    var users = data.data.allUsers;
    console.log(users)
    friends = []
    users.forEach(function(element) {
      console.log(element);
      friends.push(element)
      console.log({lat: element.positions[0].lat, lng: element.positions[0].lon});
      new google.maps.Marker({
        position:
          {lat: element.positions[0].lat, lng: element.positions[0].lon},
        map: map,
        title: "You are here!"
      });
      //makeMarker(element.positions[0].lat, element.positions[0].lon)
    })
    friendsInRadius = users.filter(function (element) {
      return getDistanceFromLatLonInKm(element.positions[0].lat, element.positions[0].lon, location.lat, location.lon) < radius

    })
    updateFriendCount(friendsInRadius.length)
    updateTimer = setInterval(getDestinations, 3000)
  } );

  //ttps://api.graph.cool/simple/v1/ciw93mn3u12ag0171fuupvn01' -H 'content-type: application/json' --data-binary '{"query":"query {allUsers {id name}}"}' --compressed
}
$( document ).ready(function() {
  getLocation(getLocationData);
  getPing(userid);
  var service = new google.maps.places.AutocompleteService();
  var geocoder = new google.maps.Geocoder();


  $("#ridesubmit").click(function () {
    ownLocation = $("#DestinationInput").text();
    addDestination(ownLocation, userid)
    getDestinations();
  });

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
        //map.setCenter(results[0].geometry.location);
        //map.setZoom(12);
      });
      return item;
    }
  });
});
