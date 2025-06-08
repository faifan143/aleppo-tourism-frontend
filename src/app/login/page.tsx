"use client";

import { loginUser, selectAuthError, selectAuthStatus, selectUser } from "@/redux/reducers/userSlice";
import { AppDispatch } from "@/redux/store";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, LockKeyhole, AtSign } from "lucide-react";

const LoginPage = () => {
    const [email, setEmail] = useState("user@example.com");
    const [password, setPassword] = useState("user123");
    const [loginError, setLoginError] = useState<string | null>(null);
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const redirectInProgress = useRef(false);

    // Use the updated selectors
    const user = useSelector(selectUser);
    const status = useSelector(selectAuthStatus);
    const error = useSelector(selectAuthError);

    useEffect(() => {
        // Log current auth state
        console.log("Auth state:", { user, status, error });

        if (user && !redirectInProgress.current) {
            console.log("User already logged in, redirecting", user);
            redirectInProgress.current = true;
            router.push("/");
        }
    }, [user, router]);

    useEffect(() => {
        console.log("Status or user changed:", status, user);
        if (status === "succeeded" && user && !redirectInProgress.current) {
            console.log("Login successful, redirecting to home page");
            redirectInProgress.current = true;
            router.push("/");
        }
    }, [status, user, router]);

    useEffect(() => {
        if (error) {
            setLoginError(error);
        }
    }, [error]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoginError(null);

        if (!email || !password) {
            setLoginError("الرجاء إدخال البريد الإلكتروني وكلمة المرور");
            return;
        }

        try {
            console.log("Submitting login form with:", email, password);
            const result = await dispatch(loginUser({ username: email, password }));
            console.log("Login result:", result);

            if (result.meta.requestStatus === 'fulfilled' && !redirectInProgress.current) {
                console.log("Login fulfilled, redirecting to home page");
                redirectInProgress.current = true;
                router.push("/");
            }
        } catch (err) {
            console.error("Login error:", err);
            setLoginError("حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة مرة أخرى");
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
                    <h1 className="text-2xl font-bold text-amber-900 mt-4">تسجيل الدخول</h1>
                    <p className="text-amber-700 mt-2">قم بتسجيل الدخول لإضافة تقييماتك والاطلاع على سجل زياراتك</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
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
                                className="w-full rounded-xl border-2 border-amber-100 px-4 py-3 pr-10 focus:border-amber-400 focus:ring focus:ring-amber-200 transition-all duration-200 bg-white/50"
                                placeholder="أدخل كلمة المرور"
                            />
                        </div>
                    </div>

                    {(error || loginError) && (
                        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                            {loginError || error}
                        </div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={status === "loading" || redirectInProgress.current}
                        className="w-full px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {status === "loading" ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                    </motion.button>

                    <div className="text-center mt-6">
                        <p className="text-amber-700">
                            ليس لديك حساب؟{" "}
                            <Link href="/register" className="text-amber-600 font-medium hover:text-amber-700">
                                إنشاء حساب جديد
                            </Link>
                        </p>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default LoginPage; 