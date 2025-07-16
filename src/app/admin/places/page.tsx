"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { useState } from "react";
import { usePlaces } from "@/hooks/useCustomQuery";
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import { PlaceModal } from "@/components/common/MapModal";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import { TourismPlace } from "@/types/type";
import { tourismApi } from "@/utils/axios";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/hooks/useCustomQuery";
import { API_URL } from "@/utils/axios";

function getImageUrl(path: string) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${API_URL}${path}`;
}

export default function PlacesAdminPage() {
    const { data: places = [], isLoading } = usePlaces();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<"add" | "edit">("add");
    const [selectedPlace, setSelectedPlace] = useState<TourismPlace | null>(null);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [placeToDelete, setPlaceToDelete] = useState<number | null>(null);
    const queryClient = useQueryClient();

    // Handle edit place click
    const handleEditClick = (place: TourismPlace) => {
        setSelectedPlace(place);
        setModalType("edit");
        setIsModalOpen(true);
    };

    // Handle delete click
    const handleDeleteClick = (id: number) => {
        setPlaceToDelete(id);
        setIsConfirmDialogOpen(true);
    };

    // Confirm delete
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

    const handleSubmit = async (formData: FormData) => {
        try {
            // Get admin ID from JWT token
            const adminToken = Cookies.get("admin_token");

            if (adminToken) {
                try {
                    const tokenData = JSON.parse(atob(adminToken.split('.')[1]));
                    const adminId = tokenData.id;

                    if (adminId) {
                        formData.append('adminId', adminId.toString());

                        if (modalType === "add") {
                            await tourismApi.create(formData);
                            toast.success("تم إضافة المكان بنجاح");
                        } else if (selectedPlace) {
                            await tourismApi.update(selectedPlace.id, formData);
                            toast.success("تم تحديث المكان بنجاح");
                        }

                        setIsModalOpen(false);
                        setSelectedPlace(null);
                        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_PLACES });
                    } else {
                        toast.error("معرف المسؤول غير موجود");
                    }
                } catch (error) {
                    toast.error("حدث خطأ في معلومات المدير");
                }
            } else {
                toast.error("يجب تسجيل الدخول كمدير");
            }
        } catch (error) {
            console.error("Error submitting place:", error);
            toast.error("حدث خطأ أثناء حفظ المكان");
        }
    };

    return (
        <AdminLayout title="إدارة الأماكن السياحية">
            <div>
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold">إدارة الأماكن السياحية</h1>
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

                {/* Content */}
                {isLoading ? (
                    <div className="bg-white rounded-xl shadow-sm p-16 flex justify-center">
                        <div className="flex flex-col items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-2" />
                            <span className="text-gray-500">جاري تحميل البيانات...</span>
                        </div>
                    </div>
                ) : places.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <p className="text-xl font-bold mb-4">لا توجد أماكن سياحية</p>
                        <p className="text-gray-500 mb-6">
                            لم يتم إضافة أي أماكن سياحية بعد. يمكنك إضافة مكان جديد بالنقر على زر "إضافة مكان جديد".
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
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                                    {places.map((place) => (
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
                                                    {place.category}
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
                                                        onClick={() => handleDeleteClick(place.id)}
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
                    </div>
                )}

                {/* Place Modal */}
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
                    onSubmit={handleSubmit}
                    isLoading={false}
                />

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
            </div>
        </AdminLayout>
    );
} 