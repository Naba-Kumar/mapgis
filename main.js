
import './style.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';

import { Map, View } from 'ol';
import OSM from 'ol/source/OSM';
// import {FullScreen, defaults as defaultControls} from 'ol/control.js';
import Control from 'ol/control/Control';
import { Projection, fromLonLat } from 'ol/proj';
import Draw from 'ol/interaction/Draw.js';
import Overlay from 'ol/Overlay.js';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style.js';
import { LineString, Polygon } from 'ol/geom.js';
import { Vector as VectorSource } from 'ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import { getArea, getLength } from 'ol/sphere.js';
import { unByKey } from 'ol/Observable.js';
import MousePosition from 'ol/control/MousePosition.js';
import { format } from 'ol/coordinate.js';
import LayerGroup from 'ol/layer/Group';
import LayerSwitcher from 'ol-layerswitcher';
import { BaseLayerOptions, GroupLayerOptions } from 'ol-layerswitcher';
import GeoJSON from 'ol/format/GeoJSON';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import Icon from 'ol/style/Icon.js';
import XYZ from 'ol/source/XYZ.js';
import axios from 'axios';
import Papa from 'papaparse';
import { fromExtent } from 'ol/geom/Polygon';
import * as turf from '@turf/turf';
import jsPDF from 'jspdf';
import Snap from 'ol/interaction/Snap';
import { fromCircle } from 'ol/geom/Polygon';
import WKT from 'ol/format/WKT.js';
import html2canvas from 'html2canvas';
import ScaleLine from 'ol/control/ScaleLine.js';


const osm = new TileLayer({
  source: new OSM({
    crossOrigin: 'anonymous' // Set crossOrigin attribute
  }),
  title: 'osm',
  name: 'osm'
});


// const source = new VectorSource();

const drsource = new VectorSource({ wrapX: false });
const mrsource = new VectorSource({ wrapX: false });






// Define base layers

const labelLayer = new TileLayer({
  source: new XYZ({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    crossOrigin: 'anonymous' // Set crossOrigin attribute

  }),
  title: 'labelLayer',
  visible: false,
  name: 'labelLayer'
});


var standardLayer = new TileLayer({
  source: new XYZ({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attributions: ['&copy; <a href="https://justpaste.it/redirect/ecx3y/https%3A%2F%2Fwww.esri.com%2Fen-us%2Fhome">Esri</a>'],
    crossOrigin: 'anonymous' // Set crossOrigin attribute

  }),
  title: 'Standard',
  visible: false,
  name: 'standardLayer'
});

var sateliteLayer = new TileLayer({
  source: new XYZ({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attributions: ['&copy; <a href="https://justpaste.it/redirect/ecx3y/https%3A%2F%2Fwww.esri.com%2Fen-us%2Fhome">Esri</a>'],
    crossOrigin: 'anonymous' // Set crossOrigin attribute

  }),
  title: 'satelite',
  visible: false,
  name: 'sateliteLayer'


});

var transportLayer = new TileLayer({
  source: new XYZ({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
    attributions: ['&copy; <a href="https://justpaste.it/redirect/ecx3y/https%3A%2F%2Fwww.esri.com%2Fen-us%2Fhome">Esri</a>'],
    crossOrigin: 'anonymous' // Set crossOrigin attribute

  }),
  title: 'Transport',
  visible: false,
  name: 'transportLayer'

});




const map = new Map({
  layers: [sateliteLayer, osm, standardLayer, transportLayer, labelLayer],
  target: 'map',
  view: new View({
    center: new fromLonLat([92.07298769282396, 26.213469404852535]),
    zoom: 7
  }),
  controls: [],
  keyboardEventTarget: document
});

const worldview = new View({
  center: [0, 0],
  zoom: -2
})

// let scaleLineControl = new ScaleLine({
//   className: "scaleLine",
//   bar:true,
//   // minWidth:1500,
//   maxWidth:140,
//   units: 'metric',
//   steps:6,
//   text:true,
//   target:'scale-line-control',
//   // target: document.getElementById('scale-line-control') // Optional target element to render the scale line
// });
// map.addControl(scaleLineControl);

// const scaleLineControl = new ScaleLine();
// map.addControl(scaleLineControl);
//Custom Home Click functionality Starts....

function customHome(event) {

  // const homeButton = document.getElementById(event);
  const homeCoords = [10300257, 3061038];
  map.getView().setCenter(homeCoords);
  map.getView().setZoom(7); // Optional: Set zoom level for home view
}

window.handleHome = function (event) {
  customHome(event);
};

// Home Click  functionality Ends.....



//Custom Zoom- in  and Zoom-out functionality Starts....

function customZoom(event) {
  console.log(event)
  if (event == "zIn") {
    const view = map.getView();
    const currentZoom = view.getZoom();
    // Adjust zoom step based on your preference (e.g., 0.5)
    const newZoom = currentZoom + 0.5;
    view.setZoom(Math.min(newZoom, view.getMaxZoom())); // Prevent exceeding max zoom
  }
  else if (event == "zOut") {
    const view = map.getView();
    const currentZoom = view.getZoom();
    const newZoom = currentZoom - 0.5;
    view.setZoom(Math.max(newZoom, view.getMinZoom())); // Prevent zooming below min zoom

  }
}

window.handleZoom = function (event) {
  customZoom(event);
};
//Zoom- in  and Zoom-out functionality Ends.....





//Custom Full Screen functionality Starts....

function customFullscreen(event) {
  if (document.fullscreenEnabled) {
    // Fullscreen API is supported
    console.log("full screen supported");

    if (event == "easeIn") {
      function enterFullscreen(element) {
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) { // Webkit prefix
          element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) { // Mozilla prefix
          element.mozRequestFullScreen();
        } else {
          // Handle fallback scenarios (optional)
        }
      }

      // Usage:
      const mapElement = document.getElementById('body');
      enterFullscreen(mapElement);
    } else {
      function exitFullscreen() {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { // Webkit prefix
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) { // Mozilla prefix
          document.mozCancelFullScreen();
        } else {
          // Handle fallback scenarios (optional)
        }
      }
      // Usage:
      exitFullscreen();
    }

  } else {
    // Handle fallback scenarios (optional)
    console.log("full screen not supported");
  }
}

window.handleFullscreen = function (event) {
  customFullscreen(event);
};

// Custom Full Screen functionality Ends.....






// Measure Tool starts here.................

/**
 * Currently drawn feature.
 * @type {import("ol/Feature.js").default}
 */
let sketch;

/**
 * The help tooltip element.
 * @type {HTMLElement}
 */
let helpTooltipElement;

/**
 * Overlay to show the help messages.
 * @type {Overlay}
 */
let helpTooltip;

/**
 * The measure tooltip element.
 * @type {HTMLElement}
 */
let measureTooltipElement;

/**
 * Overlay to show the measurement.
 * @type {Overlay}
 */
let measureTooltip;

/**
 * Message to show when the user is drawing a polygon.
 * @type {string}
 */
const continuePolygonMsg = 'Click to continue drawing the polygon';

/**
 * Message to show when the user is drawing a line.
 * @type {string}
 */
const continueLineMsg = 'Click to continue drawing the line';

/**
 * Handle pointer move.
 * @param {import("ol/MapBrowserEvent").default} evt The event.
 */
const pointerMoveHandler = function (evt) {
  if (evt.dragging) {
    return;
  }
  /** @type {string} */
  let helpMsg = 'Click to start drawing';

  if (sketch) {
    const geom = sketch.getGeometry();
    if (geom instanceof Polygon) {
      helpMsg = continuePolygonMsg;
    } else if (geom instanceof LineString) {
      helpMsg = continueLineMsg;
    }
  }

  helpTooltipElement.innerHTML = helpMsg;
  helpTooltip.setPosition(evt.coordinate);

  helpTooltipElement.classList.remove('hidden');
};



map.on('pointermove', pointerMoveHandler);

map.getViewport().addEventListener('mouseout', function () {
  helpTooltipElement.classList.add('hidden');
});


let Measureraw; // global so we can remove it later

/**
 * Format length output.
 * @param {LineString} line The line.
 * @return {string} The formatted length.
 */

const formatLength = function (line) {
  const length = getLength(line);
  let output;
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
  } else {
    output = Math.round(length * 100) / 100 + ' ' + 'm';
  }
  return output;
};

/**
 * Format area output.
 * @param {Polygon} polygon The polygon.
 * @return {string} Formatted area.
 */
const formatArea = function (polygon) {
  const area = getArea(polygon);
  let output;
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
  } else {
    output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
  }
  return output;
};

const style = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.2)',
  }),
  stroke: new Stroke({
    color: 'rgba(0, 0, 0, 0.5)',
    lineDash: [10, 10],
    width: 5,
  }),
  image: new CircleStyle({
    radius: 5,
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)',
    }),

  }),
});


function customMeasure(event) {

  if (event === 'clear') {

    if (measureTooltipElement) {
      var elem = document.getElementsByClassName("ol-tooltip ol-tooltip-static");
      for (var i = elem.length - 1; i >= 0; i--) {
        elem[i].remove();
      }
    }

    // map.getLayers().forEach(function (measureVector) {

    //   if (measureVector instanceof VectorLayer) {
    //     console.log("measure layer remove");
    //     map.removeLayer(measureVector);
    //   }
    // });
    // Clear the source of the measurement layers
    mrsource.clear();
    measureTooltip.getSource().clear();
    console.log(measureTooltip.getSource())
    return
  }


  map.removeInteraction(shapeDraw);
  sketch = null;
  measureTooltipElement = null;
  createMeasureTooltip();


  const measureVector = new VectorLayer({
    source: mrsource,
    style: {
      'fill-color': 'rgba(255, 255, 255, 0.2)',
      'stroke-color': '#075225',
      'stroke-width': 2,
      'circle-radius': 7,
      'circle-fill-color': '#075225',
    },
  });
  map.addLayer(measureVector)
  // console.log(event)

  // const type = event == 'area' ? 'Polygon' : 'LineString';

  // console.log(type)

  Measureraw = new Draw({
    source: mrsource,
    type: event,
    style: function (feature) {
      const geometryType = feature.getGeometry().getType();
      if (geometryType === event || geometryType === 'Point') {
        return style;
      }
    },
  });
  map.addInteraction(Measureraw);

  createMeasureTooltip();
  createHelpTooltip();


  let listener;
  Measureraw.on('drawstart', function (evt) {
    // set sketch
    sketch = evt.feature;

    /** @type {import("ol/coordinate.js").Coordinate|undefined} */
    let tooltipCoord = evt.coordinate;

    listener = sketch.getGeometry().on('change', function (evt) {
      const geom = evt.target;
      let output;
      if (geom instanceof Polygon) {
        output = formatArea(geom);
        tooltipCoord = geom.getInteriorPoint().getCoordinates();
      } else if (geom instanceof LineString) {
        output = formatLength(geom);
        tooltipCoord = geom.getLastCoordinate();
      }
      measureTooltipElement.innerHTML = output;
      measureTooltip.setPosition(tooltipCoord);
    });
  });

  Measureraw.on('drawend', function () {
    // return
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
    measureTooltip.setOffset([0, -7]);
    // unset sketch
    sketch = null;
    // unset tooltip so that a new one can be created
    measureTooltipElement = null;
    createMeasureTooltip();
    unByKey(listener);
    map.removeInteraction(Measureraw);
    map.removeOverlay(helpTooltip);


  });



}



/**
 * Creates a new help tooltip
 */
function createHelpTooltip() {
  if (helpTooltipElement) {
    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
  }
  helpTooltipElement = document.createElement('div');
  helpTooltipElement.className = 'ol-tooltip hidden';
  helpTooltip = new Overlay({
    element: helpTooltipElement,
    offset: [15, 0],
    positioning: 'center-left',
  });
  map.addOverlay(helpTooltip);
}

/**
 * Creates a new measure tooltip
 */
function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
  measureTooltip = new Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center',
    stopEvent: false,
    insertFirst: false,
  });
  map.addOverlay(measureTooltip);
}

/**
 * Let user change the geometry type.
 */
// typeSelect.onchange = function () {
//   map.removeInteraction(draw);
//   addInteraction();
// };


window.handleMeasure = function (event) {
  map.removeInteraction(Measureraw);
  customMeasure(event);
};
// measure tool ends...........





// Draw feature starts.........


let shapeDraw;

let drawVector; // Declare a single VectorLayer outside the function


function customDraw(event) {
  if (event === 'clear') {
    drsource.clear();
    map.removeInteraction(Measureraw);
    sketch = null;
    measureTooltipElement = null;
    createMeasureTooltip();
    drsource.clear();
    return


  }
  // Ensure the drawVector layer exists, if not, create it
  if (!drawVector) {
    drawVector = new VectorLayer({
      source: drsource,
      style: {
        'fill-color': 'rgba(255, 255, 255, 0.2)',
        'stroke-color': '#164ff7',
        'stroke-width': 2,
        'circle-radius': 7,
        'circle-fill-color': '#164ff7',

      },
    });
    map.addLayer(drawVector);
  }

  if (event === 'freehand') {
    shapeDraw = new Draw({
      source: drsource,
      type: 'LineString',
      freehand: true,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.5)',
        }),
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.8)',
          lineDash: [10, 10],
          width: 2,
        }),
      })
    });

  }
  else {

    shapeDraw = new Draw({
      source: drsource,
      type: event,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.5)',
        }),
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.8)',
          lineDash: [10, 10],
          width: 5,
        }),
      })
    });
  }

  map.addInteraction(shapeDraw);

  createMeasureTooltip();
  createHelpTooltip();


  let listener;

  shapeDraw.on('drawend', function () {
    // return
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
    measureTooltip.setOffset([0, -7]);
    // unset sketch
    sketch = null;
    // unset tooltip so that a new one can be created
    measureTooltipElement = null;
    createMeasureTooltip();
    unByKey(listener);
    map.removeInteraction(shapeDraw);
    map.removeOverlay(helpTooltip);
  });
}
window.handleDraw = function (event) {
  map.removeInteraction(shapeDraw);
  customDraw(event);
};


document.getElementById('draw_undo').addEventListener('click', function () {
  shapeDraw.removeLastPoint();
});

//  Draw ends here............................










// -------------------------------------------------------------------------------------------------------------------------

// Add an empty vector source to hold pins
const pinSource = new VectorSource();
const pinLayer = new VectorLayer({
  source: pinSource
});
map.addLayer(pinLayer);

document.getElementById('locate_Pindrop').addEventListener('click', function () {
  // Get longitude and latitude values from input fields
  let lat = parseFloat(document.getElementById("lat").value);
  let lon = parseFloat(document.getElementById("lon").value);
  console.log("lat")
  console.log(lat)

  console.log("lon")
  console.log(lon)



  // Ensure that lon and lat are valid numbers
  if (isNaN(lon) || isNaN(lat) || lon < -180 || lon > 180 || lat < -90 || lat > 90) {
    alert("Please enter valid longitude (-180 to 180) and latitude (-90 to 90) values.");
    return;
  }

  // Center the map view to the specified coordinates

  map.getView().setCenter(new fromLonLat([lon, lat]));
  map.getView().setZoom(15); // Set desired zoom level

  // Drop a pin at the specified coordinates
  let pinFeature = new Feature({
    geometry: new Point(fromLonLat([lon, lat]))
  });

  // Add the pin feature to the pin source
  pinSource.addFeature(pinFeature);

  let pinStyle = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: './modules/pin.png' // URL to the pin icon
    })
  });

  pinFeature.setStyle(pinStyle);


})

document.getElementById('locate_Pinremove').addEventListener('click', function () {
  console.log("remove")

  pinSource.clear(); // Clear all features from the pin source

})





// Pindrop / Locate featue Ends.....





// coordinate tool starts ................



const coordPos = document.getElementById('lonlat_display');

let projection = new Projection("EPSG:4326"); // Example: WGS 84 geographic projection

// let mousePos = new MousePosition({
//   projection: 'EPSG:4326',
//   coordinateFormat: function (coordinate) {
//     // Simple formatting example (modify based on your library)
//     // const formattedCoords = `${coordinate[1]}, ${coordinate[0]}`; // [y], [x] order

//     let point = new fromLonLat([coordinate[1], coordinate[0]], projection);

//     // document.getElementById('lon').value = point[0];
//     // document.getElementById('lat').value = point[1];


//     let ltdegrees = Math.floor(point[0]);
//     let ltminutes = (point[0] - ltdegrees) * 60;

//     let ltcoor = ltdegrees + "° " + ltminutes.toFixed(2) + "'"


//     let lndegrees = Math.floor(point[1]);
//     let lnminutes = (point[1] - lndegrees) * 60;

//     let lncoor = lndegrees + "° " + lnminutes.toFixed(2) + "'"

//     let DDcoord = ltcoor + "  N " + lncoor + "E";

//     // console.log(DDcoord)
//     coordPos.innerHTML = DDcoord;



//     // return formattedCoords; // Return the formatted string
//   }
// });

// map.addControl(mousePos);



const scaleLineControl = new ScaleLine({
  bar: true,
  target: document.getElementById('scale-line-control'),
  steps: false,
  text: true,
  minWidth: 170,
  maxWidth: 180
});
map.addControl(scaleLineControl);

const mousePos = new MousePosition({
  projection: 'EPSG:4326',
  coordinateFormat: function (coordinate) {
    let point = new fromLonLat([coordinate[1], coordinate[0]], projection);
    let ltdegrees = Math.floor(point[0]);
    let ltminutes = (point[0] - ltdegrees) * 60;
    let ltcoor = ltdegrees + "° " + ltminutes.toFixed(2) + "'";
    let lndegrees = Math.floor(point[1]);
    let lnminutes = (point[1] - lndegrees) * 60;
    let lncoor = lndegrees + "° " + lnminutes.toFixed(2) + "'";
    let DDcoord = ltcoor + "  N " + lncoor + "E";
    coordPos.innerHTML = DDcoord;
  },
  // target: document.getElementById('lonlat_display')
});
map.addControl(mousePos);


//  Co-Ordinate Feature Ends .............





// Scale Line Feature Added.........................


// Scale Line Feature End.........................



// Layer swither tool starts ...........

// Layer swither tool ends...........


// state dist Layer select tool starts

// ---------------------------------------------------------------------------------------------------------------------------------
// Create a vector source for the state layer

document.getElementById('selectButton').addEventListener('click', function () {


  const selectedState = document.getElementById('state').value;
  const selectedDistrict = document.getElementById('district').value;
  console.log("Selected State:", selectedState);
  console.log("Selected District:", selectedDistrict);

  // Function to retrieve coordinates from a feature's geometry
  function getCoordinatesFromFeature(feature) {
    return feature.getGeometry().getExtent(); // Get the extent of the geometry
  }

  // Create a vector source for the district layer
  const existingDistrictLayer = map.getLayers().getArray().find(layer => layer.get('name') === 'districtLayer');
  if (existingDistrictLayer) {
    map.removeLayer(existingDistrictLayer);
  }

  // Remove previous state layer if exists

  const existingStateLayer = map.getLayers().getArray().find(layer => layer.get('name') === 'stateLayer');
  if (existingStateLayer) {
    map.removeLayer(existingStateLayer);
  }

  if (selectedDistrict) {

    const districtVectorSource = new VectorSource({
      url: './india_Districts.geojson', // Replace with your district data URL
      format: new GeoJSON()
    });


    // Function to create a filter based on state name (adjust property name if needed)
    function getDistrictFilter(selected) {
      return function (feature) {
        return feature.get('distname').toLowerCase() === selected.toLowerCase(); // Modify property name based on your data
      };
    }

    // Apply the filter to the source based on selected district
    districtVectorSource.once('change', function () {
      districtVectorSource.getFeatures().forEach(function (feature) {
        if (!getDistrictFilter(selectedDistrict)(feature)) {
          districtVectorSource.removeFeature(feature);
        } else {
          const extent = getCoordinatesFromFeature(feature);
          map.getView().fit(extent, { duration: 1000 }); // Fit the map view to the extent of the selected district with animation
        }
      });
    });



    // Remove previous district layer if exists



    // Create a district vector layer with the filtered source
    const districtLayer = new VectorLayer({
      source: districtVectorSource,
      style: new Style({
        stroke: new Stroke({
          color: '#a0a',
          lineCap: 'butt',
          width: 1
        }),
      })
    });
    districtLayer.set('name', 'districtLayer');

    map.addLayer(districtLayer);

    districtLayer.getSource().on('addfeature', function () {

      // Get the geometry of the districtLayer
      // var districtLayerClipGeometry = districtLayer.getSource().getFeatures()[1].getGeometry();

      var districtLayerClipGeometry = districtLayer.getSource().getFeatures().find(feature => getDistrictFilter(selectedDistrict)(feature)).getGeometry();


      // console.log(stateLayer.getSource().getFeatures())
      // Get the bounding box of the map
      // var mapExtent0 = map.getView().calculateExtent(map.getSize());

      var mapExtent = worldview.calculateExtent(map.getSize());

      // console.log(mapExtent0)
      // console.log(mapExtent)

      var boundingBoxPolygon = new fromExtent(mapExtent);
      console.log(boundingBoxPolygon)

      // Convert the bounding box polygon to GeoJSON
      const format = new GeoJSON();

      var boundingBoxGeoJSON = format.writeGeometryObject(boundingBoxPolygon);

      // Convert the districtLayerClipGeometry to GeoJSON
      var clipGeoJSON = format.writeGeometryObject(districtLayerClipGeometry);
      // console.log(clipGeoJSON())

      // Subtract the districtLayerClipGeometry from the bounding box geometry
      var outsidePolygonGeoJSON = turf.difference(boundingBoxGeoJSON, clipGeoJSON);

      // Convert the resulting GeoJSON back to an OpenLayers feature
      var outsideFeature = format.readFeature(outsidePolygonGeoJSON);

      // Create a vector layer for the outside feature
      var outsideVectorLayer = new VectorLayer({
        source: new VectorSource({
          features: [outsideFeature]
        }),
        style: new Style({
          fill: new Fill({
            color: 'rgba(255, 255, 255, 1)' // Semi-transparent red fill (customize as needed)
          })
        })
      });

      // Add the outside vector layer to the map
      outsideVectorLayer.set('name', 'outsideVectorLayer');

      // Create a vector source for the district layer
      const distExistingOutsideLayer = map.getLayers().getArray().find(layer => layer.get('name') === 'outsideVectorLayer');
      if (distExistingOutsideLayer) {
        map.removeLayer(distExistingOutsideLayer);
        console.log("Layer exists and removed");
      } else {
        console.log("Layer does not exist");
      }

      map.addLayer(outsideVectorLayer);
    });

  }



  else if (selectedState) {

    // Create a vector source for the state layer
    const stateVectorSource = new VectorSource({
      url: './india_state_geo.json', // Replace with your state data URL
      format: new GeoJSON()
    });
    // Function to create a filter based on state name (adjust property name if needed)

    function getStateFilter(selected) {
      return function (feature) {
        return feature.get('NAME_1').toLowerCase() === selected.toLowerCase(); // Modify property name based on your data

      };
    }


    // Apply the filter to the source based on selected state
    stateVectorSource.once('change', function () {
      stateVectorSource.getFeatures().forEach(function (feature) {
        if (!getStateFilter(selectedState)(feature)) {
          stateVectorSource.removeFeature(feature);
        } else {
          const extent = getCoordinatesFromFeature(feature);
          // console.log(extent)


          map.getView().fit(extent, { duration: 1000 }); // Fit the map view to the extent of the selected state with animation
        }
      });
    });

    // Create a state vector layer with the filtered source
    const stateLayer = new VectorLayer({
      source: stateVectorSource,
      style: new Style({
        stroke: new Stroke({
          color: '#000',
          lineCap: 'butt',
          width: 1
        }),
      })
    });
    stateLayer.set('name', 'stateLayer');
    map.addLayer(stateLayer);
    // Add the new layers to the map
    //
    stateLayer.getSource().on('addfeature', function () {

      // Get the geometry of the stateLayer
      // var stateLayerClipGeometry = stateLayer.getSource().getFeatures()[1].getGeometry();

      var stateLayerClipGeometry = stateLayer.getSource().getFeatures().find(feature => getStateFilter(selectedState)(feature)).getGeometry();


      // console.log(stateLayer.getSource().getFeatures())
      // Get the bounding box of the map
      // var mapExtent0 = map.getView().calculateExtent(map.getSize());

      var mapExtent = worldview.calculateExtent(map.getSize());

      // console.log(mapExtent0)
      // console.log(mapExtent)

      var boundingBoxPolygon = new fromExtent(mapExtent);
      console.log(boundingBoxPolygon)

      // Convert the bounding box polygon to GeoJSON
      const format = new GeoJSON();

      var boundingBoxGeoJSON = format.writeGeometryObject(boundingBoxPolygon);

      // Convert the stateLayerClipGeometry to GeoJSON
      var clipGeoJSON = format.writeGeometryObject(stateLayerClipGeometry);
      // console.log(clipGeoJSON())

      // Subtract the stateLayerClipGeometry from the bounding box geometry
      var outsidePolygonGeoJSON = turf.difference(boundingBoxGeoJSON, clipGeoJSON);

      // Convert the resulting GeoJSON back to an OpenLayers feature
      var outsideFeature = format.readFeature(outsidePolygonGeoJSON);

      // Create a vector layer for the outside feature
      var outsideVectorLayer = new VectorLayer({
        source: new VectorSource({
          features: [outsideFeature]
        }),
        style: new Style({
          fill: new Fill({
            color: 'rgba(255, 255, 255, 1)' // Semi-transparent red fill (customize as needed)
          })
        })
      });

      // Add the outside vector layer to the map
      outsideVectorLayer.set('name', 'outsideVectorLayer');

      // Create a vector source for the district layer
      const stateExistingOutsideLayer = map.getLayers().getArray().find(layer => layer.get('name') === 'outsideVectorLayer');
      if (stateExistingOutsideLayer) {
        map.removeLayer(stateExistingOutsideLayer);
        console.log("Layer exists and removed");
      } else {
        console.log("Layer does not exist");
      }

      map.addLayer(outsideVectorLayer);
    });


  }

});
// ---------------------------------------------------------------------------------------------------------------------------------------------------------
// state dist Layer select tool starts

// side menu options

// admin states
// state boundary


const satatecheckbox = document.getElementById('stateboundary');

satatecheckbox.addEventListener('change', function () {
  // Get the existing state layer if it exists
  const existingStateLayer = map.getLayers().getArray().find(layer => layer.get('name') === 'stateLayer');

  if (satatecheckbox.checked) {
    // Create a vector source for the state layer
    const stateVectorSource = new VectorSource({
      url: './assam_boundary.geojson', // Replace with your state data URL
      format: new GeoJSON()
    });

    const selectedState = 'assam';

    // Function to create a filter based on state name (adjust property name if needed)
    function getStateFilter(selected) {
      return function (feature) {
        return feature.get('Name').toLowerCase() === selected.toLowerCase(); // Modify property name based on your data
      };
    }

    // Apply the filter to the source based on selected state
    stateVectorSource.once('change', function () {
      stateVectorSource.getFeatures().forEach(function (feature) {
        if (!getStateFilter(selectedState)(feature)) {
          stateVectorSource.removeFeature(feature);
        }
      });
    });

    // Create a state vector layer with the filtered source
    const stateLayer = new VectorLayer({
      source: stateVectorSource,
      style: new Style({
        stroke: new Stroke({
          color: '#000',
          lineCap: 'butt',
          width: 1
        }),
      })
    });

    stateLayer.set('name', 'stateLayer');

    // Add the layer to the map
    map.addLayer(stateLayer);
  } else {
    // If the checkbox is unchecked, remove the existing state layer if it exists
    if (existingStateLayer) {
      map.removeLayer(existingStateLayer);
    }
  }
});


// District boundary

const districtcheckbox = document.getElementById('DistrictBoundary');

districtcheckbox.addEventListener('change', function () {
  // Get the existing state layer if it exists
  const existingDistrictLayer = map.getLayers().getArray().find(layer => layer.get('name') === 'districtLayer');

  if (districtcheckbox.checked) {
    // Create a vector source for the state layer
    const districtVectorSource = new VectorSource({
      url: './assam_dist_json.geojson', // Replace with your state data URL
      format: new GeoJSON()
    });

    const selectedState = 'assam';

    // Function to create a filter based on state name (adjust property name if needed)
    function getStateFilter(selected) {
      return function (feature) {
        return feature.get('statename').toLowerCase() === selected.toLowerCase(); // Modify property name based on your data
      };
    }

    // Apply the filter to the source based on selected state
    districtVectorSource.once('change', function () {
      districtVectorSource.getFeatures().forEach(function (feature) {
        if (!getStateFilter(selectedState)(feature)) {
          districtVectorSource.removeFeature(feature);
        }
      });
    });

    // Create a state vector layer with the filtered source
    const districtLayer = new VectorLayer({
      source: districtVectorSource,
      style: new Style({
        stroke: new Stroke({
          color: '#a0a',
          lineCap: 'butt',
          width: 1
        }),
      })
    });

    districtLayer.set('name', 'districtLayer');

    // Add the layer to the map
    map.addLayer(districtLayer);
  } else {
    // If the checkbox is unchecked, remove the existing state layer if it exists
    if (existingDistrictLayer) {
      map.removeLayer(existingDistrictLayer);
    }
  }
});


// ---Upload






document.getElementById("uploadButton").addEventListener('click', function () {
  var fileInput = document.getElementById('fileInput');
  var file = fileInput.files[0];

  if (!file) {
    alert("Please select a file to upload.");
    return;
  }

  var reader = new FileReader();
  reader.onload = function (event) {
    var data = event.target.result;
    var extension = file.name.split('.').pop().toLowerCase();
    processData(data, extension);
  };
  reader.onerror = function (event) {
    console.error("File could not be read! Code " + event.target.error.code);
  };
  reader.readAsText(file);
});

function processData(data, extension) {
  try {
    if (extension === 'geojson') {
      visualizeGeoJSON(data);
    } else if (extension === 'csv') {
      visualizeCSV(data);
    } else {
      console.error("Unsupported file format.");
    }
  } catch (error) {
    console.error("Error processing file:", error);
  }
}

function visualizeGeoJSON(data) {
  try {
    var features = JSON.parse(data).features;

    if (!features || !Array.isArray(features)) {
      console.error("Invalid GeoJSON data format.");
      return;
    }

    features.forEach(function (feature) {
      var geometry = feature.geometry;
      if (geometry && geometry.type === 'Point' && Array.isArray(geometry.coordinates) && geometry.coordinates.length === 2) {
        var coordinates = geometry.coordinates;
        var latitude = coordinates[1];
        var longitude = coordinates[0];

        if (!isNaN(latitude) && !isNaN(longitude)) {
          var marker = new Feature({
            geometry: new Point(fromLonLat([longitude, latitude]))
          });

          var vectorSource = new VectorSource({
            features: [marker]
          });

          var vectorLayer = new VectorLayer({
            source: vectorSource
          });

          map.addLayer(vectorLayer);
        } else {
          console.error("Invalid latitude or longitude in GeoJSON.");
        }
      } else {
        console.error("Invalid GeoJSON feature format.");
      }
    });
  } catch (error) {
    console.error("Error processing GeoJSON:", error);
  }
}


function visualizeCSV(data) {
  console.log("csv")
  try {
    // Your CSV parsing and visualization logic here
    // For example, you can use a library like PapaParse for CSV parsing

    new Papa.parse(data, {
      header: true,
      complete: function (results) {
        results.data.forEach(function (row) {
          // Assuming latitude and longitude columns are named 'latitude' and 'longitude'
          var latitude = parseFloat(row.latitude);
          var longitude = parseFloat(row.longitude);

          if (!isNaN(latitude) && !isNaN(longitude)) {
            var marker = new Feature({
              geometry: new Point(fromLonLat([longitude, latitude]))
            });

            var vectorSource = new VectorSource({
              features: [marker]
            });

            var vectorLayer = new VectorLayer({
              source: vectorSource
            });

            map.addLayer(vectorLayer);
          } else {
            console.error("Invalid latitude or longitude in CSV.");
          }
        });
      }
    });
  } catch (error) {
    console.error("Error processing CSV:", error);
  }
}



// ------------

//  Print option-----------



// handletoggleLayer

// Define the toggleLayer function to switch between layers

function toggleLayer(layerName) {
  if (layerName === 'osm') {
    var layers = map.getLayers().getArray();
    layers.forEach(function (layer) {
      if (layer.get('name') === 'standardLayer' || layer.get('name') === 'sateliteLayer' || layer.get('name') === 'transportLayer' || layer.get('name') === 'labelLayer') {
        layer.setVisible(false);
      } else {
        layer.setVisible(true);
      }
    });
  }

  if (layerName === 'sateliteLayer') {
    var layers = map.getLayers().getArray();
    layers.forEach(function (layer) {
      if (layer.get('name') === 'standardLayer' || layer.get('name') === 'osm' || layer.get('name') === 'transportLayer') {
        layer.setVisible(false);
      } else {
        layer.setVisible(true);
      }
    });
  }

  if (layerName === 'standardLayer') {
    var layers = map.getLayers().getArray();
    layers.forEach(function (layer) {
      if (layer.get('name') === 'osm' || layer.get('name') === 'sateliteLayer' || layer.get('name') === 'transportLayer' || layer.get('name') === 'labelLayer') {
        layer.setVisible(false);
      } else {
        layer.setVisible(true);
      }
    });
  }

  if (layerName === 'transportLayer') {
    var layers = map.getLayers().getArray();
    layers.forEach(function (layer) {
      if (layer.get('name') === 'osm' || layer.get('name') === 'standardLayer' || layer.get('name') === 'sateliteLayer' || layer.get('name') === 'labelLayer') {
        layer.setVisible(false);
      } else {
        layer.setVisible(true);
      }
    });
  }


  // var layers = map.getLayers().getArray();
  // layers.forEach(function (layer) {
  //   if (layer.get('name') === layerName) {
  //     // console.log(name)
  //     //       console.log(name)

  //     layer.setVisible(true);
  //   } else {
  //     layer.setVisible(true);
  //   }
  // });
}

window.handletoggleLayer = function (layerName) {
  toggleLayer(layerName);
};

function toggleLabelLayer(layerName) {
  var layers = map.getLayers().getArray();
  layers.forEach(function (layer) {
    console.log(layer.get('visible'))
    if (layer.get('name') === layerName) {
      if (layer.get('visible') === true) {
        layer.setVisible(false);
      } else {
        layer.setVisible(true);
      }
    }
  });
}

window.handletoggleLabelLayer = function (layerName) {
  toggleLabelLayer(layerName);
};


// --BAse layer  changes feature end


// geo coder
let geoLocateLat;
let geoLocateLon;

document.addEventListener('DOMContentLoaded', function () {
  const locationInput = document.getElementById('locationInput');
  const resultContainer = document.getElementById('resultContainer');

  // Event listener for input changes
  locationInput.addEventListener('input', function () {
    const location = locationInput.value.trim();
    if (location) {
      getSuggestions(location);
    } else {
      // Clear the result container if the input is empty
      resultContainer.innerHTML = '';
    }
  });


  // Function to get suggestions from Nominatim API
  async function getSuggestions(location) {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`);
      const suggestions = response.data;
      displaySuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error.message);
    }
  }

  // Function to display suggestions in the result container
  function displaySuggestions(suggestions) {
    if (suggestions && suggestions.length > 0) {
      const suggestionHTML = suggestions.map(suggestion => {
        return `<li class="suggestion-item" data-lat="${suggestion.lat}" data-lon="${suggestion.lon}" data-name="${suggestion.display_name}">${suggestion.display_name}</li>`;
      }).join('');
      resultContainer.innerHTML = `<ul>${suggestionHTML}</ul>`;
      // Add click event listener to each suggestion item
      const suggestionItems = document.querySelectorAll('.suggestion-item');
      suggestionItems.forEach(item => {
        item.addEventListener('click', function () {
          const name = item.getAttribute('data-name');
          locationInput.value = name; // Automatically add the selected suggestion to the input field
          console.log(item)
          geoLocateLat = item.getAttribute('data-lat');
          geoLocateLon = item.getAttribute('data-lon');
          locateLocation(geoLocateLat, geoLocateLon);
          clearSuggestions(); // Clear suggestions after selecting one
        });
      });
    } else {
      resultContainer.innerHTML = '<p>No suggestions found.</p>';
    }
  }

  // Function to clear suggestions
  function clearSuggestions() {
    resultContainer.innerHTML = '';
  }

  // Function to locate a specific location on the map
  function locateLocation(lat, lon) {
    // Here, you can write your code to locate the location on the map

    // const geoLocateSource = new VectorSource();
    // const geoLocateLayer = new VectorLayer({
    //   source: geoLocateSource
    // });

    // Center the map view to the specified coordinates

    map.getView().setCenter(new fromLonLat([lon, lat]));
    map.getView().setZoom(16); // Set desired zoom level

    // Drop a pin at the specified coordinates
    let pinFeature = new Feature({
      geometry: new Point(fromLonLat([lon, lat]))
    });

    // Add the pin feature to the pin source
    pinSource.addFeature(pinFeature);

    let pinStyle = new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: './modules/location-pin.png' // URL to the pin icon
      })
    });

    pinFeature.setStyle(pinStyle);
  }
});

// geo coder

// map.addLayer(pinLayer);

// document.getElementById('locate_Pindrop').addEventListener('click', function () {
//   // Get longitude and latitude values from input fields
//   let lon = parseFloat(document.getElementById("lon").value);
//   let lat = parseFloat(document.getElementById("lat").value);


//   const pinSource = new VectorSource();
//   const pinLayer = new VectorLayer({
//     source: pinSource
//   });
//   // Center the map view to the specified coordinates
//   map.getView().setCenter(new fromLonLat([lon, lat]));
//   map.getView().setZoom(10); // Set desired zoom level

//   // Drop a pin at the specified coordinates
//   let pinFeature = new Feature({
//     geometry: new Point(fromLonLat([lon, lat]))
//   });

//   // Add the pin feature to the pin source
//   pinSource.addFeature(pinFeature);

//   let pinStyle = new Style({
//     image: new Icon({
//       anchor: [0.5, 1],
//       src: './modules/pin.png' // URL to the pin icon
//     })
//   });
//   pinFeature.setStyle(pinStyle);
// })

// document.getElementById('locate_Pinremove').addEventListener('click', function () {
//   console.log("remove")
//   pinSource.clear(); // Clear all features from the pin source
// })


// printtool////

// document.getElementById('printButton').addEventListener('click', function () {
//   console.log("hii")

//   window.document.getElementById("map").print()

// });

// map.addControl(printControl);
// print tool







// const clear = document.getElementById('clear');
// clear.addEventListener('click', function () {
//   source.clear();
// });


//new 

// const format = new ol.format.GeoJSON({featureProjection: 'EPSG:3857'}); // Uncomment this line and replace 'ol' with your library name if different
const download = document.getElementById('download');
download.addEventListener('click', function () {
  console.log("hi I'm inside export");
  try {
    const geojsonFormat = new GeoJSON({ featureProjection: 'EPSG:3857' }); // Assuming 'ol' is the OpenLayers namespace
    const features = drsource.getFeatures(); // Assuming 'drsource' is the vector source

    // Convert circles to polygons
    // features.forEach(feature => {
    //   const geometry = feature.getGeometry();
    //   if (geometry.getType() === 'Circle') {
    //     const center = geometry.getCenter();
    //     const radius = geometry.getRadius();

    //     const circlePolygon =  Polygon.fromCircle(new Circle(center, radius));
    //     feature.setGeometry(circlePolygon);
    //   }
    // });

    const json = geojsonFormat.writeFeatures(features);

    // Create data URI with correct MIME type and filename
    download.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(json);
    download.download = 'data.geojson'; // Specify the filename with .geojson extension
    console.log(features);
  } catch (error) {
    console.error("Error during download:", error);
    // Handle the error appropriately, e.g., display a user-friendly message.
  }
});





const clear_all = document.getElementById("clear_all");
clear_all.addEventListener('click', function () {
  map.getLayers().forEach(function (layer) {
    if (layer instanceof VectorLayer) {
      map.removeLayer(layer);
    }
  });
})


const clear_alll = document.getElementById('clear_alll');
function cleaning() {
  console.log("hii")
}



window.handle_clear_alll = function () {
  cleaning();
};



// --------print
// --------print
// --------print
function generateLegend() {
  const existingLegend = document.getElementById('legend');
  if (existingLegend) {
    existingLegend.remove();
  }

  const legendElement = document.createElement('div');
  legendElement.id = 'legend';
  legendElement.style.display = 'flex';
  legendElement.style.flexDirection = 'column';
  legendElement.style.backgroundColor = 'white';
  legendElement.style.padding = '10px';
  // legendElement.style.border = '1px solid black';
  legendElement.style.position = 'absolute';
  legendElement.style.bottom = '10px';
  legendElement.style.left = '10px';
  legendElement.style.zIndex = '1000';

  const layers = map.getLayers().getArray();
  layers.forEach(layer => {
    const layerName = layer.get('name');
    if (layerName) {
      const source = layer.getSource();
      if (source instanceof VectorSource) {
        const features = source.getFeatures();
        if (features.length > 0) {
          const feature = features[0];
          const style = layer.getStyle() instanceof Style ? layer.getStyle() : layer.getStyle()(feature);

          const legendItem = document.createElement('div');
          legendItem.style.display = 'flex';
          legendItem.style.alignItems = 'center';
          legendItem.style.marginBottom = '5px';
          legendItem.style.fontWeight = '900';

          const colorBox = document.createElement('div');
          colorBox.style.width = '20px';
          colorBox.style.height = '20px';
          colorBox.style.backgroundColor = style.getStroke().getColor();
          colorBox.style.marginRight = '10px';

          const label = document.createElement('span');
          label.innerText = layerName;

          legendItem.appendChild(colorBox);
          legendItem.appendChild(label);
          legendElement.appendChild(legendItem);
        }
      }
    }
  });

  document.body.appendChild(legendElement);
}




// 

const printFormat = new WKT();
const printFeature = printFormat.readFeature(
  'POLYGON((10.689697265625 -25.0927734375, 34.595947265625 ' +
  '-20.1708984375, 38.814697265625 -35.6396484375, 13.502197265625 ' +
  '-39.1552734375, 10.689697265625 -25.0927734375))'
);
printFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');

const vector = new VectorLayer({
  source: new VectorSource({
    features: [printFeature],
  }),
  opacity: 0.5,
});

const dims = {
  a0: [1189, 841],
  a1: [841, 594],
  a2: [594, 420],
  a3: [420, 297],
  a4: [297, 210],
  a5: [210, 148],
};

const exportButton = document.getElementById('printButton');

const processCanvas = (width, height, canvases, mapContext, callback) => {
  if (canvases.length === 0) {
    callback();
    return;
  }

  const canvas = canvases.shift();
  if (canvas.width > 0) {
    const opacity = canvas.parentNode.style.opacity;
    mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
    const transform = canvas.style.transform;
    const matrix = transform
      .match(/^matrix\(([^\(]*)\)$/)[1]
      .split(',')
      .map(Number);
    CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
    console.log("height")
    console.log(height)
    console.log("width")
    console.log(width)

    mapContext.drawImage(canvas, 20, height * .11, width * .8, height * .8);
  }

  requestAnimationFrame(() => processCanvas(width, height, canvases, mapContext, callback));
};

const exportMap = () => {
  const format = 'a5';
  const resolution = 300; // Adjust as needed
  const dim = dims[format];
  const width = Math.round((dim[0] * resolution) / 25.4);
  const height = Math.round((dim[1] * resolution) / 25.4);
  const size = map.getSize();
  const viewResolution = map.getView().getResolution();

  // Generate the legend before render complete
  generateLegend();

  map.once('rendercomplete', function () {
    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = width;
    mapCanvas.height = height;
    const mapContext = mapCanvas.getContext('2d', { willReadFrequently: true });
    const canvases = Array.prototype.slice.call(
      document.querySelectorAll('.ol-layer canvas')
    );

    processCanvas(width, height, canvases, mapContext, () => {
      // Draw the map area
      mapContext.globalAlpha = 1;
      mapContext.setTransform(1, 0, 0, 1, 0, 0);
      // mapContext.drawImage(mapCanvas, 0,0,0,0, 20, 20, width * 0.7, height*0.7);
      // mapContext.drawImage(mapCanvas, 20, width * 0.7, height*0.7, 0,0,0,0, 20);
      // mapContext.drawImage(mapCanvas,20, 20, width * 0.7, height*0.7);



      // About Section
      const aboutSection = document.createElement('div');
      aboutSection.innerHTML = `
        <div style="text-align: center; font-weight:900; margin:40px">
          <img src="logo_url" alt="Logo" style="width: 100px;" />
          <h1 style="font-size:40px">Assam State Space Application Centre</h1>
                 <br>

          <p>GS rd, Guwahati, 781005</p>
       <br>
        </div>`;
      document.body.appendChild(aboutSection);

      html2canvas(aboutSection).then(aboutCanvas => {
        document.body.removeChild(aboutSection);
        const aboutDataURL = aboutCanvas.toDataURL('image/jpeg');

        const aboutWidth = width * 0.3;
        const aboutHeight = aboutWidth;
        console.log("height")
        console.log(height)
        console.log("width")
        console.log(width)

        mapContext.drawImage(aboutCanvas, 20, 20, width * 0.8, height * 0.1);




        // Legend
        const legendElement = document.getElementById('legend');
        if (legendElement) {
          html2canvas(legendElement).then(legendCanvas => {
            // const legendDataURL = legendCanvas.toDataURL('image/jpeg');
            // const legendWidth = width * 0.3;
            // const legendHeight = legendCanvas.height * legendWidth / legendCanvas.width;

            // // mapContext.drawImage(legendCanvas, 20 , height - legendHeight, legendWidth, legendHeight);
            // mapContext.drawImage(legendCanvas, width*0.81 , 20, width*0.18);
            const legendDataURL = legendCanvas.toDataURL('image/jpeg');
            const legendWidth = width * 0.17;
            const legendHeight = legendCanvas.height * legendWidth / legendCanvas.width;
            mapContext.drawImage(legendCanvas, width * 0.82, height * .12, legendWidth, legendHeight);

            // mapContext.drawImage(legendCanvas, width * 0.7, height - legendHeight, legendWidth, legendHeight);


            // Scale Line

            const scaleLineElement = document.getElementById('scale-line-control');

            html2canvas(scaleLineElement).then(scaleLineCanvas => {
              // Ensure the scale line element is not removed before it's fully captured
              const scaleLineDataURL = scaleLineCanvas.toDataURL('image/jpeg');
              
              // Calculate scaling factors maintaining the aspect ratio
              const scaleFactor = width * 1.8 / size[0];
              const scaleLineWidth = scaleLineCanvas.width * scaleFactor;
              const scaleLineHeight = scaleLineCanvas.height * scaleFactor;
              
              // Draw the scale line on the map context, ensuring it fits correctly
              mapContext.drawImage(scaleLineCanvas, width * 0.82-scaleLineWidth, height * 0.92-scaleLineHeight, scaleLineWidth*0.8, scaleLineHeight*0.8);
              // Export to PDF
              const pdf = new jsPDF('landscape', undefined, format);
              pdf.addImage(mapCanvas.toDataURL('image/jpeg'), 'JPEG', 0, 0, dim[0], dim[1]);
              pdf.save('map.pdf');

              // Reset map
              map.setSize(size);
              map.getView().setResolution(viewResolution);
              exportButton.disabled = false;
              document.body.style.cursor = 'auto';
            });
          }).catch(error => {
            console.error('Error capturing legend:', error);
            // Continue with PDF export even if legend capture fails
            const pdf = new jsPDF('landscape', undefined, format);
            pdf.addImage(mapCanvas.toDataURL('image/jpeg'), 'JPEG', 0, 0, dim[0], dim[1]);
            pdf.save('map.pdf');
            map.setSize(size);
            map.getView().setResolution(viewResolution);
            exportButton.disabled = false;
            document.body.style.cursor = 'auto';
          });
        } else {
          console.error('Legend element not found');
        }
      }).catch(error => {
        console.error('Error capturing about section:', error);
        // Continue with PDF export even if about section capture fails
        const pdf = new jsPDF('landscape', undefined, format);
        pdf.addImage(mapCanvas.toDataURL('image/jpeg'), 'JPEG', 0, 0, dim[0], dim[1]);
        pdf.save('map.pdf');
        map.setSize(size);
        map.getView().setResolution(viewResolution);
        exportButton.disabled = false;
        document.body.style.cursor = 'auto';
      });
    });
  });

  const printSize = [width, height];
  map.setSize(printSize);
  const scaling = Math.min(width / size[0], height / size[1]);
  map.getView().setResolution(viewResolution / scaling);
};

exportButton.addEventListener('click', function () {
  exportButton.disabled = true;
  document.body.style.cursor = 'progress';
  exportMap();
}, false);











// -------print ends
import DragBox from 'ol/interaction/DragBox.js';


// Define the drag zoom interaction
const zoomininteraction = new DragBox();

zoomininteraction.on('boxend', function () {
  // Get the extent of the drawn box
  const zoominExtent = zoomininteraction.getGeometry().getExtent();
  map.getView().fit(zoominExtent);
});

const mapElement = document.getElementById("map");


function resetCursor() {
  mapElement.style.cursor = "auto"; // Reset cursor to normal
  map.removeInteraction(zoomininteraction);
}

// // Add event listener for "zoomend" event
map.on('moveend', resetCursor);

// // Append the button element to the document body
// document.body.appendChild(ziButton);
const ziButton = document.getElementById('dragSelect')
// Button click event listener for activating/deactivating drag zoom interaction
ziButton.addEventListener('click', () => {
  mapElement.style.cursor = "zoom-in";
  map.addInteraction(zoomininteraction);
})


