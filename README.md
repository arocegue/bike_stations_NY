# NYC Citi Bike Station Availability Map

An interactive mapping application that visualizes NYC Citi Bike station availability using live GBFS data. This project combines **D3.js** for API requests and data handling with **Leaflet.js** for map rendering, custom markers, layer controls, and station detail popups.

## Overview

This project displays Citi Bike station locations across New York City and categorizes each station by operational status and bike availability. Users can click any station marker to view real-time station details, including:

- Available e-bikes
- Available classic bikes
- Available docks
- Station status

The application consumes two Citi Bike GBFS endpoints:

- `station_information.json`
- `station_status.json`

These two datasets are merged by `station_id` to combine location metadata with live bike and dock availability. This approach ensures the data is joined reliably by key rather than assuming both API responses arrive in the same order.

## Features

- Interactive **Leaflet** map using **OpenStreetMap** tiles
- Live Citi Bike station data from GBFS feeds
- Custom marker icons by station status
- Marker popups with station-level availability details
- Layer control to toggle station categories on and off
- Legend showing station counts by category
- Last updated timestamp displayed on the map
- Geographic bounds constrained to the NYC area

## Station Categories

Stations are classified into the following categories:

- **Healthy Stations** – station has 5 or more bikes available
- **Low Stations** – station has fewer than 5 bikes available
- **Empty Stations** – station has 0 bikes available
- **Coming Soon** – station is listed but not yet installed
- **Out of Order** – station is installed but not currently renting bikes

## Tech Stack

- **HTML5**
- **CSS3**
- **JavaScript**
- **D3.js**
- **Leaflet.js**
- **Leaflet Extra Markers**
- **Moment.js**
- **OpenStreetMap tiles**

## Data Sources

Live Citi Bike data is retrieved from:

- `https://gbfs.lyft.com/gbfs/2.3/bkn/en/station_information.json`
- `https://gbfs.lyft.com/gbfs/2.3/bkn/en/station_status.json`

## How It Works

1. The app requests station metadata from `station_information.json`
2. It requests live availability data from `station_status.json`
3. It builds a lookup object keyed by `station_id`
4. It merges the corresponding station records into a unified object
5. Each station is classified into one of five status groups
6. A Leaflet marker is created and added to the matching layer group
7. Popups display real-time bike and dock details for each station
8. The legend updates to show totals for each category and the latest refresh time

## Why This Project Matters

This project demonstrates practical front-end engineering skills that are useful in real-world data visualization and mapping applications, including:

- Working with live third-party APIs
- Merging and transforming related datasets
- Building interactive geospatial visualizations
- Creating a clear user experience with filtering, legends, and status indicators
- Translating raw operational data into a user-friendly interface


## Potential Enhancements

There are several ways this project could be expanded in the future:

- Add a search feature to quickly locate stations by name
- Add filters for e-bikes only, classic bikes only, or dock availability
- Implement automatic refresh intervals so station availability updates without reloading the page
- Add marker clustering to improve performance and readability in dense areas
- Improve mobile responsiveness for smaller screens
- Add a summary dashboard showing total available bikes, docks, and station counts across the city
- Display more detailed station health insights, such as the percentage of empty or low-availability stations
- Allow users to focus on a borough or custom region of the map

## What I Learned

Through this project, I strengthened my skills in:

- Consuming live third-party API data and working with multiple endpoints
- Merging related datasets using a shared key (`station_id`) for reliable data mapping
- Building interactive geospatial visualizations with Leaflet
- Using D3.js to request and process real-time JSON data
- Designing a user-friendly data visualization experience with markers, popups, legends, and map layers
- Translating raw operational data into meaningful categories that are easy for users to understand
- Structuring front-end JavaScript logic to support dynamic rendering and clear UI behavior

## Folder Structure

```bash
bike_stations_NY/
├── index.html
├── README.md
└── static/
    ├── css/
    │   ├── leaflet.extra-markers.min.css
    │   └── style.css
    └── js/
        ├── leaflet.extra-markers.min.js
        └── logic.js