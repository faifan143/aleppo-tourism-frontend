"use client";

import { Review, TourismPlace } from "@/types/type";
import { apiClient } from "@/utils/axios";
import { motion } from "framer-motion";
import { MapPin, Pencil, Star, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { selectAccessToken, selectUser } from "@/redux/reducers/userSlice";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

interface UserReview extends Review {
    place: TourismPlace;
}

const MyReviewsPage = () => {
    const [reviews, setReviews] = useState<UserReview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const queryClient = useQueryClient();

    // Use the correct selectors
    const user = useSelector(selectUser);
    const accessToken = useSelector(selectAccessToken);

    useEffect(() => {
        // If user is not logged in, redirect to login
        if (!user || !accessToken) {
            router.push("/login");
            return;
        }

        const fetchReviews = async () => {
            try {
                setIsLoading(true);
                // Fetch reviews for the current user
                const response = await apiClient.get<UserReview[]>(`/reviews/user/${user.id}`);

                // Log the response for debugging
                console.log('Reviews response:', response);

                // Since apiClient.get already returns response.data, we can use it directly
                // Just check if it's an array
                if (Array.isArray(response)) {
                    setReviews(response);
                } else {
                    // Fallback to an empty array if response format is unexpected
                    console.error('Unexpected response format, expected array:', response);
                    setReviews([]);
                }
            } catch (err) {
                console.error("Error fetching reviews:", err);
                setError("حدث خطأ أثناء جلب التقييمات. يرجى المحاولة مرة أخرى.");
                toast.error("فشل في جلب التقييمات");
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, [user, accessToken, router]);

    const handleDeleteReview = async (reviewId: number) => {
        if (!confirm("هل أنت متأكد من رغبتك في حذف هذا التقييم؟")) {
            return;
        }

        try {
            await apiClient.delete(`/reviews/${reviewId}`);
            console.log(`Successfully deleted review ${reviewId}`);

            // Show success toast
            toast.success("تم حذف التقييم بنجاح");

            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
            queryClient.invalidateQueries({ queryKey: ["userReviews"] });
            queryClient.invalidateQueries({ queryKey: ["tourismPlace"] });

            // Remove the deleted review from the state
            setReviews(reviews.filter(review => review.id !== reviewId));
        } catch (err: any) {
            console.error("Error deleting review:", err);
            toast.error(err.response?.data?.message || "حدث خطأ أثناء حذف التقييم");
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

            <div className="max-w-5xl mx-auto p-8 relative">
                <div className="flex items-center mb-6">
                    <Link href="/">
                        <motion.button
                            whileHover={{ x: -3 }}
                            className="flex items-center text-amber-700 hover:text-amber-800 transition-colors"
                        >
                            <ArrowRight className="h-5 w-5 ml-1" />
                            <span>العودة للرئيسية</span>
                        </motion.button>
                    </Link>
                </div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <h1 className="text-3xl font-bold text-amber-900 mb-2">تقييماتي</h1>
                    <p className="text-amber-700 mb-8">عرض وإدارة تقييماتك للأماكن السياحية</p>
                </motion.div>

                {isLoading ? (
                    <div className="grid gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 animate-pulse shadow-xl border border-amber-100 h-48"
                            />
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-700 p-6 rounded-2xl">
                        <p>{error}</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl border border-amber-100">
                        <Star className="h-12 w-12 mx-auto text-amber-400 mb-4" />
                        <h3 className="text-xl font-semibold text-amber-900 mb-2">لا توجد تقييمات حتى الآن</h3>
                        <p className="text-amber-700 mb-6">
                            لم تقم بإضافة أي تقييمات للأماكن السياحية بعد. تصفح الأماكن وشارك تجربتك!
                        </p>
                        <Link href="/">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                            >
                                تصفح الأماكن السياحية
                            </motion.button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {reviews.map((review) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-100"
                            >
                                <div className="flex justify-between mb-4">
                                    {review.place && review.place.id ? (
                                        <Link href={`/?placeId=${review.place.id}`}>
                                            <h3 className="text-xl font-bold text-amber-900 hover:text-amber-700 transition-colors">
                                                {review.place.name || "مكان غير معروف"}
                                            </h3>
                                        </Link>
                                    ) : (
                                        <h3 className="text-xl font-bold text-amber-900">
                                            مكان غير معروف
                                        </h3>
                                    )}
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-5 w-5 ${i < review.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <p className="text-amber-800 mb-4">{review.content}</p>

                                <div className="flex items-center justify-between text-sm text-amber-600">
                                    <div className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-1" />
                                        <span>{review.place?.category || "فئة غير معروفة"}</span>
                                    </div>
                                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>

                                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-amber-100">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => router.push(`/edit-review/${review.id}`)}
                                        className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleDeleteReview(review.id)}
                                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default MyReviewsPage; 