"use client";

import { MapRouteModal } from "@/components/common/MapRouteModal";
import { usePlaces } from "@/hooks/useCustomQuery";
import type { TourismPlace } from "@/types/type";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  Camera,
  ChevronLeft,
  ChevronRight,
  Filter,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface Coordinates {
  lat: number;
  lng: number;
}

function getDistance(from: Coordinates, to: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(to.lat - from.lat);
  const dLon = deg2rad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(from.lat)) *
      Math.cos(deg2rad(to.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPlace, setSelectedPlace] = useState<TourismPlace | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

  const filterOptions = {
    distance: {
      desc: "الأقرب أولاً",
      asc: "الأبعد أولاً",
    },
    age: {
      desc: "الأقدم تاريخياً",
      asc: "الأحدث تاريخياً",
    },
  };

  const [filters, setFilters] = useState({
    sortBy: "distance_desc",
    photosMin: 0,
    dateRange: "all",
    coordinates: {
      lat: { min: -90, max: 90 },
      lng: { min: -180, max: 180 },
    },
  });

  const { data: places = [], isLoading } = usePlaces();
  const itemsPerPage = 6;

  const dateRangeOptions = {
    all: "كل الأوقات",
    week: "الأسبوع الماضي",
    month: "الشهر الماضي",
    year: "السنة الماضية",
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const filteredPlaces = useMemo(() => {
    const filtered = places
      .filter(
        (place) =>
          place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          place.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((place) => place.photos.length >= filters.photosMin)
      .filter((place) => {
        const date = new Date(place.createdAt);
        const now = new Date();
        switch (filters.dateRange) {
          case "week":
            return date >= new Date(now.setDate(now.getDate() - 7));
          case "month":
            return date >= new Date(now.setMonth(now.getMonth() - 1));
          case "year":
            return date >= new Date(now.setFullYear(now.getFullYear() - 1));
          default:
            return true;
        }
      })
      .filter(
        (place) =>
          place.latitude >= filters.coordinates.lat.min &&
          place.latitude <= filters.coordinates.lat.max &&
          place.longitude >= filters.coordinates.lng.min &&
          place.longitude <= filters.coordinates.lng.max
      );

    const [criteria, order] = filters.sortBy.split("_");

    if (criteria === "distance" && userLocation) {
      filtered.sort((a, b) => {
        const distA = getDistance(userLocation, {
          lat: a.latitude,
          lng: a.longitude,
        });
        const distB = getDistance(userLocation, {
          lat: b.latitude,
          lng: b.longitude,
        });
        return order === "desc" ? distA - distB : distB - distA;
      });
    }

    return filtered;
  }, [places, searchTerm, filters, userLocation]);

  const totalPages = Math.ceil(filteredPlaces.length / itemsPerPage);
  const currentPlaces = filteredPlaces.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#f8f4ed] pattern-moroccan"
      dir="rtl"
    >
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-7xl mx-auto p-8 relative">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.h1
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-5xl font-bold font-noto-kufi text-amber-900 mb-4"
          >
            معالم حلب التاريخية
          </motion.h1>
          <p className="text-lg text-amber-800/80 max-w-2xl mx-auto">
            اكتشف روعة وجمال المعالم التاريخية في مدينة حلب، واحدة من أقدم المدن
            المأهولة في العالم
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl mb-8 border border-amber-100"
        >
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-600" />
                <input
                  type="text"
                  placeholder="ابحث عن المعالم التاريخية..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-amber-100 focus:border-amber-400 focus:ring focus:ring-amber-200 transition-all duration-200 bg-white/50"
                />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold"
            >
              <Filter className="h-5 w-5 inline-block ml-2" />
              خيارات التصفية
            </motion.button>
          </div>

          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-6 pt-6 border-t border-amber-100"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-amber-800">
                      ترتيب حسب
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) =>
                        setFilters({ ...filters, sortBy: e.target.value })
                      }
                      className="rounded-xl border-2 border-amber-100 px-4 py-2 focus:border-amber-400 focus:ring focus:ring-amber-200 transition-all duration-200 bg-white/50"
                    >
                      {Object.entries(filterOptions).map(([key, options]) => (
                        <optgroup
                          key={key}
                          label={
                            key === "distance" ? "حسب المسافة" : "حسب العمر"
                          }
                        >
                          {Object.entries(options).map(([order, label]) => (
                            <option
                              key={`${key}_${order}`}
                              value={`${key}_${order}`}
                            >
                              {label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-amber-800">
                      الحد الأدنى للصور ({filters.photosMin})
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={filters.photosMin}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          photosMin: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-amber-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-amber-800">
                      النطاق الزمني
                    </label>
                    <select
                      value={filters.dateRange}
                      onChange={(e) =>
                        setFilters({ ...filters, dateRange: e.target.value })
                      }
                      className="w-full rounded-xl border-2 border-amber-100 px-4 py-2 focus:border-amber-400 focus:ring focus:ring-amber-200 transition-all duration-200 bg-white/50"
                    >
                      {Object.entries(dateRangeOptions).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-amber-800">
                      نطاق الموقع
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="خط العرض الأدنى"
                        value={filters.coordinates.lat.min}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            coordinates: {
                              ...filters.coordinates,
                              lat: {
                                ...filters.coordinates.lat,
                                min: parseFloat(e.target.value),
                              },
                            },
                          })
                        }
                        className="w-full rounded-lg border-2 border-amber-100 py-2 px-3 focus:border-amber-400 focus:ring focus:ring-amber-200 transition-all duration-200 bg-white/50"
                      />
                      <input
                        type="number"
                        placeholder="خط العرض الأقصى"
                        value={filters.coordinates.lat.max}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            coordinates: {
                              ...filters.coordinates,
                              lat: {
                                ...filters.coordinates.lat,
                                max: parseFloat(e.target.value),
                              },
                            },
                          })
                        }
                        className="w-full rounded-lg border-2 border-amber-100 py-2 px-3 focus:border-amber-400 focus:ring focus:ring-amber-200 transition-all duration-200 bg-white/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-start gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsFilterOpen(false)}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    تطبيق
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setFilters({
                        sortBy: "newest",
                        photosMin: 0,
                        dateRange: "all",
                        coordinates: {
                          lat: { min: -90, max: 90 },
                          lng: { min: -180, max: 180 },
                        },
                      });
                    }}
                    className="px-6 py-2.5 text-amber-700 hover:text-amber-800 transition-colors"
                  >
                    إعادة تعيين
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Places Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl h-[400px] animate-pulse shadow-xl border border-amber-100"
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={searchTerm + filters.sortBy + filters.dateRange}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {currentPlaces.map((place) => (
                <motion.article
                  key={place.id}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border border-amber-100 transform transition-all duration-300"
                >
                  <div className="relative h-56">
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.4 }}
                      src={place.coverImage}
                      alt={place.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-amber-900 mb-3 font-noto-kufi">
                      {place.name}
                    </h3>
                    <p className="text-amber-800/80 mb-4 line-clamp-2">
                      {place.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4">
                        <span className="flex items-center gap-1 text-amber-700 text-sm">
                          <Camera className="h-4 w-4" />
                          {place.photos.length} صور
                        </span>
                        <span className="flex items-center gap-1 text-amber-700 text-sm">
                          <Calendar className="h-4 w-4" />
                          {new Date(place.createdAt).toLocaleDateString("ar")}
                        </span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedPlace(place)}
                        className="flex items-center gap-1 text-amber-900 text-sm font-semibold hover:text-amber-700"
                      >
                        <BookOpen className="h-4 w-4" />
                        اكتشف المزيد
                      </motion.button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Results */}
        {!isLoading && filteredPlaces.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-100"
          >
            <Search className="h-12 w-12 mx-auto text-amber-400 mb-4" />
            <h3 className="text-xl font-semibold text-amber-900 mb-2">
              لم يتم العثور على نتائج
            </h3>
            <p className="text-amber-700">حاول تعديل معايير البحث أو التصفية</p>
          </motion.div>
        )}

        {/* Place Details Modal */}
        <AnimatePresence>
          {selectedPlace && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setSelectedPlace(null)}
            >
              {!showMap ? (
                <motion.div
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden max-w-3xl w-full shadow-xl border border-amber-100 max-h-[90vh] overflow-y-auto no-scrollbar"
                >
                  <div className="relative aspect-video">
                    <img
                      src={selectedPlace.coverImage}
                      alt={selectedPlace.name}
                      className="w-full h-full object-cover"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedPlace(null)}
                      className="absolute top-4 left-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>

                  <div className="p-6">
                    <h3 className="text-3xl font-bold text-amber-900 mb-4 font-noto-kufi">
                      {selectedPlace.name}
                    </h3>
                    <p className="text-amber-800 mb-6 text-lg leading-relaxed">
                      {selectedPlace.description}
                    </p>

                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        {selectedPlace.photos.map((photo, index) => (
                          <motion.div
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            className="relative aspect-video rounded-lg overflow-hidden shadow-lg"
                          >
                            <img
                              src={photo.url}
                              alt={`${selectedPlace.name} صورة`}
                              className="w-full h-full object-cover"
                            />
                          </motion.div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-amber-100">
                        <div className="flex items-center gap-2 text-amber-700">
                          <MapPin className="w-5 h-5" />
                          <span className="font-noto-kufi">
                            {selectedPlace.latitude.toFixed(4)},{" "}
                            {selectedPlace.longitude.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowMap(true)}
                            className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-semibold"
                          >
                            عرض الطريق إلى الوجهة
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedPlace(null)}
                            className="px-6 py-2.5 text-amber-700 hover:text-amber-800 transition-colors font-semibold"
                          >
                            إغلاق
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <MapRouteModal
                  placeLat={selectedPlace.latitude}
                  placeLng={selectedPlace.longitude}
                  onClose={() => setShowMap(false)}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex justify-center gap-2"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-3 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-amber-100 disabled:opacity-50 hover:border-amber-400 transition-all duration-200"
            >
              <ChevronRight className="h-5 w-5 text-amber-700" />
            </motion.button>

            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-12 h-12 rounded-xl font-medium transition-all duration-200 ${
                    currentPage === i + 1
                      ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg"
                      : "bg-white/80 backdrop-blur-sm border-2 border-amber-100 hover:border-amber-400 text-amber-700"
                  }`}
                >
                  {i + 1}
                </motion.button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-3 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-amber-100 disabled:opacity-50 hover:border-amber-400 transition-all duration-200"
            >
              <ChevronLeft className="h-5 w-5 text-amber-700" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Home;
