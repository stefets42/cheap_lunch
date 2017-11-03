var map;

// Create a new blank array for all the listing markers.
var markers = [];

// This global polygon variable is to ensure only ONE polygon is rendered.
var polygon = null;

function initMap() {
  // Create a styles array to use with the map.
  var styles = [
    {
          featureType: "administrative",
          elementType: "labels.text",
          stylers: [
              {
                  hue: "#48607a"
              },
              {
                  saturation: 7
              },
              {
                  lightness: 19
              },
              {
                  visibility: "on"
              }
          ]
      },      
      {
          featureType: "landscape",
          elementType: "all",
          stylers: [
              {
                  "hue": "#ffffff"
              },
              {
                  "saturation": -100
              },
              {
                  "lightness": 100
              },
              {
                  "visibility": "simplified"
              }
          ]
      },
      {
          featureType: "poi",
          elementType: "all",
          stylers: [
              {
                  "hue": "#ffffff"
              },
              {
                  "saturation": -100
              },
              {
                  "lightness": 100
              },
              {
                  "visibility": "off"
              }
          ]
      },
      {
          featureType: "road",
          elementType: "geometry",
          stylers: [
              {
                  "hue": "#8194ac"
              },
              {
                  "saturation": -93
              },
              {
                  "lightness": 66
              },
              {
                  "visibility": "simplified"
              }
          ]
      },
      {
          featureType: "road",
          elementType: "labels",
          stylers: [
              {
                  "hue": "#48607a"
              },
              {
                  "saturation": -93
              },
              {
                  "lightness": 31
              },
              {
                  "visibility": "off"
              }
          ]
      },
      {
          featureType: "transit",
          elementType: "all",
          stylers: [
              {
                  "hue": "#8194ac"
              },
              {
                  "saturation": 10
              },
              {
                  "lightness": 69
              },
              {
                  "visibility": "off"
              }
          ]
      },
      {
          featureType: "water",
          elementType: "all",
          stylers: [
              {
                  "hue": "#6bc6b0"
              },
              {
                  "saturation": -22
              },
              {
                  "lightness": 22
              },
              {
                  "visibility": "on"
              }
          ]
      }
  ];

  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 48.8564826, lng: 2.3502195},
    zoom: 12,
    styles: styles,
    mapTypeControl: false
  });

  // These are the restaurants listings that will be shown to the user.
  // Normally we'd have these in a database instead.
  var locations = [
    {title: 'Mandoobar', location: {lat: 48.8793019, lng: 2.3189615}, where: "7 rue d'Édimbourg 75008 Paris"},
    {title: 'Le Bouche à Bouche', location: {lat: 48.8764377, lng: 2.3361796}, where: "7 rue d'Édimbourg 75008 Paris"},
    {title: 'Braun Notes', location: {lat: 48.8758014, lng: 2.3288371}, where: "7 rue d'Édimbourg 75008 Paris"},
    {title: 'ISANA', location: {lat: 48.8765267, lng: 2.336347}, where: "7 rue d'Édimbourg 75008 Paris"},
    {title: 'So Nat', location: {lat: 48.8764377, lng: 2.3361796}, where: "7 rue d'Édimbourg 75008 Paris"},
    {title: 'Café Nata', location: {lat: 48.8742191, lng: 2.3307982}, where: "7 rue d'Édimbourg 75008 Paris"},
    {title: 'Milton', location: {lat: 48.8767783, lng: 2.3384985}, where: "7 rue d'Édimbourg 75008 Paris"},
    {title: 'Des cocottes et du gratin', location: {lat: 48.8755767, lng: 2.3382985}, where: "7 rue d'Édimbourg 75008 Paris"},
    {title: 'God Save The Fish', location: {lat: 48.875545, lng: 2.3418149}, where: "7 rue d'Édimbourg 75008 Paris"}
  ];

  var largeInfowindow = new google.maps.InfoWindow();

  // Initialize the drawing manager.
  var drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.POLYGON,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_LEFT,
      drawingModes: [
        google.maps.drawing.OverlayType.POLYGON
      ]
    }
  });

  // Style the markers a bit. This will be our listing marker icon.
  var defaultIcon = makeMarkerIcon('e6546e');

  // Create a "highlighted location" marker color for when the user
  // mouses over the marker.
  var highlightedIcon = makeMarkerIcon('6bc6b0');

  // The following group uses the location array to create an array of
  // markers on initialize.
  for (var i = 0; i < locations.length; i++) {
    // Get the position from the location array.
    var position = locations[i].location;
    var title = locations[i].title;
    var address = locations[i].where;
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      address: address,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      id: i
    });
    // Push the marker to our array of markers.
    markers.push(marker);
    // Create an onclick event to open the large infowindow at each marker.
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });
    // Two event listeners - one for mouseover, one for mouseout,
    // to change the colors back and forth.
    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });
  }

  document.getElementById('toggle-drawing').addEventListener('click', function() {
    toggleDrawing(drawingManager);
  });

  // Add an event listener so that the polygon is captured,  call the
  // searchWithinPolygon function. This will show the markers in the polygon,
  // and hide any outside of it.
  drawingManager.addListener('overlaycomplete', function(event) {
    // First, check if there is an existing polygon.
    // If there is, get rid of it and remove the markers
    if (polygon) {
      polygon.setMap(null);
      hideListings(markers);
    }
    // Switching the drawing mode to the HAND (i.e., no longer drawing).
    drawingManager.setDrawingMode(null);
    // Creating a new editable polygon from the overlay.
    polygon = event.overlay;
    polygon.setEditable(true);
    // Searching within the polygon.
    searchWithinPolygon();
    // Make sure the search is re-done if the poly is changed.
    polygon.getPath().addListener('set_at', searchWithinPolygon);
    polygon.getPath().addListener('insert_at', searchWithinPolygon);
  });
}

  // This function populates the infowindow when the marker is clicked. We'll only allow
  // one infowindow which will open at the marker that is clicked, and populate based
  // on that markers position.
  function populateInfoWindow(marker, infowindow) {
      // Check to make sure the infowindow is not already opened on this marker.
      if (infowindow.marker != marker) {
          // Clear the infowindow content to give the streetview time to load.
          infowindow.setContent('');
          infowindow.marker = marker;
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
              infowindow.marker = null;
          });
          var streetViewService = new google.maps.StreetViewService();
          var radius = 40;
          // In case the status is OK, which means the pano was found, compute the
          // position of the streetview image, then calculate the heading, then get a
          // panorama from that and set the options
          function getStreetView(data, status) {
              if (status == google.maps.StreetViewStatus.OK) {
                  var nearStreetViewLocation = data.location.latLng;
                  var heading = google.maps.geometry.spherical.computeHeading(
                      nearStreetViewLocation, marker.position);
                  infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                  var panoramaOptions = {
                      position: nearStreetViewLocation,
                      pov: {
                          heading: heading,
                          pitch: 20
                      }
                  };
                  var panorama = new google.maps.StreetViewPanorama(
                      document.getElementById('pano'), panoramaOptions);
              } else {
                  infowindow.setContent('<div>' + marker.title + '</div>' +
                      '<div>No Street View Found</div>');
              }
          }
          // Use streetview service to get the closest streetview image within
          // 40 meters of the markers position
          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
          // Open the infowindow on the correct marker.
          infowindow.open(map, marker);
      }
  }

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
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

// This shows and hides (respectively) the drawing options.
function toggleDrawing(drawingManager) {
  if (drawingManager.map) {
    drawingManager.setMap(null);
    // In case the user drew anything, get rid of the polygon
    if (polygon !== null) {
      polygon.setMap(null);
    }
  } else {
    drawingManager.setMap(map);
  }
}

// This function hides all markers outside the polygon, and shows only the ones
// within it. This is so that the user can specify an exact area of search.
function searchWithinPolygon() {
  for (var i = 0; i < markers.length; i++) {
    if (google.maps.geometry.poly.containsLocation(markers[i].position, polygon)) {
      markers[i].setMap(map);
    } else {
      markers[i].setMap(null);
    }
  }
}
