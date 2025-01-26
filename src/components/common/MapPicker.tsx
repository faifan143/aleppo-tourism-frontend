import { MapPin } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";

interface MapPickerProps {
  latitude?: number;
  longitude?: number;
  onChange: (lat: number, lng: number) => void;
}

const MAPBOX_TOKEN =
  "pk.eyJ1IjoibW9ra3MiLCJhIjoiY20zdno3MXl1MHozNzJxcXp5bmdvbTllYyJ9.Ed_O6F-c2IZJE9DoCyPZ2Q";
mapboxgl.accessToken = MAPBOX_TOKEN;

export function MapPicker({
  latitude: initialLat = 36.1995, // Default latitude: Aleppo Citadel
  longitude: initialLng = 37.162, // Default longitude: Aleppo Citadel
  onChange,
}: MapPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [zoom] = useState(15);
  const [markerLocation, setMarkerLocation] = useState<[number, number]>([
    initialLng,
    initialLat,
  ]);

  useEffect(() => {
    if (!map.current && mapContainer.current) {
      // Initialize the map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [initialLng, initialLat],
        zoom: zoom,
      });

      // Add controls
      map.current.addControl(new mapboxgl.NavigationControl());

      // Initialize marker
      marker.current = new mapboxgl.Marker({
        draggable: true,
        color: "#6366f1",
      })
        .setLngLat([initialLng, initialLat])
        .addTo(map.current);

      // Update marker location when dragging
      marker.current.on("dragend", () => {
        const lngLat = marker.current?.getLngLat();
        if (lngLat) {
          setMarkerLocation([lngLat.lng, lngLat.lat]);
          onChange(lngLat.lat, lngLat.lng);
        }
      });

      // Place a marker at the clicked location
      map.current.on("click", (e) => {
        const { lng, lat } = e.lngLat;

        marker.current?.setLngLat([lng, lat]);
        setMarkerLocation([lng, lat]);
        onChange(lat, lng);
      });
    }
  }, [initialLat, initialLng, zoom, onChange]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <MapPin className="w-4 h-4" />
          <span>اختر الموقع على الخريطة</span>
        </div>
      </div>

      <div className="relative h-[300px] rounded-xl overflow-hidden border-2 border-gray-100 hover:border-purple-400 transition-colors">
        <div ref={mapContainer} className="w-full h-full" />
      </div>

      <div className="flex justify-between text-sm text-gray-500">
        <span>خط العرض: {markerLocation[1].toFixed(4)}</span>
        <span>خط الطول: {markerLocation[0].toFixed(4)}</span>
      </div>
    </div>
  );
}
