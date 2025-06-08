import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    Upload,
    SlidersHorizontal,
    Loader2,
    MapPin,
    ImagePlus,
} from 'lucide-react';
import { PlaceModal } from '@/components/common/MapModal';
import { usePlaces } from '@/hooks/useCustomQuery';
import { tourismApi } from '@/utils/axios';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Cookies from 'js-cookie';

interface TourismPlace {
    id: number;
    name: string;
    description: string;
    category: string;
    expectedPeakTime: string;
    visitTimeRange?: string;
    latitude: number;
    longitude: number;
    coverImage: string;
    photos: { id: number; url: string }[];
    createdAt: string;
    updatedAt: string;
    adminId: number;
}

const schema = yup.object({
    name: yup.string().required("الاسم مطلوب"),
    description: yup.string().required("الوصف مطلوب"),
    latitude: yup.number().required("خط العرض مطلوب"),
    longitude: yup.number().required("خط الطول مطلوب"),
    coverImage: yup.mixed()
});

type FormInputs = yup.InferType<typeof schema>;

export default function PlacesTab() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [modalType, setModalType] = useState<"add" | "edit">("add");
    const [selectedPlace, setSelectedPlace] = useState<TourismPlace | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const queryClient = useQueryClient();
    const itemsPerPage = 6;

    // Form setup
    const { reset, setValue } = useForm({
        resolver: yupResolver(schema),
    });

    // Data fetching
    const { data: places = [], isLoading } = usePlaces();

    // Filter places
    const filteredPlaces = places.filter(
        (place) => place.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredPlaces.length / itemsPerPage);
    const currentPlaces = filteredPlaces.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Mutations
    const createPlaceMutation = useMutation({
        mutationFn: (formData: FormData) => tourismApi.create(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["places"] });
            setIsModalOpen(false);
            reset();
            toast.success("تم إنشاء المكان بنجاح");
        },
        onError: () => toast.error("فشل في إنشاء المكان"),
    });

    const updatePlaceMutation = useMutation({
        mutationFn: (data: { id: number; formData: FormData }) =>
            tourismApi.update(data.id, data.formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["places"] });
            setIsModalOpen(false);
            toast.success("تم تحديث المكان بنجاح");
        },
        onError: () => toast.error("فشل في تحديث المكان"),
    });

    const deletePlaceMutation = useMutation({
        mutationFn: tourismApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["places"] });
            toast.success("تم حذف المكان بنجاح");
        },
        onError: () => toast.error("فشل في حذف المكان"),
    });

    const handleDelete = (id: number) => {
        if (confirm("هل أنت متأكد أنك تريد حذف هذا المكان؟")) {
            deletePlaceMutation.mutate(id);
        }
    };

    // Category display
    const getCategoryLabel = (category: string) => {
        const categories = {
            'ARCHAEOLOGICAL': 'تاريخي/أثري',
            'RELIGIOUS': 'ديني',
            'ENTERTAINMENT': 'ترفيهي',
            'EDUCATIONAL': 'تعليمي',
            'RESTAURANT': 'مطاعم'
        };
        return categories[category as keyof typeof categories] || category;
    };

    return (
        <div>
            {/* Header with actions */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-2xl font-bold">الأماكن السياحية</h2>
                <button
                    onClick={() => {
                        setModalType("add");
                        reset();
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                >
                    <Plus className="w-5 h-5" />
                    إضافة مكان جديد
                </button>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-xl shadow-sm mb-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="relative flex-1 min-w-[240px]">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="البحث في الأماكن..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-2.5 rounded-lg border focus:border-purple-400 focus:ring focus:ring-purple-200 transition-all duration-200"
                        />
                    </div>

                    <button
                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${isFiltersOpen
                                ? "border-purple-400 bg-purple-50 text-purple-600"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                    >
                        <SlidersHorizontal className="w-5 h-5" />
                        <span>فلترة</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentPlaces.map((place) => (
                        <div
                            key={place.id}
                            className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-200"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={place.coverImage}
                                    alt={place.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                {/* Category badge */}
                                <div className="absolute top-3 right-3">
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/90 shadow-sm">
                                        {getCategoryLabel(place.category)}
                                    </span>
                                </div>

                                {/* Photos count */}
                                {place.photos.length > 0 && (
                                    <div className="absolute bottom-3 left-3">
                                        <span className="bg-black/60 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                                            <ImagePlus className="w-3 h-3" />
                                            {place.photos.length}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="p-5">
                                <h3 className="text-lg font-bold mb-2 line-clamp-1">{place.name}</h3>
                                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{place.description}</p>

                                <div className="flex justify-between items-center">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedPlace(place);
                                                setModalType("edit");
                                                Object.keys(place).forEach((key) =>
                                                    setValue(
                                                        key as keyof FormInputs,
                                                        place[key as keyof TourismPlace]
                                                    )
                                                );
                                                setIsModalOpen(true);
                                            }}
                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                        >
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(place.id)}
                                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <MapPin className="w-3.5 h-3.5 mr-1" />
                                        <span className="truncate max-w-[100px]">
                                            {place.latitude.toFixed(2)}, {place.longitude.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination - simplified */}
            {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                    <div className="flex gap-2">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-10 h-10 rounded-lg ${currentPage === i + 1
                                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                        : "border hover:bg-gray-50"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal */}
            <PlaceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                type={modalType}
                initialData={selectedPlace || undefined}
                onSubmit={async (formData) => {
                    // Get admin ID from JWT token
                    const adminToken = Cookies.get("admin_token");

                    if (adminToken) {
                        try {
                            const tokenData = JSON.parse(atob(adminToken.split('.')[1]));
                            const adminId = tokenData.id;

                            if (adminId) {
                                formData.append('adminId', adminId.toString());

                                if (modalType === "add") {
                                    await createPlaceMutation.mutateAsync(formData);
                                } else if (selectedPlace) {
                                    await updatePlaceMutation.mutateAsync({
                                        id: selectedPlace.id,
                                        formData,
                                    });
                                }
                            } else {
                                toast.error("معرف المسؤول غير موجود");
                            }
                        } catch (error) {
                            toast.error("حدث خطأ في معلومات المدير");
                        }
                    } else {
                        toast.error("يجب تسجيل الدخول كمدير");
                    }
                }}
                isLoading={createPlaceMutation.isPending || updatePlaceMutation.isPending}
            />
        </div>
    );
} 