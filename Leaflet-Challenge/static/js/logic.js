
// Geo-Mapping Homework
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"


d3.json(queryUrl, function(data) {
  console.log(data.features)
  createFeatures(data.features);
  
});

function createFeatures(earthquakeData) {

  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
      //function onEachFeature(feature, layer) {
      //layer.bindPopup("<h3>" + feature.properties.place +
      //"</h3><hr><p>" + new Date(feature.properties.time) + "</p><hr><p>" + feature.properties.mag + "</p>");
      
    }

  function radiusSize(magnitude) {
    return magnitude * 20000;
  //function circleSize(magnitude) {
  //return magnitude ** 2;
  }


  function circleColor(magnitude) {
    if (magnitude >= 5) {
        return "red";
      }
      else if (magnitude >= 4) {
        return "maroon";
      }
      else if (magnitude >= 3) {
       return "gold";
      }
      else if (magnitude >= 2) {
        return "yellow";
      }
      else if (magnitude >= 1) {
        return "yellowgreen";
      }
      else {
        return "green";
      }
  }


  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(earthquakeData, latlng) {
      return L.circle(latlng, {
        radius: radiusSize(earthquakeData.properties.mag),
        color: circleColor(earthquakeData.properties.mag),
        fillOpacity: 0.8
        // radius: circleSize(feature.properties.mag),
        //fillOpacity: 0.8,
        //color: getColor(feature.properties.mag),
        //fillColor: getColor(feature.properties.mag)
      });
    },
    onEachFeature: onEachFeature
  });

  createMap(earthquakes);
}

function createMap(earthquakes) {

  var grayscalemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGFuaWVseW1pcmFuZGEiLCJhIjoiY2s5MGp2Z2lhMDJpNjNkbzFwOHQxYWc0ciJ9.yHeWmeXdSlXFqlqjqklW9g", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var outdoorsmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGFuaWVseW1pcmFuZGEiLCJhIjoiY2s5MGp2Z2lhMDJpNjNkbzFwOHQxYWc0ciJ9.yHeWmeXdSlXFqlqjqklW9g", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGFuaWVseW1pcmFuZGEiLCJhIjoiY2s5MGp2Z2lhMDJpNjNkbzFwOHQxYWc0ciJ9.yHeWmeXdSlXFqlqjqklW9g", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });


  // Se crea la "Faultline" Layer
  var faultLine = new L.LayerGroup();
  
  // Se define un objeto baseMaps para poder poner nuestras layers 
  var baseMaps = {
    "Outdoor Map": outdoorsmap,
    "Greyscale Map": grayscalemap,
    "Satellite Map": satellitemap
  };

  // Se crea un objeto Overlay para poner nuestras overlay layers
  var overlayMaps = {
    Earthquakes: earthquakes,
    FaultLines: faultLine
  };

  // Creamos nuestro mapa, le damos la vista de "calle" y las leyers de terremoto 
  var myMap = L.map("map", {
    center: [
      0.00, 0.00
    ],
    zoom: 3,
    layers: [satellitemap, earthquakes, faultLine]
  });

  // Se crea una layer de control

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Aqui obtenemos la data para sacar las "fallas tectonicas"
  var faultlinequery = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";
  
  // Creamos las lineas tectonicas y las agregamos a la leyer
  d3.json(faultlinequery, function(data) {
    L.geoJSON(data, {
      style: function() {
        return {color: "red", fillOpacity: 0}
      }
    }).addTo(faultLine)
  })

  // le damos colores a la legenda
  function getColor(d) {
    return d > 5 ? '#ff3333' :
           d > 4  ? '#ff6633' :
           d > 3  ? '#ff9933' :
           d > 2  ? '#ffcc33' :
           d > 1  ? '#ffff33' :
                    '#ccff33';
  }

// Agregamos la legenda al mapa
  var legend = L.control({
    position: 'bottomright'});
  
  legend.onAdd = function (map) {
  
      var div = L.DomUtil.create('div', 'info legend'),
          mags = [0, 1, 2, 3, 4, 5],
          labels = [];
          //labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];

          
      for (var i = 0; i < mags.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(mags[i] + 1) + '"></i> ' +
              mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
          //div.innerHTML += '<i style="background:' + getColor(i) + '"></i> ' +
            //labels[i] + '<br>' ;
            }
  
      return div;
  };
  
  legend.addTo(myMap);
}

//// Adds Legend
  //let legend = L.control({position: 'bottomright'});
  //legend.onAdd = function(myMap) {
    //let div = L.DomUtil.create('div', 'legend'),
      //grades = [0, 1, 2, 3, 4, 5],
      //labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];
//
    //for (let i = 0; i < grades.length; i++) {
      //div.innerHTML += '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
              //grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    //}
//
    //return div;
  //};
  //legend.addTo(myMap);