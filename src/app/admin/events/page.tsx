"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { EventModal } from "@/components/common/EventModal";
import { usePlaces } from "@/hooks/useCustomQuery";
import { Event, useCreateEvent, useDeleteEvent, useEvents, useUpdateEvent } from "@/hooks/useEvents";
import { formatDate } from "@/utils/dateUtils";
import { Calendar, Loader2, MapPin, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function EventsAdminPage() {
    // State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<"add" | "edit">("add");
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<number | null>(null);

    // Queries and mutations
    const { data: events = [], isLoading } = useEvents();
    const { data: places = [] } = usePlaces();
    const createEventMutation = useCreateEvent();
    const updateEventMutation = useUpdateEvent();
    const deleteEventMutation = useDeleteEvent();

    // Filter events based on search term
    const filteredEvents = events.filter(
        (event) =>
            event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle delete click
    const handleDeleteClick = (id: number) => {
        setEventToDelete(id);
        setIsConfirmDialogOpen(true);
    };

    // Confirm delete
    const confirmDelete = async () => {
        if (eventToDelete) {
            try {
                // Use mutateAsync to wait for completion
                await deleteEventMutation.mutateAsync(eventToDelete);

                // Close dialog and reset state after successful deletion
                setIsConfirmDialogOpen(false);
                setEventToDelete(null);
            } catch (error) {
                console.error("Delete operation failed:", error);
                // Dialog will remain open if delete fails, giving user chance to retry
            }
        }
    };

    // Cancel delete
    const cancelDelete = () => {
        setIsConfirmDialogOpen(false);
        setEventToDelete(null);
    };

    // Format event date for display
    const formatEventDate = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const startFormatted = formatDate(start);
        const endFormatted = formatDate(end);

        return `${startFormatted} - ${endFormatted}`;
    };

    // Get place name by ID
    const getPlaceName = (placeId: number) => {
        const place = places.find(p => p.id === placeId);
        return place ? place.name : "غير محدد";
    };

    return (
        <AdminLayout title="إدارة الفعاليات">
            <div>
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold">إدارة الفعاليات</h1>
                        <button
                            onClick={() => {
                                setModalType("add");
                                setSelectedEvent(null);
                                setIsModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                        >
                            <Plus className="w-5 h-5" />
                            إضافة فعالية جديدة
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="البحث في الفعاليات..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-3 rounded-lg border focus:border-purple-400 focus:ring focus:ring-purple-200 transition-all duration-200"
                        />
                    </div>
                </div>

                {/* Events Grid */}
                {isLoading || deleteEventMutation.isPending ? (
                    <div className="flex justify-center py-12">
                        <div className="flex flex-col items-center">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-2" />
                            <span className="text-gray-500">
                                {deleteEventMutation.isPending ? "جاري حذف الفعالية..." : "جاري تحميل البيانات..."}
                            </span>
                        </div>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto flex items-center justify-center mb-4">
                            <Calendar className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">لا توجد فعاليات</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            لم يتم العثور على أي فعاليات. يمكنك إضافة فعالية جديدة بالنقر على زر "إضافة فعالية جديدة".
                        </p>
                        <button
                            onClick={() => {
                                setModalType("add");
                                setSelectedEvent(null);
                                setIsModalOpen(true);
                            }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                        >
                            <Plus className="w-5 h-5" />
                            إضافة فعالية جديدة
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents.map((event) => (
                            <div
                                key={event.id}
                                className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-200"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={event.image || "/placeholder-event.jpg"}
                                        alt={event.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {/* Date Badge */}
                                    <div className="absolute top-3 right-3">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/90 shadow-sm">
                                            {formatEventDate(event.startDate, event.endDate)}
                                        </span>
                                    </div>

                                    {/* Hover Actions Overlay */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedEvent(event);
                                                setModalType("edit");
                                                setIsModalOpen(true);
                                            }}
                                            className="p-2 rounded-full bg-white text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors duration-200"
                                            title="تعديل الفعالية"
                                        >
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteClick(event.id);
                                            }}
                                            className="p-2 rounded-full bg-white text-rose-600 hover:bg-rose-600 hover:text-white transition-colors duration-200"
                                            title="حذف الفعالية"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-5">
                                    <h3 className="text-lg font-bold mb-2 line-clamp-1">{event.name}</h3>
                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{event.description}</p>

                                    <div className="flex justify-between items-center">
                                        <button
                                            onClick={() => {
                                                setSelectedEvent(event);
                                                setModalType("edit");
                                                setIsModalOpen(true);
                                            }}
                                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            عرض وتعديل
                                        </button>
                                        <div className="flex items-center text-xs text-gray-500">
                                            <MapPin className="w-3.5 h-3.5 ml-1" />
                                            <span className="truncate max-w-[100px]">
                                                {getPlaceName(event.tourismPlaceId)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Event Modal */}
            <EventModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    if (modalType === "add") {
                        setSelectedEvent(null);
                    }
                }}
                type={modalType}
                initialData={selectedEvent || undefined}
                places={places}
                onSubmit={async (formData) => {
                    try {
                        if (modalType === "add") {
                            await createEventMutation.mutateAsync(formData);
                        } else if (selectedEvent) {
                            await updateEventMutation.mutateAsync({
                                id: selectedEvent.id,
                                formData,
                            });
                        }
                        setIsModalOpen(false);
                    } catch (error) {
                        console.error("Error submitting event:", error);
                        toast.error("حدث خطأ أثناء حفظ الفعالية");
                    }
                }}
                isLoading={createEventMutation.isPending || updateEventMutation.isPending}
            />

            {/* Confirmation Dialog */}
            {isConfirmDialogOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full" dir="rtl">
                        <h3 className="text-xl font-bold mb-4">تأكيد الحذف</h3>
                        <p className="text-gray-600 mb-6">
                            هل أنت متأكد من رغبتك في حذف هذه الفعالية؟ لا يمكن التراجع عن هذا الإجراء.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                            >
                                نعم، حذف الفعالية
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
} 