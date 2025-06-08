"use client";

import { RootState } from "@/redux/store";
import { Review, TourismPlace } from "@/types/type";
import { apiClient } from "@/utils/axios";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectAccessToken, selectUser } from "@/redux/reducers/userSlice";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

interface ReviewWithPlace extends Review {
    place: TourismPlace;
}

const EditReviewPage = () => {
    const { id } = useParams();
    const reviewId = parseInt(id as string);

    const [review, setReview] = useState<ReviewWithPlace | null>(null);
    const [content, setContent] = useState("");
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const queryClient = useQueryClient();

    // Use the updated selectors
    const user = useSelector(selectUser);
    const accessToken = useSelector(selectAccessToken);

    useEffect(() => {
        // If user is not logged in, redirect to login
        if (!user || !accessToken) {
            router.push("/login");
            return;
        }

        const fetchReview = async () => {
            try {
                setIsLoading(true);
                const response = await apiClient.get<ReviewWithPlace>(`/reviews/${reviewId}`);

                // Log the response for debugging
                console.log('Review response:', response);

                // Since apiClient.get already returns response.data, we can use it directly
                if (!response || typeof response !== 'object' || !('id' in response)) {
                    console.error('Invalid review data format:', response);
                    setError("بيانات التقييم غير صالحة");
                    return;
                }

                const reviewData = response as ReviewWithPlace;

                // Check if the review belongs to the current user
                if (reviewData.userId !== user.id) {
                    setError("لا يمكنك تعديل تقييم لا ينتمي إليك");
                    return;
                }

                setReview(reviewData);
                setContent(reviewData.content);
                setRating(reviewData.rating);
            } catch (err) {
                console.error("Error fetching review:", err);
                setError("حدث خطأ أثناء جلب التقييم. يرجى المحاولة مرة أخرى.");
                toast.error("فشل في جلب بيانات التقييم");
            } finally {
                setIsLoading(false);
            }
        };

        fetchReview();
    }, [user, accessToken, router, reviewId]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            alert("يرجى اختيار تقييم من 1 إلى 5 نجوم");
            return;
        }

        if (!content.trim()) {
            alert("يرجى كتابة تعليق");
            return;
        }

        try {
            setIsSubmitting(true);
            // Ensure proper data types and remove userId since it's extracted from token
            await apiClient.patch(`/reviews/${reviewId}`, {
                content: content.trim(),
                rating: Number(rating)
            });

            // Show success toast
            toast.success("تم تحديث التقييم بنجاح");

            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
            queryClient.invalidateQueries({ queryKey: ["userReviews"] });
            queryClient.invalidateQueries({ queryKey: ["tourismPlace"] });
            queryClient.invalidateQueries({ queryKey: ["review", reviewId] });

            // Redirect to reviews page after successful update
            router.push("/my-reviews");
        } catch (err: any) {
            console.error("Error updating review:", err);
            setError("حدث خطأ أثناء تحديث التقييم. يرجى المحاولة مرة أخرى.");
            toast.error(err.response?.data?.message || "حدث خطأ أثناء تحديث التقييم");
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[#f8f4ed] pattern-moroccan"
            dir="rtl"
        >
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl animate-blob" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-blob animation-delay-2000" />
            </div>

            <div className="max-w-3xl mx-auto p-8 relative">
                <div className="flex items-center mb-6">
                    <Link href="/my-reviews">
                        <motion.button
                            whileHover={{ x: -3 }}
                            className="flex items-center text-amber-700 hover:text-amber-800 transition-colors"
                        >
                            <ArrowRight className="h-5 w-5 ml-1" />
                            <span>العودة لتقييماتي</span>
                        </motion.button>
                    </Link>
                </div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <h1 className="text-3xl font-bold text-amber-900 mb-2">تعديل التقييم</h1>
                    <p className="text-amber-700 mb-8">قم بتحديث تقييمك</p>
                </motion.div>

                {isLoading ? (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 animate-pulse shadow-xl border border-amber-100 h-64" />
                ) : error ? (
                    <div className="bg-red-50 text-red-700 p-6 rounded-2xl">
                        <p>{error}</p>
                        <div className="mt-4">
                            <Link href="/my-reviews">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                                >
                                    العودة لتقييماتي
                                </motion.button>
                            </Link>
                        </div>
                    </div>
                ) : review ? (
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-100">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-amber-900 mb-2">{review.place.name}</h2>
                            <p className="text-amber-700 text-sm">{review.place.category}</p>
                        </div>

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
                                    rows={5}
                                    className="w-full rounded-xl border-2 border-amber-100 px-4 py-3 focus:border-amber-400 focus:ring focus:ring-amber-200 transition-all duration-200 bg-white/50"
                                    placeholder="اكتب تعليقك هنا..."
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <Link href="/my-reviews">
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="px-6 py-2.5 text-amber-700 hover:text-amber-800 transition-colors"
                                    >
                                        إلغاء
                                    </motion.button>
                                </Link>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "جاري الحفظ..." : "حفظ التعديلات"}
                                </motion.button>
                            </div>
                        </form>
                    </div>
                ) : null}
            </div>
        </motion.div>
    );
};

export default EditReviewPage; 