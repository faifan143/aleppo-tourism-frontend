"use client";

import { motion } from "framer-motion";
import { Car, Clock, Loader2, MapPin, X } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import PageSpinner from "../ui/PageSpinner";
import { useMokkBar } from "../providers/MokkBarContext";

interface MapModalProps {
  placeLat: number;
  placeLng: number;
  onClose: () => void;
}

// يمكنك استبدال هذا بمفتاح Mapbox الخاص بك
const MAPBOX_TOKEN =
  "pk.eyJ1IjoibW9ra3MiLCJhIjoiY20zdno3MXl1MHozNzJxcXp5bmdvbTllYyJ9.Ed_O6F-c2IZJE9DoCyPZ2Q";
mapboxgl.accessToken = MAPBOX_TOKEN;

export function MapRouteModal({ placeLat, placeLng, onClose }: MapModalProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: string;
  } | null>(null);

  const { setSnackbarConfig } = useMokkBar();

  // الحصول على طريق المسار
  const getRoute = async (start: [number, number], end: [number, number]) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${MAPBOX_TOKEN}`
      );

      if (!response.ok) throw new Error("فشل في جلب معلومات المسار");

      const data = await response.json();

      if (!data.routes || data.routes.length === 0) {
        setSnackbarConfig({
          open: true,
          severity: "warning",
          message: "لم يتم العثور على مسار للوجهة المحددة",
        });
        return;
      }

      const route = data.routes[0].geometry.coordinates;
      const distance = (data.routes[0].distance / 1000).toFixed(1); // المسافة بالكيلومتر
      const duration = Math.ceil(data.routes[0].duration / 60); // المدة بالدقائق
      setRouteInfo({
        distance: parseFloat(distance),
        duration:
          duration > 60
            ? `${Math.floor(duration / 60)} ساعة ${duration % 60} دقيقة`
            : `${duration} دقيقة`,
      });

      if (!map.current) return;

      const sourceId = "route";
      const layerId = "routeLine";

      // إزالة أي مسار موجود من قبل
      if (map.current.getLayer(layerId)) map.current.removeLayer(layerId);
      if (map.current.getSource(sourceId)) map.current.removeSource(sourceId);

      map.current.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: route },
        },
      });

      map.current.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#6366f1",
          "line-width": 4,
          "line-opacity": 0.75,
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "حدث خطأ أثناء تحميل المسار";

      setSnackbarConfig({
        open: true,
        severity: "error",
        message: errorMessage
      });
    }
  };

  useEffect(() => {
    // محاولة الحصول على الموقع الجغرافي بدقة عالية وبغض النظر عن الكاش
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true, // للحصول على أدق موقع ممكن
        timeout: 10000, // 10 ثواني كحد أقصى للحصول على الموقع
        maximumAge: 0 // عدم استخدام الكاش نهائياً، والحصول على موقع جديد كل مرة
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          console.log("تم الحصول على الموقع الحقيقي:", latitude, longitude);
          setUserLocation([longitude, latitude]);
          setLoading(false);
        },
        (error) => {
          console.error("خطأ في الحصول على الموقع:", error);
          setSnackbarConfig({
            open: true,
            severity: "error",
            message: "فشل في الوصول إلى موقعك. يرجى تفعيل خدمة GPS.",
          });
          setLoading(false);
        },
        options
      );
    } else {
      setSnackbarConfig({
        open: true,
        severity: "error",
        message: "متصفحك لا يدعم خدمات تحديد الموقع الجغرافي.",
      });
      setLoading(false);
    }
  }, [setSnackbarConfig]);

  useEffect(() => {
    let mounted = true;

    if (!map.current && mapContainer.current && userLocation && !loading) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [
          (userLocation[0] + placeLng) / 2,
          (userLocation[1] + placeLat) / 2,
        ],
        zoom: 12,
        language: 'en', // تعيين لغة الخريطة إلى العربية
        attributionControl: false, // Disable attribution control
      });

      map.current.on("load", () => {
        if (!mounted || !map.current) return;

        new mapboxgl.Marker({ color: "#3B82F6" })
          .setLngLat(userLocation)
          .setPopup(new mapboxgl.Popup().setHTML("<p>موقعك الحالي</p>"))
          .addTo(map.current);

        new mapboxgl.Marker({ color: "#8B5CF6" })
          .setLngLat([placeLng, placeLat])
          .setPopup(new mapboxgl.Popup().setHTML("<p>الوجهة</p>"))
          .addTo(map.current);

        getRoute(userLocation, [placeLng, placeLat]);

        const bounds = new mapboxgl.LngLatBounds()
          .extend(userLocation)
          .extend([placeLng, placeLat]);

        map.current.fitBounds(bounds, { padding: 50, duration: 1000 });
      });

      map.current.addControl(new mapboxgl.NavigationControl());
    }

    return () => {
      mounted = false;
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [userLocation, placeLat, placeLng, loading]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="min-h-screen flex items-center justify-center p-4">
        {!routeInfo && <PageSpinner />}
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden max-h-[90vh]"
        >
          <div className="bg-gradient-to-r from-amber-900 to-amber-600 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2 text-white">
              <MapPin className="w-5 h-5" />
              <h3 className="text-lg font-semibold">خريطة المسار</h3>
              {routeInfo && (
                <div className="flex items-center gap-4 mr-4">
                  <span className="flex items-center gap-1">
                    <Car className="w-4 h-4" />
                    {routeInfo.distance} كم
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {routeInfo.duration}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="relative h-[600px]">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="flex items-center gap-2 text-amber-900">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>جاري تحميل الخريطة...</span>
                </div>
              </div>
            ) : (
              <div ref={mapContainer} className="w-full h-full" />
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}