import { RootState } from "@/redux/store";
import { apiClient } from "@/utils/axios";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useSelector } from "react-redux";
import { selectAccessToken, selectUser } from "@/redux/reducers/userSlice";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

interface AddReviewFormProps {
    tourismPlaceId: number;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const AddReviewForm = ({ tourismPlaceId, onSuccess, onCancel }: AddReviewFormProps) => {
    const [content, setContent] = useState("");
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const queryClient = useQueryClient();

    // Define a function to refresh the place data after submitting a review
    const refreshPlaceData = () => {
        console.log("Refreshing place data for ID:", tourismPlaceId);
        queryClient.invalidateQueries({ queryKey: ['tourism-place', tourismPlaceId] });
        queryClient.invalidateQueries({ queryKey: ['tourism-places'] });
    };

    // Use the updated selectors from userSlice
    const user = useSelector(selectUser);
    const accessToken = useSelector(selectAccessToken);

    // Log authentication state for debugging
    console.log("AddReviewForm - Auth state:", { user, accessToken });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!user || !accessToken) {
            console.log("User not logged in, redirecting to login page");
            router.push("/login");
            return;
        }

        if (rating === 0) {
            setError("يرجى اختيار تقييم من 1 إلى 5 نجوم");
            return;
        }

        if (!content.trim()) {
            setError("يرجى كتابة تعليق");
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            // Ensure all fields are properly typed
            const reviewData = {
                content: content.trim(),
                rating: Number(rating),
                tourismPlaceId: Number(tourismPlaceId)
            };

            console.log("Submitting review:", reviewData);

            // Submit without userId, as it will be extracted from the JWT token
            await apiClient.post("/reviews", reviewData);

            // Show success toast
            toast.success("تم إضافة التقييم بنجاح");

            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ['reviews', tourismPlaceId] });
            queryClient.invalidateQueries({ queryKey: ['userReviews'] });
            queryClient.invalidateQueries({ queryKey: ['tourismPlace', tourismPlaceId] });

            // Explicitly refresh the place data in the main page
            refreshPlaceData();

            setContent("");
            setRating(0);

            // Call the onSuccess callback if provided
            if (onSuccess) {
                console.log("Calling onSuccess callback after adding review");
                onSuccess();
            }
        } catch (err: any) {
            console.error("Error adding review:", err);
            setError(err.response?.data?.message || "حدث خطأ أثناء إضافة التقييم. يرجى المحاولة مرة أخرى.");
            toast.error(err.response?.data?.message || "حدث خطأ أثناء إضافة التقييم");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLoginClick = () => {
        console.log("Login button clicked, redirecting to /login");
        router.push("/login");
    };

    return (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-100">
            <h3 className="text-xl font-bold text-amber-900 mb-4">أضف تقييمك</h3>

            {!user ? (
                <div className="text-center p-4">
                    <p className="text-amber-700 mb-4">يجب عليك تسجيل الدخول لإضافة تقييم</p>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLoginClick}
                        className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                    >
                        تسجيل الدخول
                    </motion.button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-amber-800 mb-3">
                            التقييم
                        </label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <motion.button
                                    key={star}
                                    type="button"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none"
                                >
                                    <Star
                                        className={`h-8 w-8 ${star <= (hoveredRating || rating)
                                            ? "text-amber-500 fill-amber-500"
                                            : "text-gray-300"
                                            }`}
                                    />
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-amber-800 mb-2">
                            تعليقك
                        </label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            rows={4}
                            className="w-full rounded-xl border-2 border-amber-100 px-4 py-3 focus:border-amber-400 focus:ring focus:ring-amber-200 transition-all duration-200 bg-white/50"
                            placeholder="اكتب تعليقك هنا..."
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        {onCancel && (
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onCancel}
                                className="px-6 py-2.5 text-amber-700 hover:text-amber-800 transition-colors"
                            >
                                إلغاء
                            </motion.button>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "جاري الإرسال..." : "إرسال التقييم"}
                        </motion.button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default AddReviewForm; 