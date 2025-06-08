"use client";

import { AppDispatch } from "@/redux/store";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, LockKeyhole, AtSign, User } from "lucide-react";
import { loginUser, registerUser, selectAuthError, selectAuthStatus, selectUser } from "@/redux/reducers/userSlice";

const RegisterPage = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [formError, setFormError] = useState<string | null>(null);

    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const redirectInProgress = useRef(false);

    // Use the updated selectors
    const user = useSelector(selectUser);
    const status = useSelector(selectAuthStatus);
    const error = useSelector(selectAuthError);

    useEffect(() => {
        // Log current auth state
        console.log("Auth state in register:", { user, status, error });

        // If user is already logged in, redirect to home
        if (user && !redirectInProgress.current) {
            console.log("User already logged in, redirecting", user);
            redirectInProgress.current = true;
            router.push("/");
        }
    }, [user, router]);

    // Monitor status changes for redirection after registration
    useEffect(() => {
        console.log("Status or user changed:", status, user);
        if (status === "succeeded" && user && !redirectInProgress.current) {
            console.log("Registration successful, redirecting to home page");
            redirectInProgress.current = true;
            router.push("/");
        }
    }, [status, user, router]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);
        console.log("Submitting registration form:", name, email, password);

        // Validate passwords match
        if (password !== confirmPassword) {
            setFormError("كلمتا المرور غير متطابقتين");
            return;
        }

        try {
            // Register the user using the registerUser thunk
            const result = await dispatch(registerUser({ name, email, password }));
            console.log("Registration result:", result);

            // Force a redirect if the registration was successful
            if (result.meta.requestStatus === 'fulfilled' && !redirectInProgress.current) {
                console.log("Registration fulfilled, redirecting to home page");
                redirectInProgress.current = true;
                router.push("/");
            }
        } catch (err) {
            console.error("Registration error:", err);
            setFormError("حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة مرة أخرى");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[#f8f4ed] pattern-moroccan flex items-center justify-center p-4"
            dir="rtl"
        >
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl animate-blob" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-blob animation-delay-2000" />
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-100"
            >
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <MapPin className="h-10 w-10 text-amber-600 mx-auto" />
                    </Link>
                    <h1 className="text-2xl font-bold text-amber-900 mt-4">إنشاء حساب جديد</h1>
                    <p className="text-amber-700 mt-2">قم بإنشاء حساب للمشاركة بتقييماتك وتجاربك</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-amber-800 mb-1">
                            الاسم
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-amber-500">
                                <User className="h-5 w-5" />
                            </span>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full rounded-xl border-2 border-amber-100 px-4 py-3 pr-10 focus:border-amber-400 focus:ring focus:ring-amber-200 transition-all duration-200 bg-white/50"
                                placeholder="أدخل اسمك"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-amber-800 mb-1">
                            البريد الإلكتروني
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-amber-500">
                                <AtSign className="h-5 w-5" />
                            </span>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full rounded-xl border-2 border-amber-100 px-4 py-3 pr-10 focus:border-amber-400 focus:ring focus:ring-amber-200 transition-all duration-200 bg-white/50"
                                placeholder="أدخل بريدك الإلكتروني"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-amber-800 mb-1">
                            كلمة المرور
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-amber-500">
                                <LockKeyhole className="h-5 w-5" />
                            </span>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full rounded-xl border-2 border-amber-100 px-4 py-3 pr-10 focus:border-amber-400 focus:ring focus:ring-amber-200 transition-all duration-200 bg-white/50"
                                placeholder="أدخل كلمة المرور"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-amber-800 mb-1">
                            تأكيد كلمة المرور
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-amber-500">
                                <LockKeyhole className="h-5 w-5" />
                            </span>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full rounded-xl border-2 border-amber-100 px-4 py-3 pr-10 focus:border-amber-400 focus:ring focus:ring-amber-200 transition-all duration-200 bg-white/50"
                                placeholder="أعد إدخال كلمة المرور"
                            />
                        </div>
                    </div>

                    {(formError || error) && (
                        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                            {formError || error}
                        </div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {status === "loading" ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
                    </motion.button>

                    <div className="text-center mt-6">
                        <p className="text-amber-700">
                            لديك حساب بالفعل؟{" "}
                            <Link href="/login" className="text-amber-600 font-medium hover:text-amber-700">
                                تسجيل الدخول
                            </Link>
                        </p>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default RegisterPage; 