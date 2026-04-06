// Store station data after the API call so we can redraw
let stationData = [];

// Define your zoom threshold
const ZOOM_THRESHOLD = 15;

let colorMap = {
  NORMAL: "green",
  LOW: "orange",
  EMPTY: "red",
  COMING_SOON: "yellow",
  OUT_OF_ORDER: "darkblue"
};

// Update the legend's innerHTML with the last updated time and station count.
function updateLegend(time, stationCount) {
  document.querySelector(".legend").innerHTML = [
    "<p class='healthy'>Healthy Stations: " + stationCount.NORMAL + "</p>",
    "<p class='low'>Low Stations: " + stationCount.LOW + "</p>",
    "<p class='empty'>Empty Stations: " + stationCount.EMPTY + "</p>",
    "<p class='coming-soon'>Stations Coming Soon: " + stationCount.COMING_SOON + "</p>",
    "<p class='out-of-order'>Out of Order Stations: " + stationCount.OUT_OF_ORDER + "</p>",
    "<p>Updated: " + moment.unix(time).format("h:mm:ss A") + "</p>",
  ].join("");
}

// Create the tile layer that will be the background of our map.
let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

//Initialize all the LayerGroups that we'll use.
let layers = {
  COMING_SOON: new L.LayerGroup(),
  EMPTY: new L.LayerGroup(),
  LOW: new L.LayerGroup(),
  NORMAL: new L.LayerGroup(),
  OUT_OF_ORDER: new L.LayerGroup()
};

// Create the map with our layers.
let map = L.map("map-id", {
  center: [40.75, -73.97],
  zoom: 12,
  maxZoom: 16,
  layers: [
    layers.NORMAL,
    layers.LOW,
    layers.EMPTY,
    layers.COMING_SOON,
    layers.OUT_OF_ORDER
  ],
  maxBounds: L.latLngBounds(L.latLng(40.477, -74.259), L.latLng(40.93, -73.700)),
  preferCanvas: true
});

// Add our "streetmap" tile layer to the map.
streetmap.addTo(map);

// Create an overlays object to add to the layer control.
let overlays = {
  "Healthy Stations": layers.NORMAL,
  "Low Stations": layers.LOW,
  "Empty Stations": layers.EMPTY,
  "Coming Soon": layers.COMING_SOON,
  "Out of Order": layers.OUT_OF_ORDER
};

// Create a control for our layers, and add our overlays to it.
L.control.layers(null, overlays).addTo(map);

// Create a legend to display information about our map.
let info = L.control({
  position: "bottomright"
});

// When the layer control is added, insert a div with the class of "legend".
info.onAdd = function() {
  let div = L.DomUtil.create("div", "legend");
  return div;
};
// Add the info legend to the map.
info.addTo(map);

// Initialize an object that contains icons for each layer group.
let icons = {
  COMING_SOON: L.ExtraMarkers.icon({
    icon: "ion-settings",
    iconColor: "white",
    markerColor: "yellow",
    shape: "star"
  }),
  EMPTY: L.ExtraMarkers.icon({
    icon: "ion-android-bicycle",
    iconColor: "white",
    markerColor: "red",
    shape: "circle"
  }),
  OUT_OF_ORDER: L.ExtraMarkers.icon({
    icon: "ion-minus-circled",
    iconColor: "white",
    markerColor: "blue-dark",
    shape: "penta"
  }),
  LOW: L.ExtraMarkers.icon({
    icon: "ion-android-bicycle",
    iconColor: "white",
    markerColor: "orange",
    shape: "circle"
  }),
  NORMAL: L.ExtraMarkers.icon({
    icon: "ion-android-bicycle",
    iconColor: "white",
    markerColor: "green",
    shape: "circle"
  })
};


function renderMarkers() {
  let currentZoom = map.getZoom();

  // Clear all layers
  Object.values(layers).forEach(layer => layer.clearLayers());

  stationData.forEach(({ station, stationStatusCode }) => {
    let newMarker;

    if (currentZoom >= ZOOM_THRESHOLD) {
      // Use ExtraMarkers icons when zoomed in
      newMarker = L.marker([station.lat, station.lon], {
        icon: icons[stationStatusCode]
      });
    } else {
      // Use circleMarkers when zoomed out
      newMarker = L.circleMarker([station.lat, station.lon], {
        radius: 6,
        fillColor: colorMap[stationStatusCode],
        color: "#fff",
        weight: 1,
        fillOpacity: 0.8
      });
    }

    // Build popup HTML
    let htmlString = `
      <div class="marker-content">
        <h3>${station.name}</h3>
        <div class="available-content">
          ${stationStatusCode !== "COMING_SOON" && stationStatusCode !== "OUT_OF_ORDER" ? `
          <div><span class="label">E-Bikes Available:</span> ${station.num_ebikes_available}</div>
          <div><span class="label">Classic Bikes Available:</span> ${station.num_bikes_available - station.num_ebikes_available}</div>
          <div><span class="label">Docks Available:</span> ${station.num_docks_available}</div>
          ` : `<div style="text-align: center;"><span class="label">${stationStatusCode.split("_").join(" ")}</span></div>`}
        </div>
      </div>
    `;

    newMarker.bindPopup(htmlString);
    newMarker.addTo(layers[stationStatusCode]);
  });
}

// Listen for zoom changes
map.on("zoomend", renderMarkers);


// Perform an API call to the Citi Bike station information endpoint.
d3.json("https://gbfs.lyft.com/gbfs/2.3/bkn/en/station_information.json").then(function(infoRes) {

  // When the first API call completes, perform another call to the Citi Bike station status endpoint.
  d3.json("https://gbfs.lyft.com/gbfs/2.3/bkn/en/station_status.json").then(function(statusRes) {
    let updatedAt = infoRes.last_updated;
    let stationStatus = statusRes.data.stations;
    let stationInfo = infoRes.data.stations;

    // Build a lookup map from status array keyed by station_id
    let statusMap = {};
    for (const s of stationStatus) {
      statusMap[s.station_id] = s;
    }

    // Create an object to keep the number of markers in each layer.
    let stationCount = {
      COMING_SOON: 0,
      EMPTY: 0,
      LOW: 0,
      NORMAL: 0,
      OUT_OF_ORDER: 0
    };

    // Initialize stationStatusCode, which will be used as a key to access the appropriate layers, icons, and station count for the layer group.
    let stationStatusCode;

    // Loop through the stations (they're the same size and have partially matching data).
    for (let i = 0; i < stationInfo.length; i++) {
      let info = stationInfo[i];

      // Look up the matching status by station_id instead of by index
      let status = statusMap[info.station_id];

      // Skip if no matching status found
      if (!status) continue;
      // Create a new station object with properties of both station objects.
      let station = Object.assign({}, info, status);
      // If a station is listed but not installed, it's coming soon.
      if (!station.is_installed) {
        stationStatusCode = "COMING_SOON";
      }
      // If a station has no available bikes, it's empty.
      else if (!station.num_bikes_available) {
        stationStatusCode = "EMPTY";
      }
      // If a station is installed but isn't renting, it's out of order.
      else if (station.is_installed && !station.is_renting) {
        stationStatusCode = "OUT_OF_ORDER";
      }
      // If a station has less than five bikes, it's status is low.
      else if (station.num_bikes_available < 5) {
        stationStatusCode = "LOW";
      }
      // Otherwise, the station is normal.
      else {
        stationStatusCode = "NORMAL";
      }

      // Update the station count.
      stationCount[stationStatusCode]++;
      // Push to stationData instead of directly creating markers
      stationData.push({ station, stationStatusCode });

    }

    // Call the updateLegend function, which will update the legend!
    renderMarkers();
    updateLegend(updatedAt, stationCount);
  });
});
