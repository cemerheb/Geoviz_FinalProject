var map = L.map('map', { center: [39.981192, -75.155399], zoom: 10 });
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '© OpenStreetMap' }).addTo(map);
                
        var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY2VtZXJoZWIiLCJhIjoiY2xvN3F4dzJjMDdpdjJrcXB6N200c3k4OCJ9.u4H1gF8bOUE4vBqLR3cWSQ';
                    
        var grayscale   = L.tileLayer(mbUrl, {id: 'mapbox/light-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr}),
                    streets  = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr});

var baseMaps = {
    "grayscale": grayscale,
    "streets": streets
};

// Initialize layer control
var layerControl = L.control.layers(baseMaps).addTo(map);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '© OpenStreetMap' }).addTo(map);
map.doubleClickZoom.disable();
    
// Create an Empty Popup
var popup = L.popup();
    
// Write function to set Properties of the Popup
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

// Listen for a click event on the Map element
map.on('click', onMapClick);
            
// Set function for color ramp for poverty layer
function setColorFunc(density){
    return density > 70 ? '#e60000' :
        density > 40 ? '#ff1a1a' :
        density > 30 ? '#ff4d4d' :
        density > 20 ? '#ff8080' :
        density > 10 ? '#ffb3b3' :
        density > 0 ? '#ffe5e5' :
                        '#BFC9CA';
};

// Set style function that sets fill color property equal to percentage below poverty
function styleFunc(feature) {
    return {
        fillColor: setColorFunc(feature.properties.per_below),
        fillOpacity: 0.5,
        weight: 1,
        opacity: 0,
        color: '#ffffff',
        dashArray: '3'
    };
}

// Set function for color ramp for no food access
function setColorFuncfoodaccess(density){
    return density == 'No Access' ? '#521414' :
        density == 'Low Access' ? '#9b2727' : '#000000';
};

// Set style function that sets fill color property equal to ACCESS_
function styleFuncfoodaccess(feature) {
    return {
        fillColor: setColorFuncfoodaccess(feature.properties.ACCESS_),
        fillOpacity: 0.5,
        weight: 1,
        opacity: 0,
        color: '#ffffff',
        dashArray: '3'
    };
}

// Set function for color ramp for vacant lands
function setColorFuncvacantlands(density){
    return '#2e6b38';
};

// Set style function that sets fill color property equal to OBJECTID
function styleFuncvacantlands(feature) {
    return {
        fillColor: setColorFuncvacantlands(feature.properties.OBJECTID),
        fillOpacity: 0.7,
        weight: 1,
        opacity: 0,
        color: '#ffffff',
        dashArray: '1'
    };
}

// Set function for color ramp for vacant buildings
function setColorFuncvacantb(density){
    return '#85e094';
};

// Set style function that sets fill color property equal to OBJECTID
function styleFuncvacantb(feature) {
    return {
        fillColor: setColorFuncvacantb(feature.properties.OBJECTID),
        fillOpacity: 0.7,
        weight: 1,
        opacity: 0,
        color: '#ffffff',
        dashArray: '1'
    };
}

// Set function for color ramp for gardens
function setColorFuncgarden(density){
    return '#28f67a';
};

// Set style function that sets fill color property equal to OBJECTID
function styleFuncgarden(feature) {
    return {
        fillColor: setColorFuncgarden(feature.properties.Id),
        fillOpacity: 0.5,
        weight: 1,
        opacity: 0,
        color: '#ffffff',
        dashArray: '1'
    };
}

// Now Defining functions for mouse hovering
function highlightFeature(e){
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
    // for different web browsers
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

// Define what happens on mouseout:
function resetHighlight(e) {
    neighborhoodsLayer.resetStyle(e.target);
}

// As an additional touch, let’s define a click listener that zooms to the state: 
function zoomFeature(e){
    console.log(e.target.getBounds());
    map.fitBounds(e.target.getBounds().pad(1.5));
}

// Now we’ll use the onEachFeature option to add the listeners on our state layers:
function onEachFeatureFunc(feature, layer){
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomFeature
    });
    layer.bindPopup('Percentage below poverty: '+feature.properties.per_below);
}

// Initialize layer control
var overlayLayers = {};

// Array of GeoJSON file names and corresponding style functions
var geojsonFiles = ["Poverty.geojson", "NoFoodAccessAreas.geojson", "VacantLands.geojson", "VacantBuildings.geojson", "ActiveGardenOrFarm.geojson"];
var styleFunctions = [styleFunc, styleFuncfoodaccess, styleFuncvacantlands, styleFuncvacantb, styleFuncgarden];

// Load GeoJSON files dynamically
for (var i = 0; i < geojsonFiles.length; i++) {
    loadGeoJSON(geojsonFiles[i], styleFunctions[i]);
}

function loadGeoJSON(geojsonFile, styleFunc) {
    $.getJSON(geojsonFile, function (data) {
        var layer;

        // Check if the data is a Point or a different geometry type
        if (data.features && data.features.length > 0 && data.features[0].geometry.type === 'Point') {
            // Create circle markers for each point
            layer = L.geoJSON(data, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, {
                        radius: 10, // Adjust the radius as needed
                        fillColor: '#28f67a', // Set the fill color
                        color: '#28f67a', // Set the border color
                        weight: 1, // Set the border weight
                        opacity: 1, // Set the opacity
                        fillOpacity: 0.8 // Set the fill opacity
                    });
                },
                onEachFeature: onEachFeatureFunc // Assuming you have an onEachFeature function defined
            });
        } else {
            // For other geometry types, use default styling
            layer = L.geoJSON(data, {
                style: styleFunc,
                onEachFeature: onEachFeatureFunc // Assuming you have an onEachFeature function defined
            });
        }

        // Add the layer to the map
        layer.addTo(map);

        // Update the layer control with the new layer
        layerControl.addOverlay(layer, geojsonFile);
    });
}



// Add Scale Bar to Map
L.control.scale({position: 'bottomleft'}).addTo(map);

// Create Leaflet Control Object for Legend
var legend = L.control({position: 'bottomright'});

// Function that runs when legend is added to map
legend.onAdd = function (map) {
    // Create Div Element and Populate it with HTML
    var div = L.DomUtil.create('div', 'legend');            
    div.innerHTML += '<b>Percentage of people below poverty limit</b><br />';
    div.innerHTML += 'by census tract<br />';
    div.innerHTML += '<i style="background: #e60000"></i><p>50+</p>';
    div.innerHTML += '<i style="background: #ff1a1a"></i><p>40-50</p>';
    div.innerHTML += '<i style="background: #ff4d4d"></i><p>30-40</p>';
    div.innerHTML += '<i style="background: #ff8080"></i><p>20-30</p>';
    div.innerHTML += '<i style="background: #ffb3b3"></i><p>10-20</p>';
    div.innerHTML += '<i style="background: #ffe5e5"></i><p>0-10</p>';
    div.innerHTML += '<i style="background: #BFC9CA"></i><p>No Data</p>';
    div.innerHTML += '<hr>';
    div.innerHTML += '<b>Food Access Conditions</b><br />';
    div.innerHTML += '<i style="background: #521414"></i><p>No Access</p>';
    div.innerHTML += '<i style="background: #9b2727"></i><p>Low Access</p>';
    div.innerHTML += '<hr>';
    div.innerHTML += '<b>Potential Locations for Urban Agriculture</b><br />';
    div.innerHTML += '<i style="background: #2e6b38"></i><p>Vacant Lands</p>';
    div.innerHTML += '<i style="background: #85e094"></i><p>Vacant Buildings</p>'
    div.innerHTML += '<hr>';
    div.innerHTML += '<b>Existing Locations for Urban Agriculture</b><br />';

    // Add marker for points (assuming you have a variable 'pointLayer' for the point layer)
    addLegendItem(div, 'circle', 'Active Gardens');
    
    
    // Return the Legend div containing the HTML content
    return div;
};

// Helper function to add legend items with color boxes, markers, or images
function addLegendItem(parent, markerOrColor, label) {
    var item = document.createElement('div');
    var key = document.createElement('span');
    key.className = 'legend-key';

    // Check if the markerOrColor is a string
    if (typeof markerOrColor === 'string') {
        if (markerOrColor === 'circle') {
            // Create a circle marker icon
            key.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="15" cy="12" r="8" fill="#28f67a" stroke="#28f67a" stroke-width="1" /></svg>';
        } else if (markerOrColor === 'location-pin') {
            // Create an inline SVG for the location pin
            key.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 2" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="1" cy="1" r="2"/><path d="M12 16s-4-1-4-4v-4s0-2 4-2 4 1 4 2v4s0 3-4 4z"/></svg>';
        } else {
            // Handle other cases or provide a default behavior
            // Create an image element for the custom marker
            var img = document.createElement('img');
            img.src = markerOrColor;
            key.appendChild(img);
        }
    } else {
        // For other cases, use a colored box or custom marker
        key.style.background = markerOrColor;
    }

    var value = document.createElement('span');
    value.innerHTML = label + ' ';
    item.appendChild(key);
    item.appendChild(value);
    parent.appendChild(item);
}

// Add Legend to Map
legend.addTo(map);