import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { TourismPlace, PlaceCategory } from "@/types/type";
import { API_URL } from "@/utils/axios";

// Fix Leaflet's default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const categoryColors: Record<PlaceCategory, string> = {
  ARCHAEOLOGICAL: "#d7263d",
  RESTAURANT: "#1fa774",
  ENTERTAINMENT: "#fbb13c",
  RELIGIOUS: "#7c3aed",
  EDUCATIONAL: "#2563eb",
};

const categoryLabels: Record<PlaceCategory, string> = {
  ARCHAEOLOGICAL: "أثري",
  RESTAURANT: "مطعم",
  ENTERTAINMENT: "ترفيهي",
  RELIGIOUS: "ديني",
  EDUCATIONAL: "تعليمي",
};

function getImageUrl(path: string) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_URL}${path}`;
}

interface MapViewProps {
  places: TourismPlace[];
}

const MapView: React.FC<MapViewProps> = ({ places }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current) return;

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [36.216667, 37.166668], // Aleppo coordinates
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // Add multiple tile layer options for better reliability
      const osmLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      });

      const cartoLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      });

      // Try Carto first (better styling), fallback to OSM
      cartoLayer.addTo(mapInstanceRef.current);

      cartoLayer.on('tileerror', () => {
        console.log('Carto tiles failed, switching to OpenStreetMap');
        mapInstanceRef.current?.removeLayer(cartoLayer);
        osmLayer.addTo(mapInstanceRef.current!);
      });
    }

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });

    markersRef.current = [];

    // Add markers for places
    places.forEach((place) => {
      if (!mapInstanceRef.current) return;

      // Create custom icon
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background-color: ${categoryColors[place.category]};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            color: white;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s;
          ">
            ${getCategoryIcon(place.category)}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      // Create marker
      const marker = L.marker([place.latitude, place.longitude], {
        icon: customIcon,
        title: place.name,
      });

      // Create popup content
      const popupContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-width: 200px;">
          <div style="margin-bottom: 8px;">
            <img src="${getImageUrl(place.coverImage)}" alt="${place.name}" 
                 style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px;" />
          </div>
          <h3 style="margin: 0 0 8px 0; color: #92400e; font-size: 16px; font-weight: bold;">
            ${place.name}
          </h3>
          <div style="background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 12px; 
                      font-size: 12px; margin-bottom: 8px; display: inline-block;">
            ${categoryLabels[place.category]}
          </div>
          <p style="margin: 0 0 8px 0; color: #666; font-size: 14px; line-height: 1.4;">
            ${place.description.substring(0, 100)}${place.description.length > 100 ? '...' : ''}
          </p>
          <div style="color: #888; font-size: 12px; margin-bottom: 8px;">
            <strong>أوقات الزيارة:</strong> ${place.visitTimeRange || 'غير محدد'}
          </div>
          <div style="text-align: center; margin-top: 12px;">
            <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}', '_blank')"
                    style="background: linear-gradient(135deg, #d97706, #f59e0b); color: white; border: none; 
                           padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px;
                           transition: transform 0.2s;">
              🗺️ الاتجاهات
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 250,
        className: 'custom-popup',
      });

      // Add hover effects
      marker.on('mouseover', function (this: L.Marker) {
        this.getElement()?.classList.add('marker-hover');
      });

      marker.on('mouseout', function (this: L.Marker) {
        this.getElement()?.classList.remove('marker-hover');
      });

      marker.addTo(mapInstanceRef.current);
      markersRef.current.push(marker);
    });

    // Fit map to show all markers if places exist
    if (places.length > 0 && markersRef.current.length > 0) {
      const group = new L.FeatureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }

    // Add custom CSS for better popup styling
    if (typeof window !== 'undefined' && !document.getElementById('leaflet-custom-styles')) {
      const style = document.createElement('style');
      style.id = 'leaflet-custom-styles';
      style.textContent = `
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          border: 1px solid #f3f4f6;
        }
        .custom-popup .leaflet-popup-tip {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .custom-marker.marker-hover div {
          transform: scale(1.1);
          transition: transform 0.2s;
        }
      `;
      document.head.appendChild(style);
    }

    // Cleanup function
    return () => {
      markersRef.current.forEach(marker => {
        mapInstanceRef.current?.removeLayer(marker);
      });
      markersRef.current = [];
    };
  }, [places, isClient]);

  // Clean up map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const getCategoryIcon = (category: PlaceCategory): string => {
    switch (category) {
      case 'ARCHAEOLOGICAL': return '🏛️';
      case 'RESTAURANT': return '🍽️';
      case 'ENTERTAINMENT': return '🎭';
      case 'RELIGIOUS': return '🕌';
      case 'EDUCATIONAL': return '🎓';
      default: return '📍';
    }
  };

  if (!isClient) {
    return (
      <div
        style={{
          width: "100%",
          height: "70vh",
          borderRadius: 16,
          backgroundColor: "#fef3c7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid #fbbf24"
        }}
      >
        <div style={{ textAlign: 'center', color: '#92400e' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🗺️</div>
          <div style={{ fontWeight: 'bold' }}>جاري تحميل الخريطة...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "70vh",
        borderRadius: 16,
        overflow: 'hidden',
        border: "2px solid #fbbf24",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
      }}
    />
  );
};

export default MapView;