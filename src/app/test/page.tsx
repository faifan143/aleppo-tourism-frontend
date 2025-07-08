"use client"
import { MapPicker } from "@/components/common/MapPicker";
import { Check, Copy, MapPin } from "lucide-react";
import { useState, useCallback } from "react";

interface PresetLocation {
    name: string;
    coords: [number, number];
}

// Main demo page component
export default function MapPickerDemo() {
    const [coordinates, setCoordinates] = useState<{ lat: number, lng: number }>({
        lat: 36.1995,
        lng: 37.162
    });

    const [copied, setCopied] = useState<boolean>(false);

    // Use useCallback to prevent infinite re-renders
    const handleLocationChange = useCallback((lat: number, lng: number) => {
        setCoordinates({ lat, lng });
    }, []);

    const copyCoordinates = (): void => {
        const coordText = `Longitude: ${coordinates.lng}, Latitude: ${coordinates.lat}`;
        navigator.clipboard.writeText(coordText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const presetLocations: PresetLocation[] = [
        { name: "Damascus, Syria", coords: [36.2765, 33.5138] },
        { name: "New York, USA", coords: [-74.0060, 40.7128] },
        { name: "London, UK", coords: [-0.1276, 51.5074] },
        { name: "Tokyo, Japan", coords: [139.6917, 35.6895] },
        { name: "Sydney, Australia", coords: [151.2093, -33.8688] }
    ];

    const setPresetLocation = (coords: [number, number]): void => {
        setCoordinates({
            lng: coords[0],
            lat: coords[1]
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        MapPicker Component Demo
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Interactive map component for location selection
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Map Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-semibold text-gray-800">
                                    Interactive Map
                                </h2>
                            </div>

                            {/* Map Component */}
                            <MapPicker
                                latitude={coordinates.lat}
                                longitude={coordinates.lng}
                                onChange={handleLocationChange}
                            />

                            {/* Coordinates Display */}
                            <div className="bg-gray-50 rounded-lg p-4 mt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-medium text-gray-800">
                                        Selected Coordinates
                                    </h3>
                                    <button
                                        onClick={copyCoordinates}
                                        className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                                    >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Longitude
                                        </label>
                                        <input
                                            type="text"
                                            value={coordinates.lng.toFixed(6)}
                                            readOnly
                                            className="w-full p-2 bg-white border border-gray-300 rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Latitude
                                        </label>
                                        <input
                                            type="text"
                                            value={coordinates.lat.toFixed(6)}
                                            readOnly
                                            className="w-full p-2 bg-white border border-gray-300 rounded-md"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Preset Locations */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                Preset Locations
                            </h3>
                            <div className="space-y-2">
                                {presetLocations.map((location, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setPresetLocation(location.coords)}
                                        className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 text-indigo-500 mr-2" />
                                            <span className="font-medium">{location.name}</span>
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            {location.coords[0].toFixed(4)}, {location.coords[1].toFixed(4)}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Features */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                Features
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3"></div>
                                    <div>
                                        <p className="font-medium text-gray-700">Interactive Selection</p>
                                        <p className="text-sm text-gray-600">Click anywhere on the map to select coordinates</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3"></div>
                                    <div>
                                        <p className="font-medium text-gray-700">Draggable Markers</p>
                                        <p className="text-sm text-gray-600">Drag markers to fine-tune location</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3"></div>
                                    <div>
                                        <p className="font-medium text-gray-700">Default to Aleppo</p>
                                        <p className="text-sm text-gray-600">Starts at Aleppo Citadel coordinates</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3"></div>
                                    <div>
                                        <p className="font-medium text-gray-700">Simple & Clean</p>
                                        <p className="text-sm text-gray-600">Minimalist design with Arabic text support</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Usage Info */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                Usage
                            </h3>
                            <div className="bg-gray-100 rounded-lg p-3">
                                <code className="text-sm text-gray-800">
                                    {`<MapPicker
  latitude={latitude}
  longitude={longitude}
  onChange={handleChange}
/>`}
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}