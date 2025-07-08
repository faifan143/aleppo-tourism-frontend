import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { MapPin } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Types
interface Coordinates {
    longitude: string;
    latitude: string;
}

interface MapPickerProps {
    longitude?: string;
    latitude?: string;
    onLocationChange: (coordinates: Coordinates) => void;
    className?: string;
    height?: string;
    defaultCenter?: [number, number];
    defaultZoom?: number;
    markerColor?: string;
    showNavigationControls?: boolean;
    enableGeolocation?: boolean;
    instructionText?: string;
    mapboxToken?: string;
}

// Constants
const DEFAULT_MAPBOX_TOKEN = 'pk.eyJ1IjoibW9ra3MiLCJhIjoiY20zdno3MXl1MHozNzJxcXp5bmdvbTllYyJ9.Ed_O6F-c2IZJE9DoCyPZ2Q';
const DEFAULT_CENTER: [number, number] = [36.2765, 33.5138]; // Damascus, Syria
const DEFAULT_ZOOM = 10;
const DEFAULT_MARKER_COLOR = "#4F46E5";
const DEFAULT_HEIGHT = "h-72";

// Utility functions
const parseCoordinates = (lng: string, lat: string): [number, number] | null => {
    const longitude = parseFloat(lng);
    const latitude = parseFloat(lat);

    if (isNaN(longitude) || isNaN(latitude)) {
        return null;
    }

    // Validate coordinate ranges
    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
        console.warn('Invalid coordinates provided:', { longitude, latitude });
        return null;
    }

    return [longitude, latitude];
};

const formatCoordinates = (lng: number, lat: number): Coordinates => ({
    longitude: lng.toFixed(6),
    latitude: lat.toFixed(6)
});

// Main Component
export const MapPicker: React.FC<MapPickerProps> = ({
    longitude = "",
    latitude = "",
    onLocationChange,
    className = "",
    height = DEFAULT_HEIGHT,
    defaultCenter = DEFAULT_CENTER,
    defaultZoom = DEFAULT_ZOOM,
    markerColor = DEFAULT_MARKER_COLOR,
    showNavigationControls = true,
    enableGeolocation = true,
    instructionText = "Click on the map to select location",
    mapboxToken = DEFAULT_MAPBOX_TOKEN
}) => {
    // Refs
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const marker = useRef<mapboxgl.Marker | null>(null);
    const isInitialized = useRef(false);
    const onLocationChangeRef = useRef(onLocationChange);

    // Update callback ref
    useEffect(() => {
        onLocationChangeRef.current = onLocationChange;
    }, [onLocationChange]);

    // Memoized map options
    const mapOptions = useMemo(() => ({
        style: 'mapbox://styles/mapbox/streets-v11',
        center: defaultCenter,
        zoom: defaultZoom,
        attributionControl: false, // Remove attribution
        logoPosition: 'bottom-right' as const
    }), [defaultCenter, defaultZoom]);

    // Marker management functions
    const removeMarker = useCallback(() => {
        if (marker.current) {
            marker.current.remove();
            marker.current = null;
        }
    }, []);

    const createMarker = useCallback((coordinates: [number, number], shouldNotify = true) => {
        if (!map.current) return;

        try {
            removeMarker();

            marker.current = new mapboxgl.Marker({
                color: markerColor,
                draggable: true
            })
                .setLngLat(coordinates)
                .addTo(map.current);

            // Notify parent if requested
            if (shouldNotify) {
                const formattedCoords = formatCoordinates(coordinates[0], coordinates[1]);
                onLocationChangeRef.current(formattedCoords);
            }

            // Add drag handler
            marker.current.on('dragend', () => {
                if (marker.current) {
                    const lngLat = marker.current.getLngLat();
                    const formattedCoords = formatCoordinates(lngLat.lng, lngLat.lat);
                    onLocationChangeRef.current(formattedCoords);
                }
            });
        } catch (error) {
            console.error("Error creating marker:", error);
        }
    }, [markerColor, removeMarker]);

    // Geolocation handler
    const handleGeolocation = useCallback(() => {
        if (!enableGeolocation || !navigator.geolocation || !map.current) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                if (!map.current) return;

                const { longitude: lng, latitude: lat } = position.coords;
                const coordinates: [number, number] = [lng, lat];

                map.current.flyTo({
                    center: coordinates,
                    zoom: 14,
                    essential: true
                });

                // Only create marker if no coordinates are provided
                if (!longitude && !latitude) {
                    createMarker(coordinates, true);
                }
            },
            (error) => {
                console.warn("Geolocation error:", error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    }, [enableGeolocation, longitude, latitude, createMarker]);

    // Map initialization
    useEffect(() => {
        if (isInitialized.current || !mapContainer.current) return;

        // Set Mapbox token
        mapboxgl.accessToken = mapboxToken;

        try {
            isInitialized.current = true;

            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                ...mapOptions
            });

            // Add navigation controls
            if (showNavigationControls) {
                const nav = new mapboxgl.NavigationControl({
                    showCompass: true,
                    showZoom: true,
                    visualizePitch: true
                });
                map.current.addControl(nav, 'top-right');
            }

            // Map click handler
            map.current.on('click', (e) => {
                const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
                createMarker(coordinates, true);
            });

            // Handle geolocation
            handleGeolocation();

            console.log('Map initialized successfully');

        } catch (error) {
            console.error("Error initializing map:", error);
            isInitialized.current = false;
        }

        // Cleanup
        return () => {
            try {
                removeMarker();
                if (map.current) {
                    map.current.remove();
                    map.current = null;
                }
                isInitialized.current = false;
            } catch (error) {
                console.error("Error during cleanup:", error);
            }
        };
    }, [mapOptions, showNavigationControls, mapboxToken, createMarker, handleGeolocation, removeMarker]);

    // Handle external coordinate changes
    useEffect(() => {
        if (!map.current || !longitude || !latitude) return;

        const coordinates = parseCoordinates(longitude, latitude);
        if (!coordinates) return;

        try {
            createMarker(coordinates, false);
            map.current.flyTo({
                center: coordinates,
                essential: true
            });
        } catch (error) {
            console.error("Error updating marker from props:", error);
        }
    }, [longitude, latitude, createMarker]);

    // Handle marker color changes
    useEffect(() => {
        if (!marker.current || !map.current) return;

        try {
            const currentLngLat = marker.current.getLngLat();
            const coordinates: [number, number] = [currentLngLat.lng, currentLngLat.lat];
            createMarker(coordinates, false);
        } catch (error) {
            console.error("Error updating marker color:", error);
        }
    }, [markerColor, createMarker]);

    // Handle map resize
    useEffect(() => {
        const resizeMap = () => {
            if (map.current) {
                map.current.resize();
            }
        };

        const resizeObserver = new ResizeObserver(resizeMap);
        if (mapContainer.current) {
            resizeObserver.observe(mapContainer.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <div className={`relative ${className}`}>
            <div
                ref={mapContainer}
                className={`${height} rounded-lg border border-gray-300 overflow-hidden`}
                style={{ minHeight: '200px' }}
                role="application"
                aria-label="Interactive map for location selection"
            />
            {instructionText && (
                <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-md text-sm z-10 max-w-xs">
                    <p className="text-gray-700 flex items-center text-xs">
                        <MapPin className="w-3 h-3 mr-1 text-indigo-500 flex-shrink-0" />
                        <span>{instructionText}</span>
                    </p>
                </div>
            )}
        </div>
    );
};