import { logout, selectUser } from "@/redux/reducers/userSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { motion } from "framer-motion";
import { LogIn, LogOut, MapPin, Menu, Shield, Star, User, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector(selectUser);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

    const handleLogout = () => {
        dispatch(logout());
        setIsUserMenuOpen(false);
    };

    return (
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-amber-100 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center">
                            <MapPin className="h-8 w-8 text-amber-600" />
                            <span className="text-xl font-bold text-amber-900 mr-2">وجهتي</span>
                        </Link>
                    </div>

                    {/* User Menu */}
                    <div className="hidden md:flex items-center">
                        {user ? (
                            <div className="relative">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={toggleUserMenu}
                                    className="flex items-center gap-2 text-amber-700 hover:text-amber-900 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    <User className="h-5 w-5" />
                                    <span>{user.name}</span>
                                </motion.button>

                                {isUserMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute left-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-amber-200 focus:outline-none"
                                    >
                                        <Link href="/my-reviews">
                                            <span className="block px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 cursor-pointer flex items-center">
                                                <Star className="h-4 w-4 ml-2" />
                                                تقييماتي
                                            </span>
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-right px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 flex items-center"
                                        >
                                            <LogOut className="h-4 w-4 ml-2" />
                                            تسجيل الخروج
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex items-center gap-1 text-amber-700 hover:text-amber-900 px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        <LogIn className="h-5 w-5" />
                                        دخول
                                    </motion.button>
                                </Link>
                                <Link href="/register">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        إنشاء حساب
                                    </motion.button>
                                </Link>
                                <Link href="/admin-login">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex items-center gap-1 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        <Shield className="h-5 w-5" />
                                        <span className="text-xs">المشرف</span>
                                    </motion.button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-amber-700 hover:text-amber-900 focus:outline-none"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="md:hidden"
                >
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/90">
                        {user ? (
                            <>
                                <Link href="/my-reviews">
                                    <span className="text-amber-700 hover:text-amber-900 block px-3 py-2 rounded-md text-base font-medium flex items-center">
                                        <Star className="h-5 w-5 ml-2" />
                                        تقييماتي
                                    </span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-amber-700 hover:text-amber-900 block w-full text-right px-3 py-2 rounded-md text-base font-medium flex items-center"
                                >
                                    <LogOut className="h-5 w-5 ml-2" />
                                    تسجيل الخروج
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col space-y-2 pt-2 border-t border-amber-100">
                                <Link href="/login">
                                    <span className="text-amber-700 hover:text-amber-900 block px-3 py-2 rounded-md text-base font-medium">
                                        تسجيل الدخول
                                    </span>
                                </Link>
                                <Link href="/register">
                                    <span className="bg-amber-600 hover:bg-amber-700 text-white block px-3 py-2 rounded-md text-base font-medium text-center">
                                        إنشاء حساب
                                    </span>
                                </Link>
                                <Link href="/admin-login">
                                    <span className="text-gray-500 hover:text-gray-700 flex items-center px-3 py-2 rounded-md text-base font-medium">
                                        <Shield className="h-5 w-5 ml-2" />
                                        صفحة المشرف
                                    </span>
                                </Link>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </header>
    );
};

export default Header; 