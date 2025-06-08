"use client";

import { MapRouteModal } from "@/components/common/MapRouteModal";
import AddReviewForm from "@/components/AddReviewForm";
import { usePlaces } from "@/hooks/useCustomQuery";
import type { TourismPlace, Event as TourismEvent, PlaceCategory } from "@/types/type";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
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
  Clock,
  CalendarClock,
  Tag,
  MessageCircle,
  Star,
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

// حساب المسافة بين نقطتين على الخريطة
function getDistance(from: Coordinates, to: Coordinates): number {
  const R = 6371; // نصف قطر الأرض بالكيلومتر
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

// تحويل الدرجات إلى راديان
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

  // Use QueryClient to invalidate queries when needed
  const queryClient = useQueryClient();

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
    category: "all",
    minRating: 0,
    hasEvents: false,
    openNow: false,
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

  // Get current time in hours and minutes (24-hour format)
  const getCurrentTime = () => {
    const now = new Date();
    return {
      hours: now.getHours(),
      minutes: now.getMinutes(),
    };
  };

  // Check if a place is currently open based on visitTimeRange
  const isPlaceOpen = (visitTimeRange: string | undefined) => {
    if (!visitTimeRange) return true; // If no time range is specified, consider it always open

    const currentTime = getCurrentTime();
    const currentMinutes = currentTime.hours * 60 + currentTime.minutes;

    // Expected format: "9:00 AM - 5:00 PM" or similar
    try {
      const [openTime, closeTime] = visitTimeRange.split('-').map(t => t.trim());

      // Simple parsing for common time formats
      const parseTimeToMinutes = (timeStr: string) => {
        const isPM = timeStr.toLowerCase().includes('pm');
        const isAM = timeStr.toLowerCase().includes('am');

        // Extract hours and minutes
        const timeParts = timeStr.replace(/\s*(am|pm)\s*/i, '').split(':');
        let hours = parseInt(timeParts[0]);
        const minutes = timeParts.length > 1 ? parseInt(timeParts[1]) : 0;

        // Adjust hours for PM
        if (isPM && hours < 12) hours += 12;
        if (isAM && hours === 12) hours = 0;

        return hours * 60 + minutes;
      };

      const openMinutes = parseTimeToMinutes(openTime);
      const closeMinutes = parseTimeToMinutes(closeTime);

      // Handle cases where closing time is on the next day
      if (closeMinutes < openMinutes) {
        return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
      }

      return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
    } catch (error) {
      console.error("Error parsing visit time range:", error);
      return true; // If parsing fails, consider it open
    }
  };

  useEffect(() => {
    // استخدام خيارات متقدمة للحصول على الموقع الجغرافي بدقة عالية وبدون استخدام الكاش
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true, // للحصول على أدق موقع ممكن
        timeout: 10000, // 10 ثواني كحد أقصى للحصول على الموقع
        maximumAge: 0 // عدم استخدام الكاش نهائياً، والحصول على موقع جديد كل مرة
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("تم الحصول على الموقع الحقيقي:", position.coords.latitude, position.coords.longitude);
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("خطأ في الحصول على الموقع:", error);
          // يمكنك تعيين موقع افتراضي لمدينة حلب إذا فشل الحصول على الموقع
          setUserLocation({
            lat: 36.1999, // إحداثيات مدينة حلب
            lng: 37.1500,
          });
        },
        options
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
      .filter((place) => {
        if (filters.category === "all") return true;
        return place.category === filters.category;
      })
      .filter((place) => {
        // Filter by minimum rating
        if (filters.minRating <= 0) return true;

        // Calculate average rating
        if (!place.reviews || place.reviews.length === 0) return false;

        const totalRating = place.reviews.reduce((sum, review) => sum + review.rating, 0);
        const avgRating = totalRating / place.reviews.length;

        return avgRating >= filters.minRating;
      })
      .filter((place) => {
        // Filter by open now status
        if (!filters.openNow) return true;
        return isPlaceOpen(place.visitTimeRange);
      })
      .filter((place) => {
        // Filter by has events
        if (!filters.hasEvents) return true;
        return place.events && place.events.length > 0;
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
    } else if (criteria === "rating") {
      filtered.sort((a, b) => {
        const avgRatingA = a.reviews && a.reviews.length > 0
          ? a.reviews.reduce((sum, review) => sum + review.rating, 0) / a.reviews.length
          : 0;
        const avgRatingB = b.reviews && b.reviews.length > 0
          ? b.reviews.reduce((sum, review) => sum + review.rating, 0) / b.reviews.length
          : 0;

        return order === "desc" ? avgRatingB - avgRatingA : avgRatingA - avgRatingB;
      });
    }

    return filtered;
  }, [places, searchTerm, filters, userLocation]);

  const totalPages = Math.ceil(filteredPlaces.length / itemsPerPage);
  const currentPlaces = filteredPlaces.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Peak time translations
  const peakTimeTranslations: Record<string, string> = {
    "Morning": "الصباح",
    "Afternoon": "بعد الظهر",
    "Evening": "المساء",
    "Night": "الليل",
    "Weekends": "عطلة نهاية الأسبوع",
    "Holidays": "العطل",
    "Summer": "الصيف",
    "Winter": "الشتاء",
    "Spring": "الربيع",
    "Fall": "الخريف",
    "All day": "طوال اليوم",
    "Noon": "الظهيرة"
  };

  // Translate peak time
  const translatePeakTime = (peakTime: string | undefined): string => {
    if (!peakTime) return "غير محدد";

    // Check if it's a direct translation
    if (peakTimeTranslations[peakTime]) {
      return peakTimeTranslations[peakTime];
    }

    // Check if it contains any of the translatable terms
    for (const [english, arabic] of Object.entries(peakTimeTranslations)) {
      if (peakTime.includes(english)) {
        return peakTime.replace(english, arabic);
      }
    }

    // Return original if no translation found
    return peakTime;
  };

  const [activeTab, setActiveTab] = useState("places"); // "places" or "events"

  // Define type for enhanced event object
  type EnhancedTourismEvent = TourismEvent & {
    place?: {
      id: number;
      name: string;
      category: PlaceCategory;
      latitude: number;
      longitude: number;
      coverImage: string;
    };
  };

  // Extract all events from places
  const allEvents = useMemo<EnhancedTourismEvent[]>(() => {
    if (!places || places.length === 0) return [];

    const eventsList: EnhancedTourismEvent[] = [];

    places.forEach(place => {
      if (place.events && place.events.length > 0) {
        // Add place information to each event
        const placeEvents = place.events.map(event => ({
          ...event,
          place: {
            id: place.id,
            name: place.name,
            category: place.category,
            latitude: place.latitude,
            longitude: place.longitude,
            coverImage: place.coverImage
          }
        } as EnhancedTourismEvent));

        eventsList.push(...placeEvents);
      }
    });

    return eventsList;
  }, [places]);

  // Event-specific filters
  const [eventFilters, setEventFilters] = useState({
    sortBy: "date_asc", // date_asc, date_desc
    category: "all",
    dateRange: "all" // all, upcoming, thisWeek, thisMonth
  });

  // Filter events
  const filteredEvents = useMemo<EnhancedTourismEvent[]>(() => {
    if (!allEvents || allEvents.length === 0) return [];

    return allEvents
      .filter((event) =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.place?.name && event.place.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .filter((event) => {
        if (eventFilters.category === "all") return true;
        return event.place?.category === eventFilters.category;
      })
      .filter((event) => {
        const now = new Date();
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);

        switch (eventFilters.dateRange) {
          case "upcoming":
            return startDate >= now || (startDate <= now && endDate >= now);
          case "thisWeek": {
            const nextWeek = new Date(now);
            nextWeek.setDate(now.getDate() + 7);
            return startDate <= nextWeek && endDate >= now;
          }
          case "thisMonth": {
            const nextMonth = new Date(now);
            nextMonth.setMonth(now.getMonth() + 1);
            return startDate <= nextMonth && endDate >= now;
          }
          default:
            return true;
        }
      })
      .sort((a, b) => {
        const [criteria, order] = eventFilters.sortBy.split("_");

        if (criteria === "date") {
          const dateA = new Date(a.startDate);
          const dateB = new Date(b.startDate);
          return order === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        }

        return 0;
      });
  }, [allEvents, searchTerm, eventFilters]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#f8f4ed] pattern-moroccan"
      dir="rtl"
    >
      {/* خلفية زخرفية */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-7xl mx-auto p-8 relative">
        {/* الترويسة */}
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

        {/* البحث والفلاتر مع الـ tabs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl mb-8 border border-amber-100"
        >
          {/* Tabs and Filter button */}
          <div className="flex items-center justify-between mb-6">
            <div className="bg-amber-50/80 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-amber-100 inline-flex">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab("places")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${activeTab === "places"
                  ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md"
                  : "text-amber-700 hover:bg-amber-100/50"
                  }`}
              >
                <MapPin className="h-4 w-4 inline-block ml-1" />
                الأماكن السياحية
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab("events")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${activeTab === "events"
                  ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md"
                  : "text-amber-700 hover:bg-amber-100/50"
                  }`}
              >
                <Calendar className="h-4 w-4 inline-block ml-1" />
                الفعاليات
              </motion.button>
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

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-600" />
            <input
              type="text"
              placeholder={activeTab === "places" ? "ابحث عن المعالم التاريخية..." : "ابحث عن الفعاليات..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-amber-100 focus:border-amber-400 focus:ring focus:ring-amber-200 transition-all duration-200 bg-white/50"
            />
          </div>

          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-6 pt-6 border-t border-amber-100"
              >
                <div className="flex items-center mb-4">
                  <h3 className="text-lg font-bold text-amber-900">
                    {activeTab === "places" ? "تصفية الأماكن" : "تصفية الفعاليات"}
                  </h3>
                </div>

                {activeTab === "places" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-amber-800">
                        ترتيب حسب
                      </label>
                      <select
                        value={filters.sortBy}
                        onChange={(e) =>
                          setFilters({ ...filters, sortBy: e.target.value })
                        }
                        className="rounded-xl border-2 border-amber-100 px-4 py-2 focus:border-amber-400 focus:ring focus:ring-amber-200 transition-all duration-200 bg-white/50 w-full"
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
                        <optgroup label="حسب التقييم">
                          <option value="rating_desc">الأعلى تقييماً</option>
                          <option value="rating_asc">الأقل تقييماً</option>
                        </optgroup>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-amber-800">
                        التصنيف
                      </label>
                      <select
                        value={filters.category}
                        onChange={(e) =>
                          setFilters({ ...filters, category: e.target.value })
                        }
                        className="w-full rounded-xl border-2 border-amber-100 px-4 py-2 focus:border-amber-400 focus:ring focus:ring-amber-200 transition-all duration-200 bg-white/50"
                      >
                        <option value="all">كل التصنيفات</option>
                        <option value="ARCHAEOLOGICAL">أثري</option>
                        <option value="RESTAURANT">مطعم</option>
                        <option value="ENTERTAINMENT">ترفيهي</option>
                        <option value="RELIGIOUS">ديني</option>
                        <option value="EDUCATIONAL">تعليمي</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-amber-800">
                        الحد الأدنى للتقييم
                      </label>
                      <select
                        value={filters.minRating}
                        onChange={(e) =>
                          setFilters({ ...filters, minRating: parseInt(e.target.value) })
                        }
                        className="w-full rounded-xl border-2 border-amber-100 px-4 py-2 focus:border-amber-400 focus:ring focus:ring-amber-200 transition-all duration-200 bg-white/50"
                      >
                        <option value="0">كل التقييمات</option>
                        <option value="1">نجمة واحدة أو أكثر</option>
                        <option value="2">نجمتان أو أكثر</option>
                        <option value="3">3 نجوم أو أكثر</option>
                        <option value="4">4 نجوم أو أكثر</option>
                        <option value="5">5 نجوم</option>
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

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          id="openNow"
                          type="checkbox"
                          checked={filters.openNow}
                          onChange={(e) =>
                            setFilters({ ...filters, openNow: e.target.checked })
                          }
                          className="w-5 h-5 accent-amber-600 rounded border-amber-300"
                        />
                        <label htmlFor="openNow" className="mr-2 text-sm font-medium text-amber-800">
                          مفتوح الآن
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          id="hasEvents"
                          type="checkbox"
                          checked={filters.hasEvents}
                          onChange={(e) =>
                            setFilters({ ...filters, hasEvents: e.target.checked })
                          }
                          className="w-5 h-5 accent-amber-600 rounded border-amber-300"
                        />
                        <label htmlFor="hasEvents" className="mr-2 text-sm font-medium text-amber-800">
                          تحتوي على فعاليات
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-start gap-3 mt-6 col-span-full">
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
                            sortBy: "distance_desc",
                            photosMin: 0,
                            dateRange: "all",
                            category: "all",
                            minRating: 0,
                            hasEvents: false,
                            openNow: false,
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
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-amber-800">
                        ترتيب حسب
                      </label>
                      <select
                        value={eventFilters.sortBy}
                        onChange={(e) =>
                          setEventFilters({ ...eventFilters, sortBy: e.target.value })
                        }
                        className="rounded-xl border-2 border-amber-100 px-4 py-2 focus:border-amber-400 focus:ring focus:ring-amber-200 transition-all duration-200 bg-white/50 w-full"
                      >
                        <option value="date_asc">الأقرب أولاً</option>
                        <option value="date_desc">الأبعد أولاً</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-amber-800">
                        التصنيف
                      </label>
                      <select
                        value={eventFilters.category}
                        onChange={(e) =>
                          setEventFilters({ ...eventFilters, category: e.target.value })
                        }
                        className="w-full rounded-xl border-2 border-amber-100 px-4 py-2 focus:border-amber-400 focus:ring focus:ring-amber-200 transition-all duration-200 bg-white/50"
                      >
                        <option value="all">كل التصنيفات</option>
                        <option value="ARCHAEOLOGICAL">أثري</option>
                        <option value="RESTAURANT">مطعم</option>
                        <option value="ENTERTAINMENT">ترفيهي</option>
                        <option value="RELIGIOUS">ديني</option>
                        <option value="EDUCATIONAL">تعليمي</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-amber-800">
                        النطاق الزمني
                      </label>
                      <select
                        value={eventFilters.dateRange}
                        onChange={(e) =>
                          setEventFilters({ ...eventFilters, dateRange: e.target.value })
                        }
                        className="w-full rounded-xl border-2 border-amber-100 px-4 py-2 focus:border-amber-400 focus:ring focus:ring-amber-200 transition-all duration-200 bg-white/50"
                      >
                        <option value="all">كل الأوقات</option>
                        <option value="upcoming">الفعاليات الجارية والقادمة</option>
                        <option value="thisWeek">هذا الأسبوع</option>
                        <option value="thisMonth">هذا الشهر</option>
                      </select>
                    </div>

                    <div className="flex justify-start gap-3 mt-6 col-span-full">
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
                          setEventFilters({
                            sortBy: "date_asc",
                            category: "all",
                            dateRange: "all"
                          });
                        }}
                        className="px-6 py-2.5 text-amber-700 hover:text-amber-800 transition-colors"
                      >
                        إعادة تعيين
                      </motion.button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* شبكة الأماكن أو الفعاليات */}
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
          ) : activeTab === "places" ? (
            // Places grid
            <motion.div
              key={`places-${searchTerm}-${filters.sortBy}-${filters.dateRange}`}
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
                    <div className="absolute top-3 left-3 bg-white/80 text-amber-800 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {place.category === "ARCHAEOLOGICAL" && "أثري"}
                      {place.category === "RESTAURANT" && "مطعم"}
                      {place.category === "ENTERTAINMENT" && "ترفيهي"}
                      {place.category === "RELIGIOUS" && "ديني"}
                      {place.category === "EDUCATIONAL" && "تعليمي"}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-amber-900 mb-3 font-noto-kufi">
                      {place.name}
                    </h3>
                    <p className="text-amber-800/80 mb-4 line-clamp-2">
                      {place.description}
                    </p>

                    {/* Status badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {/* Rating badge */}
                      {place.reviews && place.reviews.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-100 text-amber-800 text-xs font-medium">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          {(place.reviews.reduce((sum, review) => sum + review.rating, 0) / place.reviews.length).toFixed(1)}
                        </span>
                      )}

                      {/* Open now badge */}
                      {place.visitTimeRange && (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${isPlaceOpen(place.visitTimeRange) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-xs font-medium`}>
                          <Clock className="h-3 w-3" />
                          {isPlaceOpen(place.visitTimeRange) ? 'مفتوح الآن' : 'مغلق'}
                        </span>
                      )}

                      {/* Events badge */}
                      {place.events && place.events.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-medium">
                          <Calendar className="h-3 w-3" />
                          {place.events.length} فعالية
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex gap-4 flex-wrap">
                        <span className="flex items-center gap-1 text-amber-700 text-sm">
                          <Camera className="h-4 w-4" />
                          {place.photos.length} صور
                        </span>
                        <span className="flex items-center gap-1 text-amber-700 text-sm">
                          <Clock className="h-4 w-4" />
                          {translatePeakTime(place.expectedPeakTime)}
                        </span>
                        {place.reviews && (
                          <span className="flex items-center gap-1 text-amber-700 text-sm">
                            <Star className="h-4 w-4" />
                            {place.reviews.length} تقييم
                          </span>
                        )}
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
          ) : (
            // Events grid
            <motion.div
              key={`events-${searchTerm}-${eventFilters.sortBy}-${eventFilters.dateRange}`}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredEvents.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-100 col-span-full"
                >
                  <Calendar className="h-12 w-12 mx-auto text-amber-400 mb-4" />
                  <h3 className="text-xl font-semibold text-amber-900 mb-2">
                    لم يتم العثور على فعاليات
                  </h3>
                  <p className="text-amber-700">حاول تعديل معايير البحث أو التصفية</p>
                </motion.div>
              ) : (
                filteredEvents.map((event) => (
                  <motion.article
                    key={event.id}
                    variants={itemVariants}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border border-amber-100 transform transition-all duration-300"
                  >
                    <div className="relative h-48">
                      <motion.img
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.4 }}
                        src={event.image || event.place?.coverImage}
                        alt={event.name}
                        className="w-full h-full object-cover"
                      />
                      {event.place && (
                        <div className="absolute top-3 left-3 bg-white/80 text-amber-800 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {event.place.category === "ARCHAEOLOGICAL" && "أثري"}
                          {event.place.category === "RESTAURANT" && "مطعم"}
                          {event.place.category === "ENTERTAINMENT" && "ترفيهي"}
                          {event.place.category === "RELIGIOUS" && "ديني"}
                          {event.place.category === "EDUCATIONAL" && "تعليمي"}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-amber-900 mb-2 font-noto-kufi">
                        {event.name}
                      </h3>

                      {event.place && (
                        <p className="text-amber-700 mb-3 text-sm flex items-center">
                          <MapPin className="h-4 w-4 ml-1" />
                          {event.place.name}
                        </p>
                      )}

                      <p className="text-amber-800/80 mb-4 line-clamp-2">
                        {event.description}
                      </p>

                      {/* Date range badge */}
                      <div className="flex items-center text-sm text-amber-700 mb-4">
                        <Calendar className="h-4 w-4 ml-2" />
                        <span>
                          {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Event status badge */}
                      {(() => {
                        const now = new Date();
                        const startDate = new Date(event.startDate);
                        const endDate = new Date(event.endDate);

                        let status;
                        let color;

                        if (startDate > now) {
                          status = "قادم";
                          color = "bg-blue-100 text-blue-800";
                        } else if (startDate <= now && endDate >= now) {
                          status = "جاري الآن";
                          color = "bg-green-100 text-green-800";
                        } else {
                          status = "انتهى";
                          color = "bg-amber-100 text-amber-800";
                        }

                        return (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${color} text-xs font-medium`}>
                            {status}
                          </span>
                        );
                      })()}

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          // Find and select the place that contains this event
                          const placeWithEvent = places.find(p =>
                            p.events && p.events.some(e => e.id === event.id)
                          );

                          if (placeWithEvent) {
                            setSelectedPlace(placeWithEvent);
                          }
                        }}
                        className="flex items-center gap-1 text-amber-900 text-sm font-semibold hover:text-amber-700 mt-2"
                      >
                        <BookOpen className="h-4 w-4" />
                        عرض المكان والتفاصيل
                      </motion.button>
                    </div>
                  </motion.article>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Results for Places */}
        {!isLoading && activeTab === "places" && filteredPlaces.length === 0 && (
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

                    <div className="mb-2 flex items-center">
                      <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        {selectedPlace.category === "ARCHAEOLOGICAL" && "أثري"}
                        {selectedPlace.category === "RESTAURANT" && "مطعم"}
                        {selectedPlace.category === "ENTERTAINMENT" && "ترفيهي"}
                        {selectedPlace.category === "RELIGIOUS" && "ديني"}
                        {selectedPlace.category === "EDUCATIONAL" && "تعليمي"}
                      </span>
                    </div>

                    <p className="text-amber-800 mb-6 text-lg leading-relaxed">
                      {selectedPlace.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-amber-50/50 p-3 rounded-lg flex items-center gap-2">
                        <Clock className="h-5 w-5 text-amber-600" />
                        <div>
                          <div className="text-sm font-medium text-amber-900">أوقات الزيارة</div>
                          <div className="text-amber-700">{selectedPlace.visitTimeRange || "غير محدد"}</div>
                        </div>
                      </div>

                      <div className="bg-amber-50/50 p-3 rounded-lg flex items-center gap-2">
                        <CalendarClock className="h-5 w-5 text-amber-600" />
                        <div>
                          <div className="text-sm font-medium text-amber-900">أوقات الذروة</div>
                          <div className="text-amber-700">{translatePeakTime(selectedPlace.expectedPeakTime)}</div>
                        </div>
                      </div>
                    </div>

                    {selectedPlace.events && selectedPlace.events.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold mb-3 text-amber-900 flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          الفعاليات القادمة
                        </h4>
                        <div className="space-y-3">
                          {selectedPlace.events.map((event) => (
                            <div key={event.id} className="bg-amber-50/50 p-4 rounded-lg">
                              <h5 className="font-medium text-amber-900">{event.name}</h5>
                              <p className="text-sm text-amber-700 mb-2">{event.description}</p>
                              <div className="flex items-center text-xs text-amber-600">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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

                      <div className="mb-6 border-t border-amber-100 pt-6">
                        <h4 className="text-lg font-semibold mb-3 text-amber-900 flex items-center gap-2">
                          <MessageCircle className="h-5 w-5" />
                          التقييمات والمراجعات
                        </h4>

                        {selectedPlace.reviews && selectedPlace.reviews.length > 0 ? (
                          <div className="space-y-4 mb-6">
                            {selectedPlace.reviews.map((review) => (
                              <div key={review.id} className="bg-white/80 p-4 rounded-lg shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                  <div className="font-medium text-amber-900">{review.user.name}</div>
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm text-amber-700">{review.content}</p>
                                <div className="text-xs text-amber-500 mt-2">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-amber-50/50 p-4 rounded-lg text-center mb-6">
                            <p className="text-amber-700">لا توجد تقييمات لهذا المكان حتى الآن. كن أول من يضيف تقييم!</p>
                          </div>
                        )}

                        {/* Add Review Form */}
                        {selectedPlace && (
                          <AddReviewForm
                            tourismPlaceId={selectedPlace.id}
                            onSuccess={() => {
                              // Force refetch the selected place to get updated reviews
                              const id = selectedPlace.id;
                              setTimeout(() => {
                                // Use setTimeout to ensure the backend has processed the review
                                queryClient.invalidateQueries({ queryKey: ['tourism-place', id] });
                                queryClient.invalidateQueries({ queryKey: ['tourism-places'] });
                                queryClient.invalidateQueries({ queryKey: ['reviews', id] });
                              }, 500);
                            }}
                          />
                        )}
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
                  className={`w-12 h-12 rounded-xl font-medium transition-all duration-200 ${currentPage === i + 1
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
