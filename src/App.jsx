import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';

// --- আইকনিক শহর ও দেশের ছবির ডেটাবেস ---
const regionalLandmarks = {
  "london": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=300&q=80",
  "new york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=300&q=80",
  "paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=300&q=80",
  "tokyo": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=300&q=80",
  "dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=300&q=80",
  "mumbai": "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=300&q=80",
  "delhi": "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=300&q=80",
  "india": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=300&q=80", 
  "bangladesh": "https://images.unsplash.com/photo-1623594273574-e36214828114?auto=format&fit=crop&w=300&q=80",
  "japan": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=300&q=80",
  "usa": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=300&q=80",
  "uk": "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=300&q=80",
  "australia": "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=300&q=80",
  "brazil": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=300&q=80",
  "default": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=300&q=80"
};

const Atmosphere = () => {
  const vertexShader = `
    varying vec3 vNormal;
    void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `;
  const fragmentShader = `
    varying vec3 vNormal;
    void main() { float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 4.0); gl_FragColor = vec4(0.18, 0.58, 1.0, 1.0) * intensity; }
  `;
  return (
    <mesh>
      <sphereGeometry args={[1.18, 64, 64]} />
      <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} blending={THREE.AdditiveBlending} side={THREE.BackSide} transparent={true} depthWrite={false} />
    </mesh>
  );
};

// --- থ্রিডি পৃথিবী ও AR পপ-আপ ---
const Earth = ({ weatherData, targetCoords, onGlobeClick }) => {
  const earthRef = useRef();
  const [colorMap, bumpMap] = useTexture([
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    'https://unpkg.com/three-globe/example/img/earth-topology.png'
  ]);

  useFrame(() => {
    if (earthRef.current) earthRef.current.rotation.y += 0.0010;
  });

  const get3DPosition = (lat, lon, radius = 1.05) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return [
      -(radius * Math.sin(phi) * Math.cos(theta)),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    ];
  };

  const handleClick = (event) => {
    event.stopPropagation();
    const intersect = event.intersections[0];
    if (!intersect) return;

    const point = intersect.point.clone();
    earthRef.current.worldToLocal(point);
    point.normalize();

    const lat = 90 - (Math.acos(point.y) * 180) / Math.PI;
    const lon = (270 + (Math.atan2(point.x, point.z) * 180) / Math.PI) % 360 - 180;
    
    onGlobeClick(lat, lon);
  };

  let bgUrl = regionalLandmarks["default"];
  if (weatherData && weatherData.location) {
    const locName = weatherData.location.toLowerCase();
    for (let key in regionalLandmarks) {
      if (locName.includes(key)) { bgUrl = regionalLandmarks[key]; break; }
    }
  }

  return (
    <group ref={earthRef}>
      <mesh onClick={handleClick}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial map={colorMap} bumpMap={bumpMap} bumpScale={0.015} roughness={0.7} metalness={0.05} />
      </mesh>
      <Atmosphere />
      
      {targetCoords && weatherData && (
        <Html position={get3DPosition(targetCoords.lat, targetCoords.lon)} center>
          <div className="pointer-events-none transform -translate-y-12">
            <div className="relative w-40 h-16 rounded-xl border border-cyan-400/50 shadow-[0_0_20px_rgba(76,215,246,0.5)] overflow-hidden flex flex-col justify-center text-center">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-screen transition-all duration-500"
                style={{ backgroundImage: `url('${bgUrl}')` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f131d]/95 to-transparent"></div>
              
              <div className="relative z-10 px-1">
                <p className="text-white font-bold text-sm drop-shadow-lg truncate">{weatherData.location}</p>
                <p className="text-cyan-400 text-[10px] font-bold drop-shadow-lg mt-0.5">{weatherData.temp}°C • {weatherData.status}</p>
              </div>
            </div>
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-cyan-400/70 mx-auto"></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full mx-auto mt-1 shadow-[0_0_10px_#4cd7f6] animate-pulse"></div>
          </div>
        </Html>
      )}
    </group>
  );
};

export default function App() {
  const [searchCity, setSearchCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [targetCoords, setTargetCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Edit Modal & Saved Locations States
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ temp: '', status: '', rain: '' });
  
  const [savedLocations, setSavedLocations] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);

  const getRealLocationName = async (lat, lon) => {
    try {
      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
      const data = await res.json();
      return data.city || data.locality || data.principalSubdivision || data.countryName || `Lat: ${lat.toFixed(1)}, Lon: ${lon.toFixed(1)}`;
    } catch (e) {
      return `Lat: ${lat.toFixed(1)}, Lon: ${lon.toFixed(1)}`;
    }
  };

  const fetchWeather = async (city = '', lat = null, lon = null) => {
    setLoading(true);
    try {
      let finalCity = city;
      if (lat !== null && lon !== null) {
        setTargetCoords({ lat, lon });
        finalCity = await getRealLocationName(lat, lon);
      }

      let url = `/data?city=${finalCity || 'Kolkata'}`;
      if (lat !== null && lon !== null) url += `&lat=${lat}&lon=${lon}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (!data.error) {
        if(lat !== null && lon !== null) data.location = finalCity;
        setWeatherData(data);
        if(!targetCoords && data.lat) setTargetCoords({lat: data.lat, lon: data.lon});
      }
    } catch (err) {
      console.error("API Error:", err);
    }
    setLoading(false);
  };

  const handleGlobeClick = (lat, lon) => {
    setSearchCity(''); 
    fetchWeather('', lat, lon);
  };

  // --- লোকেশন পিন (Save) করার লজিক ---
  const toggleSaveLocation = (specificLoc = null) => {
    const locToToggle = specificLoc || { name: weatherData.location, lat: targetCoords.lat, lon: targetCoords.lon };
    if (!locToToggle.name) return;

    const isSaved = savedLocations.some(s => s.name === locToToggle.name);
    let newList;
    if (isSaved) {
      newList = savedLocations.filter(s => s.name !== locToToggle.name); // Remove if exists
    } else {
      newList = [...savedLocations, locToToggle]; // Add new
    }
    setSavedLocations(newList);
    localStorage.setItem('stormSentinel_saved', JSON.stringify(newList));
  };

  const handleOverrideSubmit = async () => {
    if (!weatherData) return;
    try {
      await fetch('/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: weatherData.location,
          temp: editForm.temp,
          status: editForm.status,
          rain_chance: editForm.rain
        })
      });
      setShowEdit(false);
      fetchWeather(weatherData.location, targetCoords?.lat, targetCoords?.lon);
    } catch (e) {
      alert("Failed to update data.");
    }
  };

  // --- প্রথমবার লোড হওয়ার সময় Auto GPS ও Saved List আনা ---
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('stormSentinel_saved')) || [];
    setSavedLocations(stored);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather('', position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("GPS Access Denied. Defaulting to Kolkata.");
          fetchWeather('Kolkata');
        }
      );
    } else {
      fetchWeather('Kolkata');
    }
  }, []);

  const isCurrentlySaved = savedLocations.some(s => s.name === weatherData?.location);

  return (
    <div className="w-full h-screen bg-[#0f131d] relative font-sans overflow-hidden text-slate-200">
      
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-col md:flex-row gap-3 justify-between items-start md:items-center pointer-events-auto">
        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl shadow-lg w-full md:w-auto">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-cyan-400/10 border border-cyan-400/30 rounded-xl flex items-center justify-center text-lg md:text-xl shadow-[0_0_15px_rgba(76,215,246,0.2)]">⚡</div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-wide">StormSentinel</h1>
            <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-cyan-400">Live Intelligence</p>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto justify-end">
          <input 
            type="text" 
            placeholder="Search city..." 
            className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-cyan-400/50 text-sm w-full md:w-64 backdrop-blur-md hidden md:block"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchWeather(searchCity)}
          />
          {/* Pinned Bookmarks Button */}
          <button 
            onClick={() => setShowBookmarks(!showBookmarks)}
            className={`border px-4 py-2.5 rounded-xl transition text-sm font-medium shrink-0 flex items-center gap-2 ${showBookmarks ? 'bg-cyan-400/20 border-cyan-400/50 text-cyan-400' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
          >
            📌 <span className="hidden md:inline">Saved</span> 
            <span className="bg-cyan-400 text-black text-[10px] font-bold px-1.5 rounded-full">{savedLocations.length}</span>
          </button>
        </div>
      </div>

      {/* Bookmarks/Saved Locations Sidebar */}
      {showBookmarks && (
        <div className="absolute top-20 right-4 z-20 w-64 max-h-[60vh] overflow-y-auto bg-black/60 backdrop-blur-xl border border-cyan-400/30 p-4 rounded-2xl shadow-2xl pointer-events-auto">
          <h3 className="text-white font-bold mb-3 border-b border-white/10 pb-2 text-sm">📌 Pinned Locations</h3>
          {savedLocations.length === 0 ? (
            <p className="text-xs text-slate-400">No locations saved yet. Click the 📍 icon next to a location name to save it.</p>
          ) : (
            <div className="space-y-2">
              {savedLocations.map((loc, idx) => (
                <div 
                  key={idx} 
                  className="flex justify-between items-center bg-white/5 hover:bg-white/10 p-2.5 rounded-xl cursor-pointer border border-transparent hover:border-cyan-400/30 transition group" 
                  onClick={() => { fetchWeather('', loc.lat, loc.lon); setShowBookmarks(false); }}
                >
                  <p className="text-sm font-semibold text-white truncate w-3/4">{loc.name}</p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleSaveLocation(loc); }} 
                    className="text-slate-500 hover:text-red-400 transition opacity-0 group-hover:opacity-100 text-xs"
                    title="Remove"
                  >✖</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Data Panel */}
      <div className="absolute bottom-4 left-4 right-4 md:bottom-auto md:top-28 md:w-72 z-10 pointer-events-auto">
        {/* Mobile Search Bar (Only shows on mobile) */}
        <div className="flex md:hidden mb-2 gap-2">
          <input 
            type="text" 
            placeholder="Search city..." 
            className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-cyan-400/50 text-sm w-full backdrop-blur-md"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchWeather(searchCity)}
          />
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-white text-sm md:text-base">Local Metrics</h2>
            <span className="flex items-center gap-1.5 text-[9px] md:text-[10px] text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>LIVE
            </span>
          </div>

          {weatherData ? (
            <div className="space-y-3">
              <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex justify-between items-center">
                <div className="overflow-hidden flex-1">
                  <p className="text-[9px] uppercase tracking-widest text-slate-400">Location</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-white font-bold text-base truncate">{weatherData.location}</p>
                    {/* Pin/Unpin Button */}
                    <button 
                      onClick={() => toggleSaveLocation()} 
                      className={`text-lg transition-transform hover:scale-110 ${isCurrentlySaved ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(76,215,246,0.8)]' : 'text-slate-500 hover:text-slate-300'}`}
                      title="Save Location"
                    >
                      {isCurrentlySaved ? '📌' : '📍'}
                    </button>
                  </div>
                </div>
                <p className="text-cyan-400 font-bold text-2xl shrink-0 ml-2">{weatherData.temp}°C</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 border border-white/5 p-2.5 rounded-xl">
                  <p className="text-[9px] uppercase tracking-widest text-slate-400">Wind Speed</p>
                  <p className="text-white text-sm mt-1">{weatherData.wind} km/h</p>
                </div>
                <div className="bg-white/5 border border-white/5 p-2.5 rounded-xl">
                  <p className="text-[9px] uppercase tracking-widest text-slate-400">Status</p>
                  <p className={`font-semibold text-sm mt-1 ${weatherData.risk === 'CRITICAL' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {weatherData.status}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowEdit(true)}
                className="w-full mt-2 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 py-2.5 rounded-xl text-xs font-semibold hover:bg-yellow-400/20 transition flex items-center justify-center gap-2"
              >
                ✏️ Correct Data
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-400 animate-pulse">Awaiting telemetry...</p>
          )}
        </div>
      </div>

      {/* Correct Data Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pointer-events-auto">
          <div className="bg-[#0f131d] border border-cyan-400/30 p-5 rounded-2xl w-full max-w-sm shadow-2xl relative">
            <button onClick={() => setShowEdit(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
            <h2 className="text-lg font-bold text-white mb-1">Manual Override</h2>
            <p className="text-xs text-cyan-400 mb-5">{weatherData?.location}</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-slate-400">Weather Status</label>
                <input type="text" placeholder="e.g. Clear, Storm" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 mt-1 text-sm text-white outline-none focus:border-cyan-400" onChange={e => setEditForm({...editForm, status: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-slate-400">Temp (°C)</label>
                  <input type="number" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 mt-1 text-sm text-white outline-none focus:border-cyan-400" onChange={e => setEditForm({...editForm, temp: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-slate-400">Rain (%)</label>
                  <input type="number" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 mt-1 text-sm text-white outline-none focus:border-cyan-400" onChange={e => setEditForm({...editForm, rain: e.target.value})} />
                </div>
              </div>
              <button onClick={handleOverrideSubmit} className="w-full bg-cyan-400 text-black font-bold py-2.5 rounded-lg mt-2 hover:bg-cyan-300 transition shadow-[0_0_15px_rgba(76,215,246,0.4)]">
                Transmit Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* থ্রিডি ক্যানভাস */}
      <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 3, 4]} intensity={2.0} />
        <Stars radius={100} depth={50} count={500} factor={4} saturation={0} fade speed={1} />
        <Earth weatherData={weatherData} targetCoords={targetCoords} onGlobeClick={handleGlobeClick} />
        <OrbitControls enablePan={false} enableDamping dampingFactor={0.05} minDistance={1.5} maxDistance={4} />
      </Canvas>
    </div>
  );
              }
    
