import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import { MapPin, Navigation, AlertCircle, Loader, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useTheme } from '../context/ThemeContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom icon for User's location
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to recenter map when location changes
const RecenterAutomatically = ({lat, lng}) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

const Locations = () => {
  const [location, setLocation] = useState({ lat: 40.7128, lng: -74.0060 }); // Default to NYC
  const [facilities, setFacilities] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasLocation, setHasLocation] = useState(false);
  const { activeTheme } = useTheme();

  const [searchLocation, setSearchLocation] = useState("");

  useEffect(() => {
    getUserLocation();
  }, []);

  const handleManualSearch = async (e) => {
    e?.preventDefault();
    if (!searchLocation.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchLocation)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setLocation({ lat, lng });
        setHasLocation(true);
        fetchNearbyFacilities(lat, lng);
      } else {
        setError("Location not found. Try a different city or zip code.");
        setLoading(false);
      }
    } catch (err) {
      setError("Failed to search location.");
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    setLoading(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLocation({ lat, lng });
        setHasLocation(true);
        fetchNearbyFacilities(lat, lng);
      },
      (err) => {
        console.warn(`ERROR(${err.code}): ${err.message}`);
        setError("Could not access your location. Showing default map.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const fetchNearbyFacilities = async (lat, lng) => {
    setLoading(true);
    // Fetch from OpenStreetMap Overpass API (Free)
    const radius = 10000; // 10km radius
    const query = `
      [out:json];
      (
        node["amenity"="recycling"](around:${radius}, ${lat}, ${lng});
        way["amenity"="recycling"](around:${radius}, ${lat}, ${lng});
        node["amenity"="waste_disposal"](around:${radius}, ${lat}, ${lng});
        way["amenity"="waste_disposal"](around:${radius}, ${lat}, ${lng});
        node["amenity"="waste_basket"](around:${radius}, ${lat}, ${lng});
      );
      out center;
    `;
    
    try {
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      const parsedFacilities = data.elements.map(el => {
        const fLat = el.lat || el.center?.lat;
        const fLng = el.lon || el.center?.lon;
        
        let defaultName = "Local Recycling Center";
        let defaultType = "General Waste & Recycling";
        
        if (el.tags?.amenity === "waste_basket") {
          defaultName = "Public Dustbin";
          defaultType = "General Waste";
        } else if (el.tags?.amenity === "waste_disposal") {
          defaultName = "Waste Disposal Site";
          defaultType = "Waste Management";
        }
        
        const name = el.tags?.name || defaultName;
        const type = el.tags?.recycling_type || el.tags?.waste || defaultType;
        const dist = getDistanceFromLatLonInKm(lat, lng, fLat, fLng);
        
        return {
          id: el.id,
          name,
          type,
          lat: fLat,
          lng: fLng,
          distance: dist
        };
      }).filter(f => f.lat && f.lng)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 15); // Top 15 closest
        
      setFacilities(parsedFacilities);
    } catch (err) {
      console.error("Error fetching facilities:", err);
      setError("Failed to fetch real-time recycling data.");
    } finally {
      setLoading(false);
    }
  };

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2-lat1); 
    const dLon = deg2rad(lon2-lon1); 
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; 
  };

  const deg2rad = (deg) => deg * (Math.PI/180);

  const getDirectionsUrl = (destLat, destLng) => {
    if (hasLocation) {
      return `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${destLat},${destLng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${destLat},${destLng}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-500 dark:from-green-400 dark:to-emerald-300 bg-clip-text text-transparent">
            Nearby Facilities
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Locate recycling bins and centers, complete with exact distances and directions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar Controls & List */}
        <div className="lg:col-span-1 space-y-4">
          <GlassCard className="p-4 flex flex-col gap-4">
            <button 
              onClick={getUserLocation}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-green-500/10 dark:bg-green-500/20 hover:bg-green-500/20 dark:hover:bg-green-500/30 text-green-700 dark:text-green-300 py-3 rounded-lg transition-colors border border-green-500/30 font-medium"
            >
              {loading ? <Loader size={18} className="animate-spin" /> : <Navigation size={18} />}
              {loading ? "Scanning Area..." : "Use My GPS Location"}
            </button>

            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-200 dark:border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-200 dark:border-white/10"></div>
            </div>

            <form onSubmit={handleManualSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter City or Zip Code"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full bg-white dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-green-500/50"
              />
              <button 
                type="submit"
                disabled={loading}
                className="bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white px-3 py-2 rounded-lg transition-colors border border-gray-300 dark:border-white/10"
              >
                Search
              </button>
            </form>
          </GlassCard>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 text-red-200 text-sm"
            >
              <AlertCircle size={20} className="text-red-400 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {facilities.length > 0 ? facilities.map((facility, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={facility.id}
              >
                <GlassCard className="p-4 hover:border-green-500/30 transition-colors group">
                  <h4 className="text-gray-900 dark:text-white font-semibold mb-1 truncate">{facility.name}</h4>
                  <div className="flex justify-between items-center text-sm mb-3">
                    <span className="text-gray-500 dark:text-gray-400 capitalize truncate max-w-[60%]">{facility.type}</span>
                    <span className="text-green-700 dark:text-green-400 font-mono bg-green-50 dark:bg-green-400/10 px-2 py-0.5 rounded">
                      {facility.distance.toFixed(1)} km
                    </span>
                  </div>
                  <a 
                    href={getDirectionsUrl(facility.lat, facility.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/30 text-blue-700 dark:text-blue-300 py-2 rounded border border-blue-200 dark:border-blue-500/20 transition-colors text-sm font-medium"
                  >
                    Get Directions
                    <ExternalLink size={14} />
                  </a>
                </GlassCard>
              </motion.div>
            )) : !loading && hasLocation && (
              <GlassCard className="p-6 text-center text-gray-500 dark:text-gray-400">
                <MapPin size={32} className="mx-auto mb-3 opacity-20" />
                <p>No recycling facilities found within 10km.</p>
              </GlassCard>
            )}
          </div>
        </div>

        {/* Interactive Map Container */}
        <div className="lg:col-span-3 h-[400px] lg:h-[600px]">
          <GlassCard className="!p-2 relative overflow-hidden" tilt={false} fullHeight>
            <div className="w-full h-full rounded-lg overflow-hidden bg-gray-200 dark:bg-black/50 relative border border-gray-300 dark:border-white/5">
              <div className="w-full h-full" style={{ filter: activeTheme === 'dark' ? 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)' : 'none' }}>
                  <MapContainer 
                      center={[location.lat, location.lng]} 
                      zoom={13} 
                      scrollWheelZoom={true} 
                      style={{ height: "100%", width: "100%" }}
                  >
                      <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <RecenterAutomatically lat={location.lat} lng={location.lng} />
                      
                      {/* User Location Marker */}
                      {hasLocation && (
                          <Marker position={[location.lat, location.lng]} icon={userIcon}>
                              <Popup>You are here!</Popup>
                          </Marker>
                      )}

                      {/* Facility Markers */}
                      {facilities.map(facility => (
                          <Marker key={facility.id} position={[facility.lat, facility.lng]}>
                              <Popup>
                                  <strong>{facility.name}</strong><br/>
                                  {facility.distance.toFixed(1)} km away
                              </Popup>
                          </Marker>
                      ))}
                  </MapContainer>
              </div>
              
              {/* Overlay badge */}
              <div className="absolute top-4 left-4 bg-white/80 dark:bg-black/60 backdrop-blur-md border border-gray-200 dark:border-white/10 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg z-[1000]">
                <MapPin size={16} className="text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {hasLocation ? "Live Interactive Map" : "Waiting for location..."}
                </span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Locations;
