"use client";

import { useState } from "react";
import { usePlaces } from "@/hooks/useCustomQuery";
import {
  Loader2,
  Plus,
  Calendar,
  MapPin,
  User,
  Star,
  Search,
  Trash2,
  Map,
  Pencil,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlaceCategory, TourismPlace } from "@/types/type";
import { toast } from "react-hot-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { PlaceModal } from "@/components/common/MapModal";
import Cookies from "js-cookie";
import { tourismApi } from "@/utils/axios";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/hooks/useCustomQuery";
import { API_URL } from "@/utils/axios";

function getImageUrl(path: string) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_URL}${path}`;
}

export default function AdminPage() {
  // Set up state
  const [searchTerm, setSearchTerm] = useState("");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [placeToDelete, setPlaceToDelete] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [selectedPlace, setSelectedPlace] = useState<TourismPlace | null>(null);

  // Get places data
  const { data: places = [], isLoading } = usePlaces();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Filter places based on search term and active tab
  const filteredPlaces = places.filter((place) => {
    // Search filter
    const matchesSearch = place.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Category filter
    if (activeTab === "all") return matchesSearch;

    return matchesSearch && place.category === activeTab;
  });

  // Placeholder for delete functionality
  const confirmDelete = async () => {
    if (placeToDelete === null) return;

    try {
      await tourismApi.delete(placeToDelete);
      toast.success("تم حذف المكان بنجاح");
      setIsConfirmDialogOpen(false);
      setPlaceToDelete(null);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_PLACES });
    } catch (error) {
      console.error("Error deleting place:", error);
      toast.error("حدث خطأ أثناء حذف المكان");
    }
  };

  // Calculate counts
  const placesCount = places.length;
  const eventsCount = places.reduce(
    (total, place) => total + (place.events?.length || 0),
    0
  );
  const reviewsCount = places.reduce(
    (total, place) => total + (place.reviews?.length || 0),
    0
  );
  const photosCount = places.reduce(
    (total, place) => total + (place.photos?.length || 0),
    0
  );

  // Get Arabic name for category
  const getCategoryName = (category: string) => {
    const categories: Record<string, string> = {
      ARCHAEOLOGICAL: "أثري",
      RESTAURANT: "مطعم",
      ENTERTAINMENT: "ترفيهي",
      RELIGIOUS: "ديني",
      EDUCATIONAL: "تعليمي",
    };
    return categories[category] || category;
  };

  // Handle edit place click
  const handleEditClick = (place: TourismPlace) => {
    setSelectedPlace(place);
    setModalType("edit");
    setIsModalOpen(true);
  };

  // Handle place form submit
  const handlePlaceSubmit = async (formData: FormData) => {
    try {
      // Get admin ID from JWT token
      const accessToken = Cookies.get("access_token");
      let adminId: number | null = null;
      if (accessToken) {
        try {
          const tokenData = JSON.parse(atob(accessToken.split('.')[1]));
          if (tokenData.role === 'ADMIN') {
            adminId = tokenData.id;
          }
        } catch (e) {
          adminId = null;
        }
      }
      if (adminId) {
        formData.append('adminId', adminId.toString());
      }

      if (modalType === "add") {
        await tourismApi.create(formData);
        toast.success("تم إضافة المكان بنجاح");
      } else if (selectedPlace) {
        const updatedData = new FormData();
        for (const [key, value] of formData.entries()) {
          if (key !== "photos" && key !== "events" && key !== "reviews") {
            updatedData.append(key, value);
          }
        }
        await tourismApi.update(selectedPlace.id, updatedData);
        toast.success("تم تحديث المكان بنجاح");
      }

      setIsModalOpen(false);
      setSelectedPlace(null);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_PLACES });
    } catch (error) {
      console.error("Error submitting place:", error);
      toast.error("حدث خطأ أثناء حفظ المكان");
    }
  };

  return (
    <AdminLayout title="لوحة التحكم">
      <div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Map className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="mr-4">
                <div className="text-sm text-gray-500">أماكن سياحية</div>
                <div className="text-2xl font-bold">{placesCount}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <div className="text-sm text-gray-500">فعاليات</div>
                <div className="text-2xl font-bold">{eventsCount}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="mr-4">
                <div className="text-sm text-gray-500">تقييمات</div>
                <div className="text-2xl font-bold">{reviewsCount}</div>
              </div>
            </div>
          </div>
        </div>



        {/* Places Management */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold">إدارة الأماكن السياحية</h2>
              <button
                onClick={() => {
                  setSelectedPlace(null);
                  setModalType("add");
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                إضافة مكان جديد
              </button>
            </div>
          </div>

          {/* Search and filters */}
          <div className="p-6 border-b">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في الأماكن..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 rounded-lg border focus:border-purple-400 focus:ring focus:ring-purple-200 transition-all duration-200"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${activeTab === "all"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-50 hover:bg-gray-100"
                    }`}
                >
                  الكل
                </button>
                {Object.values(PlaceCategory).map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveTab(category)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${activeTab === category
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-50 hover:bg-gray-100"
                      }`}
                  >
                    {getCategoryName(category)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Places listing */}
          {isLoading ? (
            <div className="p-16 flex justify-center">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-2" />
                <span className="text-gray-500">
                  جاري تحميل البيانات...
                </span>
              </div>
            </div>
          ) : filteredPlaces.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                لم يتم العثور على أماكن
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                لم يتم العثور على أماكن تطابق معايير البحث الخاصة بك. جرب
                معايير مختلفة أو قم بإضافة مكان جديد.
              </p>
              <button
                onClick={() => {
                  setSelectedPlace(null);
                  setModalType("add");
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Plus className="h-5 w-5" />
                إضافة مكان جديد
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-right">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-6 py-4 font-medium">الاسم</th>
                    <th className="px-6 py-4 font-medium">الفئة</th>
                    <th className="px-6 py-4 font-medium">عدد الفعاليات</th>
                    <th className="px-6 py-4 font-medium">عدد التقييمات</th>
                    <th className="px-6 py-4 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredPlaces.map((place) => (
                    <tr key={place.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={getImageUrl(place.coverImage)}
                              alt={place.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium">{place.name}</div>
                            <div className="text-xs text-gray-500">
                              ID: {place.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getCategoryName(place.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {place.events ? place.events.length : 0}
                      </td>
                      <td className="px-6 py-4">
                        {place.reviews ? place.reviews.length : 0}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(place)}
                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setPlaceToDelete(place.id);
                              setIsConfirmDialogOpen(true);
                            }}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {isConfirmDialogOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full" dir="rtl">
            <h3 className="text-xl font-bold mb-4">تأكيد الحذف</h3>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من رغبتك في حذف هذا المكان؟ سيتم حذف جميع البيانات
              المرتبطة به مثل الصور والتقييمات والفعاليات. لا يمكن التراجع عن
              هذا الإجراء.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsConfirmDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                نعم، حذف المكان
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Place Modal */}
      <PlaceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          if (modalType === "add") {
            setSelectedPlace(null);
          }
        }}
        type={modalType}
        initialData={selectedPlace || undefined}
        onSubmit={handlePlaceSubmit}
        isLoading={false}
      />
    </AdminLayout>
  );
} 