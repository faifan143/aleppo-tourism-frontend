import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Loader2, Upload, X, Type, AlignLeft } from "lucide-react";
import { MapPicker } from "./MapPicker";

const schema = yup.object({
  name: yup.string().required("الاسم مطلوب"),
  description: yup.string().required("الوصف مطلوب"),
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
    .test("fileRequired", "الصورة الرئيسية مطلوبة", (value, context) => {
      console.log(context.originalValue);

      if (context.originalValue) {
        return true; // Valid if there’s an initial cover image and no new value
      }
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormInputs>({
    resolver: yupResolver(schema),
    defaultValues: initialData,
  });

  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        setValue(key as keyof FormInputs, value);
      });
      // Set the preview image if coverImage exists in initialData
      if (initialData.coverImage) {
        setPreviewImage(initialData.coverImage);
      }
    }
  }, [initialData, setValue]);

  const handleFormSubmit = async (data: FormInputs) => {
    const formData = new FormData();

    console.log(data);

    // Compare with initial data and add only updated fields
    Object.entries(data).forEach(([key, value]) => {
      const initialValue = initialData
        ? initialData[key as keyof FormInputs]
        : undefined;

      if (key === "coverImage" && value instanceof File) {
        console.log("new file value:  : ", value);

        formData.append(key, value);
      } else if (value !== initialValue) {
        formData.append(key, value as string);
      }
    });

    await onSubmit(formData);
  };

  const handleMapChange = (lat: number, lng: number) => {
    setValue("latitude", lat);
    setValue("longitude", lng);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    console.log("file : ", file);

    if (file) {
      setPreviewImage(URL.createObjectURL(file)); // Set preview URL
      setValue("coverImage", file); // Set the file in the form state
    }
  };
  return (
    <div
      className={`fixed inset-0 z-50 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none opacity-0"
      }`}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm "
        onClick={onClose}
      />
      <div className="fixed inset-0 overflow-y-auto no-scrollbar max-h-[90vh]">
        <div className="flex min-h-full items-center justify-center p-4 ">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: isOpen ? 1 : 0.95, opacity: isOpen ? 1 : 0 }}
            className="relative w-full max-w-2xl"
          >
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden overflow-y-auto no-scrollbar max-h[90vh]">
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6">
                <h2 className="text-2xl font-bold text-white">
                  {type === "add" ? "إضافة مكان جديد" : "تعديل المكان"}
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
                        الاسم
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
                        الوصف
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

                    <MapPicker
                      latitude={watch("latitude")}
                      longitude={watch("longitude")}
                      onChange={handleMapChange}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الصورة الرئيسية
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
                      {errors.coverImage && (
                        <motion.span
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 mt-1"
                        >
                          {errors.coverImage.message}
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
                      {type === "add" ? "إضافة المكان" : "حفظ التعديلات"}
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
