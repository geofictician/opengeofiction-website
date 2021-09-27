//= require qs/dist/qs

L.extend(L.LatLngBounds.prototype, {
  getSize: function () {
    return (this._northEast.lat - this._southWest.lat) *
           (this._northEast.lng - this._southWest.lng);
  },

  wrap: function () {
    return new L.LatLngBounds(this._southWest.wrap(), this._northEast.wrap());
  }
});

L.OSM.Map = L.Map.extend({
  initialize: function (id, options) {
    L.Map.prototype.initialize.call(this, id, options);

    var copyright = I18n.t("javascripts.map.copyright", { copyright_url: "/copyright" });
    var donate = I18n.t("javascripts.map.donate_link_text", { donate_url: "https://donate.openstreetmap.org" });
    var terms = I18n.t("javascripts.map.terms", { terms_url: "https://wiki.osmfoundation.org/wiki/Terms_of_Use" });
    var cyclosm = I18n.t("javascripts.map.cyclosm", { cyclosm_url: "https://www.cyclosm.org", osmfrance_url: "https://openstreetmap.fr/" });
    var thunderforest = I18n.t("javascripts.map.thunderforest", { thunderforest_url: "https://www.thunderforest.com/" });
    var memomaps = I18n.t("javascripts.map.opnvkarte", { memomaps_url: "https://memomaps.de/" });
    var hotosm = I18n.t("javascripts.map.hotosm", { hotosm_url: "https://www.hotosm.org/", osmfrance_url: "https://openstreetmap.fr/" });

    this.baseLayers = [];

// FOLLOWING added 20210719 by luciano **********************************
    this.baseLayers.push(new L.OSM.OGFCarto({
      attribution: "Tiles and data courtesy <a href='http://opengeofiction.net/copyright' target='_blank'>OpenGeofiction</a> and contributors.",
      code: "B",
      keyid: "ogf-carto",
      name: I18n.t("javascripts.map.base.ogf-carto")
    }));

/******  FOLLOWING commented out 20210802 by luciano *************************
    this.baseLayers.push(new L.OSM.Arhet2Carto({
      attribution: "Tiles and data created by <a href='http://geofictician.net/about.html' target='_blank'>Geofictician</a> on the OSM platform, including creative re-use of data shared by OpenStreetMap contributors.",
      code: "W",
      keyid: "arhet2-carto",
      name: I18n.t("javascripts.map.base.arhet2-carto")
    }));

    this.baseLayers.push(new L.OSM.ArhetTopo({
      attribution: "Tiles and data created by <a href='http://geofictician.net/about.html' target='_blank'>Geofictician</a> on the OSM platform, including creative re-use of data shared by OpenStreetMap contributors.",
      code: "Z",
      keyid: "arhet-topo",
      name: I18n.t("javascripts.map.base.arhet-topo")
    }));
// ******  ABOVE commented out 20210802 by luciano **************************/
    this.baseLayers.push(new L.OSM.OGFTopo({
      attribution: "Tiles and data courtesy <a href='http://opengeofiction.net/copyright' target='_blank'>OpenGeofiction</a> and contributors.",
      code: "V",
      keyid: "ogf-topo",
      name: I18n.t("javascripts.map.base.ogf-topo")
    }));

/******  FOLLOWING commented out 20210802 by luciano *************************
    this.baseLayers.push(new L.OSM.OgieffCartoSource({
      attribution: "Tiles and data courtesy <a href='http://opengeofiction.net/copyright' target='_blank'>OpenGeofiction</a> and contributors.",
      code: "F",
      keyid: "ogieff-carto",
      name: I18n.t("javascripts.map.base.ogieff-carto")
    }));
// ******  ABOVE commented out 20210802 by luciano **************************/
    this.baseLayers.push(new L.OSM.EarthCarto({
      attribution: copyright + " &hearts; " + donate + ". " + terms,
      code: "X",
      keyid: "earth-carto",
      name: I18n.t("javascripts.map.base.earth-carto")
    }));

// ABOVE added 20210719 by luciano **********************************

/******  FOLLOWING commented out 20210719 by luciano *************************

    this.baseLayers.push(new L.OSM.Mapnik({
      attribution: copyright + " &hearts; " + donate + ". " + terms,
      code: "M",
      keyid: "mapnik",
      name: I18n.t("javascripts.map.base.standard")
    }));

    this.baseLayers.push(new L.OSM.CyclOSM({
      attribution: copyright + ". " + cyclosm + ". " + terms,
      code: "Y",
      keyid: "cyclosm",
      name: I18n.t("javascripts.map.base.cyclosm")
    }));

    if (OSM.THUNDERFOREST_KEY) {
      this.baseLayers.push(new L.OSM.CycleMap({
        attribution: copyright + ". " + thunderforest + ". " + terms,
        apikey: OSM.THUNDERFOREST_KEY,
        code: "C",
        keyid: "cyclemap",
        name: I18n.t("javascripts.map.base.cycle_map")
      }));

      this.baseLayers.push(new L.OSM.TransportMap({
        attribution: copyright + ". " + thunderforest + ". " + terms,
        apikey: OSM.THUNDERFOREST_KEY,
        code: "T",
        keyid: "transportmap",
        name: I18n.t("javascripts.map.base.transport_map")
      }));
    }

    this.baseLayers.push(new L.OSM.OPNVKarte({
      attribution: copyright + ". " + memomaps + ". " + terms,
      code: "O",
      keyid: "opnvkarte",
      name: I18n.t("javascripts.map.base.opnvkarte")
    }));

    this.baseLayers.push(new L.OSM.HOT({
      attribution: copyright + ". " + hotosm + ". " + terms,
      code: "H",
      keyid: "hot",
      name: I18n.t("javascripts.map.base.hot")
    }));

// ******  ABOVE commented out 20210719 by luciano **************************/

    this.noteLayer = new L.FeatureGroup();
    this.noteLayer.options = { code: "N" };

    this.dataLayer = new L.OSM.DataLayer(null);
    this.dataLayer.options.code = "D";

    this.gpsLayer = new L.OSM.GPS({
      pane: "overlayPane",
      code: "G",
      name: I18n.t("javascripts.map.base.gps")
    });

    this.on("layeradd", function (event) {
      if (this.baseLayers.indexOf(event.layer) >= 0) {
        this.setMaxZoom(event.layer.options.maxZoom);
      }
    });
  },

// 2nd line below modified 20210719 by luciano ****************
  updateLayers: function (layerParam) {
    var layers = layerParam || "B",
        layersAdded = "";

    for (var i = this.baseLayers.length - 1; i >= 0; i--) {
      if (layers.indexOf(this.baseLayers[i].options.code) >= 0) {
        this.addLayer(this.baseLayers[i]);
        layersAdded = layersAdded + this.baseLayers[i].options.code;
      } else if (i === 0 && layersAdded === "") {
        this.addLayer(this.baseLayers[i]);
      } else {
        this.removeLayer(this.baseLayers[i]);
      }
    }
  },

  getLayersCode: function () {
    var layerConfig = "";
    this.eachLayer(function (layer) {
      if (layer.options && layer.options.code) {
        layerConfig += layer.options.code;
      }
    });
    return layerConfig;
  },

  getMapBaseLayerId: function () {
    var baseLayerId;
    this.eachLayer(function (layer) {
      if (layer.options && layer.options.keyid) baseLayerId = layer.options.keyid;
    });
    return baseLayerId;
  },

  getUrl: function (marker) {
    var precision = OSM.zoomPrecision(this.getZoom()),
        params = {};

    if (marker && this.hasLayer(marker)) {
      var latLng = marker.getLatLng().wrap();
      params.mlat = latLng.lat.toFixed(precision);
      params.mlon = latLng.lng.toFixed(precision);
    }

    var url = window.location.protocol + "//" + OSM.SERVER_URL + "/",
        query = Qs.stringify(params),
        hash = OSM.formatHash(this);

    if (query) url += "?" + query;
    if (hash) url += hash;

    return url;
  },

  getShortUrl: function (marker) {
    var zoom = this.getZoom(),
        latLng = marker && this.hasLayer(marker) ? marker.getLatLng().wrap() : this.getCenter().wrap(),
        str = window.location.hostname.match(/^www\.openstreetmap\.org/i) ?
          window.location.protocol + "//osm.org/go/" :
          window.location.protocol + "//" + window.location.hostname + "/go/",
        char_array = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_~",
        x = Math.round((latLng.lng + 180.0) * ((1 << 30) / 90.0)),
        y = Math.round((latLng.lat + 90.0) * ((1 << 30) / 45.0)),
        // JavaScript only has to keep 32 bits of bitwise operators, so this has to be
        // done in two parts. each of the parts c1/c2 has 30 bits of the total in it
        // and drops the last 4 bits of the full 64 bit Morton code.
        c1 = interlace(x >>> 17, y >>> 17), c2 = interlace((x >>> 2) & 0x7fff, (y >>> 2) & 0x7fff),
        digit,
        i;

    for (i = 0; i < Math.ceil((zoom + 8) / 3.0) && i < 5; ++i) {
      digit = (c1 >> (24 - (6 * i))) & 0x3f;
      str += char_array.charAt(digit);
    }
    for (i = 5; i < Math.ceil((zoom + 8) / 3.0); ++i) {
      digit = (c2 >> (24 - (6 * (i - 5)))) & 0x3f;
      str += char_array.charAt(digit);
    }
    for (i = 0; i < ((zoom + 8) % 3); ++i) str += "-";

    // Called to interlace the bits in x and y, making a Morton code.
    function interlace(x, y) {
      var interlaced_x = x,
          interlaced_y = y;
      interlaced_x = (interlaced_x | (interlaced_x << 8)) & 0x00ff00ff;
      interlaced_x = (interlaced_x | (interlaced_x << 4)) & 0x0f0f0f0f;
      interlaced_x = (interlaced_x | (interlaced_x << 2)) & 0x33333333;
      interlaced_x = (interlaced_x | (interlaced_x << 1)) & 0x55555555;
      interlaced_y = (interlaced_y | (interlaced_y << 8)) & 0x00ff00ff;
      interlaced_y = (interlaced_y | (interlaced_y << 4)) & 0x0f0f0f0f;
      interlaced_y = (interlaced_y | (interlaced_y << 2)) & 0x33333333;
      interlaced_y = (interlaced_y | (interlaced_y << 1)) & 0x55555555;
      return (interlaced_x << 1) | interlaced_y;
    }

// 2nd line below modified 20210719 by luciano ****************
    var params = {};
    var layers = this.getLayersCode().replace("B", "");

    if (layers) {
      params.layers = layers;
    }

    if (marker && this.hasLayer(marker)) {
      params.m = "";
    }

    if (this._object) {
      params[this._object.type] = this._object.id;
    }

    var query = Qs.stringify(params);
    if (query) {
      str += "?" + query;
    }

    return str;
  },

  getGeoUri: function (marker) {
    var precision = OSM.zoomPrecision(this.getZoom()),
        latLng,
        params = {};

    if (marker && this.hasLayer(marker)) {
      latLng = marker.getLatLng().wrap();
    } else {
      latLng = this.getCenter();
    }

    params.lat = latLng.lat.toFixed(precision);
    params.lon = latLng.lng.toFixed(precision);
    params.zoom = this.getZoom();

    return "geo:" + params.lat + "," + params.lon + "?z=" + params.zoom;
  },

  addObject: function (object, callback) {
    var objectStyle = {
      color: "#FF6200",
      weight: 4,
      opacity: 1,
      fillOpacity: 0.5
    };

    var changesetStyle = {
      weight: 4,
      color: "#FF9500",
      opacity: 1,
      fillOpacity: 0,
      interactive: false
    };

    this.removeObject();

    var map = this;
    this._objectLoader = $.ajax({
      url: OSM.apiUrl(object),
      dataType: "xml",
      success: function (xml) {
        map._object = object;

        map._objectLayer = new L.OSM.DataLayer(null, {
          styles: {
            node: objectStyle,
            way: objectStyle,
            area: objectStyle,
            changeset: changesetStyle
          }
        });

        map._objectLayer.interestingNode = function (node, ways, relations) {
          if (object.type === "node") {
            return true;
          } else if (object.type === "relation") {
            for (var i = 0; i < relations.length; i++) {
              if (relations[i].members.indexOf(node) !== -1) return true;
            }
          } else {
            return false;
          }
        };

        map._objectLayer.addData(xml);
        map._objectLayer.addTo(map);

        if (callback) callback(map._objectLayer.getBounds());
      }
    });
  },

  removeObject: function () {
    this._object = null;
    if (this._objectLoader) this._objectLoader.abort();
    if (this._objectLayer) this.removeLayer(this._objectLayer);
  },

  getState: function () {
    return {
      center: this.getCenter().wrap(),
      zoom: this.getZoom(),
      layers: this.getLayersCode()
    };
  },

  setState: function (state, options) {
    if (state.center) this.setView(state.center, state.zoom, options);
    if (state.layers) this.updateLayers(state.layers);
  },

  setSidebarOverlaid: function (overlaid) {
    if (overlaid && !$("#content").hasClass("overlay-sidebar")) {
      $("#content").addClass("overlay-sidebar");
      this.invalidateSize({ pan: false })
        .panBy([-350, 0], { animate: false });
    } else if (!overlaid && $("#content").hasClass("overlay-sidebar")) {
      this.panBy([350, 0], { animate: false });
      $("#content").removeClass("overlay-sidebar");
      this.invalidateSize({ pan: false });
    }
    return this;
  }
});

L.Icon.Default.imagePath = "/images/";

L.Icon.Default.imageUrls = {
  "/images/marker-icon.png": OSM.MARKER_ICON,
  "/images/marker-icon-2x.png": OSM.MARKER_ICON_2X,
  "/images/marker-shadow.png": OSM.MARKER_SHADOW
};

L.extend(L.Icon.Default.prototype, {
  _oldGetIconUrl: L.Icon.Default.prototype._getIconUrl,

  _getIconUrl: function (name) {
    var url = this._oldGetIconUrl(name);
    return L.Icon.Default.imageUrls[url];
  }
});

OSM.getUserIcon = function (url) {
  return L.icon({
    iconUrl: url || OSM.MARKER_RED,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: OSM.MARKER_SHADOW,
    shadowSize: [41, 41]
  });
};
