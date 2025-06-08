import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Loader2, Upload, X, Type, AlignLeft } from "lucide-react";
import { MapPicker } from "./MapPicker";
import { toast } from "react-hot-toast";
import { categoryOptions, translateCategory } from "@/utils/categoryTranslation";

const schema = yup.object({
  name: yup.string().required("الاسم مطلوب"),
  description: yup.string().required("الوصف مطلوب"),
  category: yup.string().required("التصنيف مطلوب"),
  expectedPeakTime: yup.string().required("وقت الذروة المتوقع مطلوب"),
  visitTimeStart: yup.string(),
  visitTimeEnd: yup.string(),
  visitTimeRange: yup.string(),
  latitude: yup
    .number()
    .required("خط العرض مطلوب")
    .min(-90, "خط العرض يجب أن يكون بين -90 و 90")
    .max(90, "خط العرض يجب أن يكون بين -90 و 90"),
  longitude: yup
    .number()
    .required("خط الطول مطلوب")
    .min(-180, "خط الطول يجب أن يكون بين -180 و 180")
    .max(180, "خط الطول يجب أن يكون بين -180 و 180"),
  coverImage: yup
    .mixed()
    .test("fileRequired", "الصورة الرئيسية مطلوبة", function (value) {
      // In edit mode, if there's already an image URL and no new file, it's valid
      if (this.parent.coverImage && typeof this.parent.coverImage === 'string') {
        return true;
      }

      // In add mode, require a file
      return value instanceof FileList
        ? value.length > 0
        : value instanceof File;
    }),
});

type FormInputs = yup.InferType<typeof schema>;

interface PlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  type: "add" | "edit";
  initialData?: {
    name?: string;
    description?: string;
    category?: string;
    expectedPeakTime?: string;
    visitTimeRange?: string;
    visitTimeStart?: string;
    visitTimeEnd?: string;
    latitude?: number;
    longitude?: number;
    coverImage?: string;
  };
  isLoading?: boolean;
}

export function PlaceModal({
  isOpen,
  onClose,
  onSubmit,
  type,
  initialData,
  isLoading,
}: PlaceModalProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const totalSteps = 3;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setValue,
    watch,
    trigger,
    reset,
  } = useForm<FormInputs>({
    resolver: yupResolver(schema),
    defaultValues: initialData,
    mode: "onChange"
  });

  // Clean up handler to properly close the modal
  const handleClose = () => {
    // Reset form state
    setActiveStep(1);
    // Call the parent's onClose
    onClose();
  };

  // Watch for time field changes
  const visitTimeStart = watch("visitTimeStart");
  const visitTimeEnd = watch("visitTimeEnd");

  useEffect(() => {
    if (visitTimeStart && visitTimeEnd) {
      setValue("visitTimeRange", `${visitTimeStart} - ${visitTimeEnd}`);
    }
  }, [visitTimeStart, visitTimeEnd, setValue]);

  // Reset form and active step when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Keep at step 1 for new places, but for editing we can have everything pre-filled
      setActiveStep(1);
      if (initialData) {
        // Reset form with initial data
        reset(initialData);

        // Parse visitTimeRange if it exists
        if (initialData.visitTimeRange) {
          const timeRangeParts = initialData.visitTimeRange.split('-').map(part => part.trim());
          if (timeRangeParts.length === 2) {
            setValue("visitTimeStart", timeRangeParts[0]);
            setValue("visitTimeEnd", timeRangeParts[1]);
          }
        }

        // Set the preview image if coverImage exists in initialData
        if (initialData.coverImage) {
          setPreviewImage(initialData.coverImage);
        }
      } else {
        // Reset form for new place
        reset();
        setPreviewImage(null);
      }
    }
  }, [isOpen, initialData, reset, setValue]);

  const handleFormSubmit = async (data: FormInputs) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();

      // Combine visitTimeStart and visitTimeEnd into visitTimeRange if both are present
      if (data.visitTimeStart && data.visitTimeEnd) {
        data.visitTimeRange = `${data.visitTimeStart} - ${data.visitTimeEnd}`;
      }

      // Compare with initial data and add only updated fields
      Object.entries(data).forEach(([key, value]) => {
        const initialValue = initialData
          ? initialData[key as keyof FormInputs]
          : undefined;

        // Skip the time start/end fields as they'll be combined into visitTimeRange
        if (key === "visitTimeStart" || key === "visitTimeEnd") {
          return;
        }
        // Handle image field
        else if (key === "coverImage" && value instanceof File) {
          formData.append(key, value);
        }
        // Handle other fields
        else if (value !== initialValue) {
          formData.append(key, value as string);
        }
      });

      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMapChange = (lat: number, lng: number) => {
    setValue("latitude", lat);
    setValue("longitude", lng);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setPreviewImage(URL.createObjectURL(file)); // Set preview URL
      setValue("coverImage", file); // Set the file in the form state
    }
  };

  const nextStep = async () => {
    // Validate fields in current step before proceeding
    let valid = false;

    if (activeStep === 1) {
      valid = await trigger(["name", "description", "category"]);
    } else if (activeStep === 2) {
      // Only validate expectedPeakTime as the other fields are optional
      valid = await trigger(["expectedPeakTime"]);

      // Also validate lat/long to ensure location is set
      const latitude = watch("latitude");
      const longitude = watch("longitude");

      if (!latitude || !longitude) {
        toast.error("يرجى تحديد موقع المكان على الخريطة");
        return;
      }
    }

    // Just navigate to next step without submitting data
    if (valid && activeStep < totalSteps) {
      // Do NOT submit data, only change the active step
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
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
        onClick={handleClose}
      />
      <div className="fixed inset-0 overflow-y-auto no-scrollbar max-h-[90vh]">
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: isOpen ? 1 : 0.95, opacity: isOpen ? 1 : 0 }}
            className="relative w-full max-w-2xl"
          >
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6">
                <h2 className="text-2xl font-bold text-white">
                  {type === "add" ? "إضافة مكان جديد" : "تعديل المكان"}
                </h2>
                <button
                  onClick={handleClose}
                  className="absolute left-4 top-4 p-2 rounded-full hover:bg-white/20 transition-colors text-white"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Progress Steps */}
                <div className="flex justify-center mt-4">
                  {Array.from({ length: totalSteps }).map((_, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${activeStep > index
                          ? "bg-green-400"
                          : activeStep === index + 1
                            ? "bg-white"
                            : "bg-white/40"
                          } transition-colors`}
                      />
                      {index < totalSteps - 1 && (
                        <div
                          className={`h-0.5 w-10 ${activeStep > index + 1
                            ? "bg-green-400"
                            : "bg-white/40"
                            } transition-colors`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (activeStep === totalSteps) {
                      handleSubmit(handleFormSubmit)();
                    }
                  }}
                  className="space-y-6"
                >
                  {activeStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-medium text-gray-900 mb-4">معلومات المكان الأساسية</h3>

                      <div className="relative">
                        <div className="absolute right-3 top-9 text-gray-400">
                          <Type className="w-5 h-5" />
                        </div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          الاسم
                        </label>
                        <input
                          {...register("name")}
                          className={`w-full pr-10 py-2.5 rounded-xl border-2 ${errors.name
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-100 focus:border-purple-400 focus:ring-purple-200"
                            } transition-all duration-200`}
                          placeholder="أدخل اسم المكان"
                        />
                        {errors.name && (
                          <motion.span
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-red-500 mt-1 block"
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
                          الوصف
                        </label>
                        <textarea
                          {...register("description")}
                          rows={4}
                          className={`w-full pr-10 py-2.5 rounded-xl border-2 ${errors.description
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-100 focus:border-purple-400 focus:ring-purple-200"
                            } transition-all duration-200`}
                          placeholder="أدخل وصفاً تفصيلياً للمكان"
                        />
                        {errors.description && (
                          <motion.span
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-red-500 mt-1 block"
                          >
                            {errors.description.message}
                          </motion.span>
                        )}
                      </div>

                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          التصنيف
                        </label>
                        <select
                          {...register("category")}
                          className={`w-full py-2.5 rounded-xl border-2 ${errors.category
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-100 focus:border-purple-400 focus:ring-purple-200"
                            } transition-all duration-200`}
                        >
                          <option value="">اختر التصنيف</option>
                          {categoryOptions?.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          )) || (
                              <>
                                <option value="ARCHAEOLOGICAL">تاريخي/أثري</option>
                                <option value="RELIGIOUS">ديني</option>
                                <option value="ENTERTAINMENT">ترفيهي</option>
                                <option value="EDUCATIONAL">تعليمي</option>
                                <option value="RESTAURANT">مطاعم</option>
                              </>
                            )}
                        </select>
                        {errors.category && (
                          <motion.span
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-red-500 mt-1 block"
                          >
                            {errors.category.message}
                          </motion.span>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {activeStep === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-medium text-gray-900 mb-4">معلومات الزيارة</h3>

                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          وقت الذروة المتوقع
                        </label>
                        <select
                          {...register("expectedPeakTime")}
                          className={`w-full py-2.5 rounded-xl border-2 ${errors.expectedPeakTime
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-100 focus:border-purple-400 focus:ring-purple-200"
                            } transition-all duration-200`}
                        >
                          <option value="">اختر وقت الذروة</option>
                          <option value="MORNING">الصباح</option>
                          <option value="AFTERNOON">بعد الظهر</option>
                          <option value="EVENING">المساء</option>
                          <option value="NIGHT">الليل</option>
                          <option value="WEEKEND">عطلة نهاية الأسبوع</option>
                        </select>
                        {errors.expectedPeakTime && (
                          <motion.span
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-red-500 mt-1 block"
                          >
                            {errors.expectedPeakTime.message}
                          </motion.span>
                        )}
                      </div>

                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          مدة الزيارة
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">من</label>
                            <input
                              type="time"
                              step="1800"
                              min="00:00"
                              max="23:59"
                              {...register("visitTimeStart")}
                              className="w-full py-2.5 rounded-xl border-2 border-gray-100 focus:border-purple-400 focus:ring focus:ring-purple-200 transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">إلى</label>
                            <input
                              type="time"
                              step="1800"
                              min="00:00"
                              max="23:59"
                              {...register("visitTimeEnd")}
                              className="w-full py-2.5 rounded-xl border-2 border-gray-100 focus:border-purple-400 focus:ring focus:ring-purple-200 transition-all duration-200"
                            />
                          </div>
                        </div>
                        <input
                          type="hidden"
                          {...register("visitTimeRange")}
                        />
                      </div>

                      <MapPicker
                        latitude={watch("latitude")}
                        longitude={watch("longitude")}
                        onChange={handleMapChange}
                      />
                      {(errors.latitude || errors.longitude) && (
                        <motion.span
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 mt-1 block"
                        >
                          يرجى تحديد موقع المكان على الخريطة
                        </motion.span>
                      )}
                    </motion.div>
                  )}

                  {activeStep === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-medium text-gray-900 mb-4">الصورة الرئيسية</h3>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          الصورة الرئيسية
                        </label>
                        <div className="mt-1 group relative cursor-pointer">
                          <div className={`relative border-2 border-dashed rounded-xl px-6 pt-5 pb-6 flex justify-center items-center bg-gray-50 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 ${errors.coverImage ? 'border-red-300' : ''}`}>
                            <div className="space-y-2 text-center">
                              {previewImage ? (
                                <div className="relative">
                                  <img
                                    src={previewImage}
                                    alt="Preview"
                                    className="mx-auto h-48 w-auto max-w-full object-cover rounded-lg"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPreviewImage(null);
                                      setValue("coverImage", undefined);
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <Upload className="mx-auto h-12 w-12 text-gray-400 group-hover:text-purple-500 transition-colors duration-200" />
                              )}
                              <div className="flex text-sm text-gray-600 justify-center">
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
                        {errors.coverImage && (
                          <motion.span
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-red-500 mt-1 block"
                          >
                            {errors.coverImage.message}
                          </motion.span>
                        )}
                      </div>

                      {/* Summary Section */}
                      {watch("name") && (
                        <div className="mt-6 bg-gray-50 p-4 rounded-xl">
                          <h4 className="font-medium text-gray-900 mb-2">ملخص المعلومات</h4>
                          <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-3 gap-2">
                              <div className="text-gray-500">الاسم:</div>
                              <div className="col-span-2 text-gray-900">{watch("name")}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="text-gray-500">التصنيف:</div>
                              <div className="col-span-2 text-gray-900">
                                {translateCategory ? translateCategory(watch("category") || "") : watch("category")}
                              </div>
                            </div>
                            {watch("visitTimeRange") && (
                              <div className="grid grid-cols-3 gap-2">
                                <div className="text-gray-500">مدة الزيارة:</div>
                                <div className="col-span-2 text-gray-900">{watch("visitTimeRange")}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  <div className="flex justify-between pt-4 border-t">
                    <button
                      type="button"
                      onClick={activeStep === 1 ? handleClose : prevStep}
                      className="px-6 py-2.5 text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      {activeStep === 1 ? "إلغاء" : "السابق"}
                    </button>

                    <div className="flex gap-3">
                      {activeStep < totalSteps ? (
                        <button
                          type="button"
                          onClick={nextStep}
                          className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                        >
                          التالي
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSubmit(handleFormSubmit)()}
                          disabled={isLoading || isSubmitting}
                          className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 transition-all duration-200"
                        >
                          {(isLoading || isSubmitting) && (
                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                          )}
                          {type === "add" ? "إضافة المكان" : "حفظ التعديلات"}
                        </button>
                      )}
                    </div>
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
