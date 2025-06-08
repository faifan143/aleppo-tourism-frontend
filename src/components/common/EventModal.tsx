import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Loader2, Upload, X, Type, AlignLeft, Calendar } from "lucide-react";

const schema = yup.object({
    name: yup.string().required("الاسم مطلوب"),
    description: yup.string().required("الوصف مطلوب"),
    startDate: yup.date().required("تاريخ البدء مطلوب"),
    endDate: yup.date().required("تاريخ الانتهاء مطلوب")
        .min(yup.ref('startDate'), "تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء"),
    tourismPlaceId: yup.number().required("المكان السياحي مطلوب"),
    image: yup
        .mixed()
        .test("fileRequired", "صورة الفعالية مطلوبة", (value, context) => {
            if (context.parent.initialImage) {
                return true; // Valid if there's an initial image and no new value
            }
            return value instanceof FileList
                ? value.length > 0
                : value instanceof File;
        }),
});

type FormInputs = yup.InferType<typeof schema> & { initialImage?: string };

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FormData) => Promise<void>;
    type: "add" | "edit";
    initialData?: {
        name?: string;
        description?: string;
        startDate?: string | Date;
        endDate?: string | Date;
        tourismPlaceId?: number;
        image?: string;
    };
    isLoading?: boolean;
    places?: Array<{ id: number, name: string }>;
}

export function EventModal({
    isOpen,
    onClose,
    onSubmit,
    type,
    initialData,
    isLoading,
    places = []
}: EventModalProps) {
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset
    } = useForm<FormInputs>({
        resolver: yupResolver(schema),
    });

    useEffect(() => {
        if (initialData) {
            // For dates, ensure they're in the correct format for datetime-local input
            const formatDate = (date: string | Date | undefined) => {
                if (!date) return "";
                const d = new Date(date);
                return d.toISOString().substring(0, 16); // Format as YYYY-MM-DDTHH:MM
            };

            reset({
                name: initialData.name || "",
                description: initialData.description || "",
                startDate: formatDate(initialData.startDate) as any,
                endDate: formatDate(initialData.endDate) as any,
                tourismPlaceId: initialData.tourismPlaceId,
                initialImage: initialData.image,
            });

            // Set the preview image if image exists in initialData
            if (initialData.image) {
                setPreviewImage(initialData.image);
            }
        } else {
            reset({
                name: "",
                description: "",
                startDate: "" as any,
                endDate: "" as any,
                tourismPlaceId: undefined,
                image: undefined,
                initialImage: undefined,
            });
            setPreviewImage(null);
        }
    }, [initialData, reset, isOpen]);

    const handleFormSubmit = async (data: FormInputs) => {
        const formData = new FormData();

        // Add all fields to the form data
        Object.entries(data).forEach(([key, value]) => {
            if (key === "initialImage") return; // Skip this helper field

            if (key === "image" && value instanceof File) {
                formData.append(key, value);
            } else if (key === "startDate" || key === "endDate") {
                // Format dates properly
                if (value) {
                    const dateStr = typeof value === 'string' ? value : value.toISOString();
                    formData.append(key, dateStr);
                }
            } else if (value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        });

        await onSubmit(formData);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setPreviewImage(URL.createObjectURL(file)); // Set preview URL
            setValue("image", file); // Set the file in the form state
        }
    };

    return (
        <div
            className={`fixed inset-0 z-50 ${isOpen ? "pointer-events-auto" : "pointer-events-none opacity-0"
                }`}
        >
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isOpen ? 1 : 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="fixed inset-0 overflow-y-auto no-scrollbar max-h-[90vh]">
                <div className="flex min-h-full items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: isOpen ? 1 : 0.95, opacity: isOpen ? 1 : 0 }}
                        className="relative w-full max-w-2xl"
                    >
                        <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden overflow-y-auto no-scrollbar max-h[90vh]">
                            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6">
                                <h2 className="text-2xl font-bold text-white">
                                    {type === "add" ? "إضافة فعالية جديدة" : "تعديل الفعالية"}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="absolute left-4 top-4 p-2 rounded-full hover:bg-white/20 transition-colors text-white"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6">
                                <form
                                    onSubmit={handleSubmit(handleFormSubmit)}
                                    className="space-y-6"
                                >
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <div className="absolute right-3 top-9 text-gray-400">
                                                <Type className="w-5 h-5" />
                                            </div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                اسم الفعالية
                                            </label>
                                            <input
                                                {...register("name")}
                                                className="w-full pr-10 py-2 rounded-xl border-2 border-gray-100 focus:border-purple-400 focus:ring focus:ring-purple-200 transition-all duration-200"
                                            />
                                            {errors.name && (
                                                <motion.span
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-sm text-red-500 mt-1"
                                                >
                                                    {errors.name.message}
                                                </motion.span>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <div className="absolute right-3 top-9 text-gray-400">
                                                <AlignLeft className="w-5 h-5" />
                                            </div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                وصف الفعالية
                                            </label>
                                            <textarea
                                                {...register("description")}
                                                rows={4}
                                                className="w-full pr-10 py-2 rounded-xl border-2 border-gray-100 focus:border-purple-400 focus:ring focus:ring-purple-200 transition-all duration-200"
                                            />
                                            {errors.description && (
                                                <motion.span
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-sm text-red-500 mt-1"
                                                >
                                                    {errors.description.message}
                                                </motion.span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="relative">
                                                <div className="absolute right-3 top-9 text-gray-400">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    تاريخ البدء
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    {...register("startDate")}
                                                    className="w-full pr-10 py-2 rounded-xl border-2 border-gray-100 focus:border-purple-400 focus:ring focus:ring-purple-200 transition-all duration-200"
                                                />
                                                {errors.startDate && (
                                                    <motion.span
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-sm text-red-500 mt-1"
                                                    >
                                                        {errors.startDate.message}
                                                    </motion.span>
                                                )}
                                            </div>

                                            <div className="relative">
                                                <div className="absolute right-3 top-9 text-gray-400">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    تاريخ الانتهاء
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    {...register("endDate")}
                                                    className="w-full pr-10 py-2 rounded-xl border-2 border-gray-100 focus:border-purple-400 focus:ring focus:ring-purple-200 transition-all duration-200"
                                                />
                                                {errors.endDate && (
                                                    <motion.span
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-sm text-red-500 mt-1"
                                                    >
                                                        {errors.endDate.message}
                                                    </motion.span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                المكان السياحي
                                            </label>
                                            <select
                                                {...register("tourismPlaceId", { valueAsNumber: true })}
                                                className="w-full py-2 rounded-xl border-2 border-gray-100 focus:border-purple-400 focus:ring focus:ring-purple-200 transition-all duration-200"
                                            >
                                                <option value="">اختر المكان السياحي</option>
                                                {places.map((place) => (
                                                    <option key={place.id} value={place.id}>
                                                        {place.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.tourismPlaceId && (
                                                <motion.span
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-sm text-red-500 mt-1"
                                                >
                                                    {errors.tourismPlaceId.message}
                                                </motion.span>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                صورة الفعالية
                                            </label>
                                            <div className="mt-1 group relative cursor-pointer">
                                                <div className="relative border-2 border-dashed rounded-xl px-6 pt-5 pb-6 flex justify-center items-center bg-gray-50 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200">
                                                    <div className="space-y-2 text-center">
                                                        {previewImage ? (
                                                            <img
                                                                src={previewImage}
                                                                alt="Preview"
                                                                className="mx-auto h-32 w-32 object-cover rounded-lg"
                                                            />
                                                        ) : (
                                                            <Upload className="mx-auto h-12 w-12 text-gray-400 group-hover:text-purple-500 transition-colors duration-200" />
                                                        )}
                                                        <div className="flex text-sm text-gray-600">
                                                            <label className="relative cursor-pointer rounded-md font-medium text-purple-600 hover:text-purple-500">
                                                                <span>تحميل ملف</span>
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="sr-only"
                                                                    onChange={handleFileChange}
                                                                />
                                                            </label>
                                                            <p className="pr-2">أو اسحب وأسقط</p>
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            PNG، JPG بحد أقصى 10MB
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            {errors.image && (
                                                <motion.span
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-sm text-red-500 mt-1"
                                                >
                                                    {errors.image.message}
                                                </motion.span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-6 py-2.5 text-gray-700 hover:text-gray-900 transition-colors"
                                        >
                                            إلغاء
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 transition-all duration-200"
                                        >
                                            {isLoading && (
                                                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                            )}
                                            {type === "add" ? "إضافة الفعالية" : "حفظ التعديلات"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
} 